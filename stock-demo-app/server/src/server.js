import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { marketOverview as mockMarketOverview, news as mockNews, stocks as mockStocks } from './data.js';
import {
  addWatchlistSymbol,
  buildSession,
  normalizeSymbol,
  readWatchlistSymbols,
  removeWatchlistSymbol
} from './watchlistStore.js';

dotenv.config({ override: true });

const app = express();
app.use(cors());
app.use(express.json());

const MARKET_DATA_PROVIDER = (process.env.MARKET_DATA_PROVIDER || 'mock').toLowerCase();
const MARKET_DATA_API_KEY = process.env.MARKET_DATA_API_KEY || '';
const NEWS_PROVIDER = (process.env.NEWS_PROVIDER || 'mock').toLowerCase();
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const TRUSTED_NEWS_SOURCES = ['Reuters', 'Moneycontrol', 'CNBC', 'CNBC TV18', 'Economic Times', 'Business Standard', 'Mint'];

function formatStock(stock) {
  return {
    ...stock,
    tradingViewUrl: `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(stock.tradingViewSymbol)}`
  };
}

function toNumber(value, fallback = null) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function trimText(value, maxLength = 280) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSearchHaystacks(stock) {
  return [
    stock.symbol,
    stock.name,
    stock.sector,
    ...(Array.isArray(stock.aliases) ? stock.aliases : [])
  ].map(normalizeSearchText).filter(Boolean);
}

function scoreStockMatch(stock, query) {
  const q = normalizeSearchText(query);
  if (!q) return 1;

  const symbol = normalizeSearchText(stock.symbol);
  const name = normalizeSearchText(stock.name);
  const sector = normalizeSearchText(stock.sector);
  const aliases = Array.isArray(stock.aliases) ? stock.aliases.map(normalizeSearchText) : [];
  const tokens = q.split(' ').filter(Boolean);

  let score = 0;
  if (symbol === q) score += 200;
  if (aliases.includes(q)) score += 180;
  if (name === q) score += 160;
  if (symbol.startsWith(q)) score += 120;
  if (name.startsWith(q)) score += 100;
  if (aliases.some(alias => alias.startsWith(q))) score += 95;
  if (name.includes(q)) score += 70;
  if (aliases.some(alias => alias.includes(q))) score += 65;
  if (sector.includes(q)) score += 25;

  for (const token of tokens) {
    if (symbol.includes(token)) score += 28;
    if (name.includes(token)) score += 22;
    if (aliases.some(alias => alias.includes(token))) score += 20;
    if (sector.includes(token)) score += 8;
  }

  return score;
}

function searchStocks(items, query) {
  const q = normalizeSearchText(query);
  if (!q) return items;

  return items
    .map(stock => ({ stock, score: scoreStockMatch(stock, q), haystacks: getSearchHaystacks(stock) }))
    .filter(entry => entry.score > 0 || entry.haystacks.some(text => text.includes(q)))
    .sort((a, b) => b.score - a.score || a.stock.name.localeCompare(b.stock.name))
    .map(entry => entry.stock);
}

function buildMeta({ provider, usingFallback, error, itemCount, sourceQuality = null, weakContext = false }) {
  return {
    provider,
    usingFallback,
    error,
    itemCount,
    sourceQuality,
    weakContext,
    generatedAt: new Date().toISOString()
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}${body ? ` - ${body.slice(0, 200)}` : ''}`);
  }

  return response.json();
}

function buildTwelveDataSymbol(stock) {
  return `${stock.symbol}/NSE`;
}

async function fetchMarketSnapshots() {
  if (MARKET_DATA_PROVIDER !== 'twelvedata' || !MARKET_DATA_API_KEY) {
    return { items: mockStocks, provider: 'mock', usingFallback: true, error: 'Market provider not configured' };
  }

  try {
    const symbols = mockStocks.map(buildTwelveDataSymbol).join(',');
    const quoteUrl = `${TWELVE_DATA_BASE_URL}/quote?symbol=${encodeURIComponent(symbols)}&apikey=${encodeURIComponent(MARKET_DATA_API_KEY)}`;
    const quotesPayload = await fetchJson(quoteUrl);

    const quoteMap = mockStocks.reduce((acc, stock) => {
      const key = buildTwelveDataSymbol(stock);
      const quote = quotesPayload?.[key];
      if (quote && !quote.code) acc[stock.symbol] = quote;
      return acc;
    }, {});

    const items = mockStocks.map(stock => {
      const quote = quoteMap[stock.symbol] || {};
      const currentPrice = toNumber(quote.close ?? quote.price, stock.price);
      const previousClose = toNumber(quote.previous_close, null);
      const percentChange = toNumber(
        quote.percent_change,
        previousClose && currentPrice ? ((currentPrice - previousClose) / previousClose) * 100 : stock.changePercent
      );

      return {
        ...stock,
        price: currentPrice,
        changePercent: Number((percentChange ?? stock.changePercent).toFixed(2)),
        open: toNumber(quote.open, null),
        high: toNumber(quote.high, null),
        low: toNumber(quote.low, null),
        previousClose,
        volume: toNumber(quote.volume, null),
        currency: quote.currency || 'INR',
        fetchedAt: new Date().toISOString()
      };
    });

    return { items, provider: 'twelvedata', usingFallback: false, error: null };
  } catch (error) {
    return {
      items: mockStocks,
      provider: 'mock',
      usingFallback: true,
      error: error instanceof Error ? error.message : 'Unknown market data error'
    };
  }
}

async function fetchIndexQuote() {
  if (MARKET_DATA_PROVIDER !== 'twelvedata' || !MARKET_DATA_API_KEY) return null;

  try {
    const symbol = '^NSEI';
    const url = `${TWELVE_DATA_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(MARKET_DATA_API_KEY)}`;
    const payload = await fetchJson(url);
    if (!payload || payload.code) return null;

    const value = toNumber(payload.close ?? payload.price, null);
    const previousClose = toNumber(payload.previous_close, null);
    const changePercent = toNumber(
      payload.percent_change,
      previousClose && value ? ((value - previousClose) / previousClose) * 100 : null
    );

    if (value === null || changePercent === null) return null;

    return {
      value,
      changePercent: Number(changePercent.toFixed(2))
    };
  } catch {
    return null;
  }
}

function buildOverviewFromStocks(stocks) {
  const gainers = stocks.filter(stock => stock.changePercent > 0).length;
  const avgMove = stocks.length
    ? stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length
    : mockMarketOverview.changePercent;
  const strongest = [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  const weakest = [...stocks].sort((a, b) => a.changePercent - b.changePercent)[0];

  const bias = avgMove > 0.5 ? 'Positive' : avgMove < -0.5 ? 'Negative' : 'Mixed';
  const volatility = Math.abs(avgMove) > 1.5 ? 'Elevated' : 'Controlled';
  const risk = gainers >= Math.ceil(stocks.length / 2) ? 'Medium' : 'Medium-High';

  return {
    ...mockMarketOverview,
    changePercent: Number(avgMove.toFixed(2)),
    todayReason: strongest && weakest
      ? `${strongest.name} is leading among tracked names while ${weakest.name} is lagging. Breadth is ${gainers}/${stocks.length} stocks in green.`
      : mockMarketOverview.todayReason,
    tomorrowOutlook: bias === 'Positive'
      ? 'Tracked large caps still lean constructive, but watch global risk sentiment and early banking/IT follow-through.'
      : bias === 'Negative'
        ? 'Setup looks cautious for the next session unless global cues improve and heavyweight stocks stabilize.'
        : 'Bias is mixed for the next session; index direction will likely depend on heavyweight banking and IT names.',
    confidence: Math.min(82, Math.max(55, 58 + Math.round(Math.abs(avgMove) * 8))),
    quickSignals: {
      bias,
      risk,
      fiiFlow: avgMove >= 0 ? 'Improving' : 'Watchful',
      volatility
    }
  };
}

async function getMarketOverview() {
  const snapshot = await fetchMarketSnapshots();
  const overview = buildOverviewFromStocks(snapshot.items);
  const indexQuote = await fetchIndexQuote();

  return {
    ...overview,
    value: indexQuote?.value ?? mockMarketOverview.value,
    changePercent: indexQuote?.changePercent ?? overview.changePercent,
    provider: snapshot.provider,
    usingFallback: snapshot.usingFallback,
    error: snapshot.error
  };
}

function mapNewsItem(article, { usingFallback }) {
  const source = trimText(article.source?.name || article.source || 'Unknown source', 60);
  const isTrusted = TRUSTED_NEWS_SOURCES.some(name => source.toLowerCase().includes(name.toLowerCase()));
  const title = trimText(article.title, 140) || (usingFallback ? 'Demo headline only' : 'Untitled headline');
  const description = trimText(article.description || article.impact, 140);

  return {
    source,
    sourceLabel: usingFallback ? `Demo / fallback item - ${source}` : source,
    title,
    impact: usingFallback
      ? (description || 'Demo item shown because live news is unavailable or low-confidence.')
      : (description || 'Business or market headline'),
    url: article.url || 'https://www.nseindia.com/',
    publishedAt: article.publishedAt || null,
    isFallback: usingFallback,
    trustNote: usingFallback
      ? 'This is clearly marked fallback content for demo continuity. Do not treat it as live verified news.'
      : isTrusted
        ? 'Recognized business/news source.'
        : 'Source may be less established. Verify before relying on it.'
  };
}

async function getNewsItems() {
  if (NEWS_PROVIDER !== 'newsapi' || !NEWS_API_KEY) {
    const items = mockNews.map(item => mapNewsItem(item, { usingFallback: true }));
    return {
      items,
      provider: 'mock',
      usingFallback: true,
      error: 'News provider not configured',
      sourceQuality: 'fallback'
    };
  }

  try {
    const url = `${NEWS_API_BASE_URL}/top-headlines?country=in&category=business&pageSize=8&apiKey=${encodeURIComponent(NEWS_API_KEY)}`;
    const payload = await fetchJson(url);
    const articles = Array.isArray(payload?.articles) ? payload.articles : [];

    const items = articles
      .filter(article => article?.title && article?.url)
      .map(article => mapNewsItem(article, { usingFallback: false }));

    if (!items.length) throw new Error('No usable news articles returned');

    const trustedCount = items.filter(item => item.trustNote === 'Recognized business/news source.').length;
    const sourceQuality = trustedCount >= Math.ceil(items.length / 2) ? 'mixed-to-good' : 'mixed';

    return { items, provider: 'newsapi', usingFallback: false, error: null, sourceQuality };
  } catch (error) {
    const items = mockNews.map(item => mapNewsItem(item, { usingFallback: true }));
    return {
      items,
      provider: 'mock',
      usingFallback: true,
      error: error instanceof Error ? error.message : 'Unknown news error',
      sourceQuality: 'fallback'
    };
  }
}

function buildMockAiAnswer({ question, stock, newsItems, weakContext }) {
  const lines = [];

  if (stock) {
    lines.push(`${stock.name} (${stock.symbol}) is currently shown around ₹${stock.price} with move ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}% in this app.`);
    lines.push(`Current app view: ${stock.view}. Core reason in app data: ${stock.summary}`);
  } else {
    lines.push('I could not match the question to a stronger live stock context inside this app.');
  }

  if (newsItems[0]) {
    lines.push(`Latest available headline here: ${newsItems[0].title} (${newsItems[0].sourceLabel}).`);
  }

  if (question) {
    lines.push(`Question received: "${trimText(question, 120)}".`);
  }

  lines.push(weakContext
    ? 'Context is weak right now, so treat this as a cautious summary only and verify with official filings or a trusted financial source.'
    : 'This is still a fallback summary, not investment advice. Verify before acting.');

  return lines.join(' ');
}

async function getGroundedAiAnswer({ question, symbol }) {
  const marketSnapshot = await fetchMarketSnapshots();
  const newsSnapshot = await getNewsItems();
  const stock = marketSnapshot.items.find(item => item.symbol === String(symbol || '').toUpperCase()) || null;
  const weakContext = marketSnapshot.usingFallback || newsSnapshot.usingFallback || !stock || newsSnapshot.items.length < 2;

  const fallback = {
    answer: buildMockAiAnswer({ question, stock, newsItems: newsSnapshot.items, weakContext }),
    confidence: weakContext ? 34 : stock ? 62 : 40,
    sources: newsSnapshot.items.slice(0, 5).map(item => ({ source: item.sourceLabel, url: item.url, trustNote: item.trustNote })),
    provider: 'mock',
    usingFallback: true,
    weakContext
  };

  if (!OPENAI_API_KEY) return fallback;

  try {
    const prompt = [
      'You are a careful Indian market assistant inside a stock demo app.',
      'Goal: be useful, grounded, and restrained.',
      'Rules:',
      '- Use only the provided context.',
      '- If the context is weak, incomplete, or fallback-based, say that clearly in the first 1-2 sentences.',
      '- Do not invent catalysts, targets, or certainty.',
      '- Do not say buy/sell with confidence. Use cautious language like watch / monitor / verify.',
      '- Keep the answer under 140 words.',
      '- Prefer: what is known now, what is unclear, and what the user should verify next.',
      '',
      `User question: ${question || 'No question provided'}`,
      `Selected symbol: ${symbol || 'None'}`,
      `Weak context flag: ${weakContext ? 'yes' : 'no'}`,
      `Market provider: ${marketSnapshot.provider}`,
      `News provider: ${newsSnapshot.provider}`,
      `Selected stock context: ${stock ? JSON.stringify(stock) : 'No matching stock found.'}`,
      `News context: ${JSON.stringify(newsSnapshot.items.slice(0, 4))}`
    ].join('\n');

    const payload = {
      model: 'gpt-4.1-mini',
      input: prompt,
      max_output_tokens: 180
    };

    const response = await fetchJson(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const answer = response?.output_text?.trim();
    if (!answer) throw new Error('OpenAI returned empty output');

    return {
      answer,
      confidence: weakContext ? 52 : stock ? 76 : 58,
      sources: newsSnapshot.items.slice(0, 5).map(item => ({ source: item.sourceLabel, url: item.url, trustNote: item.trustNote })),
      provider: 'openai',
      usingFallback: false,
      weakContext
    };
  } catch {
    return fallback;
  }
}

function getUserFromRequest(req) {
  return req.query.user ?? req.query.name ?? req.body?.user;
}

async function getWatchlistResult(userName) {
  const [symbols, snapshot] = await Promise.all([readWatchlistSymbols(userName), fetchMarketSnapshots()]);
  const session = buildSession(userName);
  const items = symbols
    .map(symbol => snapshot.items.find(stock => stock.symbol === symbol))
    .filter(Boolean)
    .map(formatStock);

  return {
    user: session.user,
    symbols,
    items,
    provider: snapshot.provider,
    usingFallback: snapshot.usingFallback,
    error: snapshot.error
  };
}

app.get('/api/health', async (_req, res) => {
  const marketConfigured = MARKET_DATA_PROVIDER === 'twelvedata' && Boolean(MARKET_DATA_API_KEY);
  const newsConfigured = NEWS_PROVIDER === 'newsapi' && Boolean(NEWS_API_KEY);
  const aiConfigured = Boolean(OPENAI_API_KEY);

  res.json({
    ok: true,
    marketDataProvider: marketConfigured ? 'twelvedata' : 'mock',
    newsProvider: newsConfigured ? 'newsapi' : 'mock',
    aiProvider: aiConfigured ? 'openai' : 'mock',
    configured: {
      marketData: marketConfigured,
      news: newsConfigured,
      ai: aiConfigured
    }
  });
});

app.get('/api/session', (req, res) => {
  const session = buildSession(req.query.name);
  res.json(session);
});

app.get('/api/market/overview', async (_req, res) => {
  const overview = await getMarketOverview();
  res.json(overview);
});

app.get('/api/news', async (_req, res) => {
  const result = await getNewsItems();
  const meta = buildMeta({
    provider: result.provider,
    usingFallback: result.usingFallback,
    error: result.error,
    itemCount: result.items.length,
    sourceQuality: result.sourceQuality,
    weakContext: result.usingFallback
  });

  res.set('X-Provider', result.provider);
  res.set('X-Using-Fallback', String(result.usingFallback));
  if (result.error) res.set('X-Provider-Error', encodeURIComponent(result.error).slice(0, 180));
  res.json({ items: result.items, meta });
});

app.get('/api/stocks', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const snapshot = await fetchMarketSnapshots();
  const filtered = searchStocks(snapshot.items, q);
  const meta = buildMeta({
    provider: snapshot.provider,
    usingFallback: snapshot.usingFallback,
    error: snapshot.error,
    itemCount: filtered.length
  });

  res.set('X-Provider', snapshot.provider);
  res.set('X-Using-Fallback', String(snapshot.usingFallback));
  if (snapshot.error) res.set('X-Provider-Error', encodeURIComponent(snapshot.error).slice(0, 180));
  res.json({ items: filtered.map(formatStock), meta });
});

app.get('/api/stocks/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const snapshot = await fetchMarketSnapshots();
  const stock = snapshot.items.find(item => item.symbol === symbol);

  if (!stock) {
    return res.status(404).json({ error: 'Stock not found' });
  }

  res.json({
    ...formatStock(stock),
    provider: snapshot.provider,
    usingFallback: snapshot.usingFallback,
    error: snapshot.error
  });
});

app.get('/api/watchlist', async (req, res) => {
  const result = await getWatchlistResult(getUserFromRequest(req));
  res.set('X-Provider', result.provider);
  res.set('X-Using-Fallback', String(result.usingFallback));
  if (result.error) res.set('X-Provider-Error', encodeURIComponent(result.error).slice(0, 180));
  res.json(req.query.user || req.query.name ? result : result.items);
});

app.post('/api/watchlist', async (req, res) => {
  const symbol = normalizeSymbol(req.body?.symbol);
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  const session = buildSession(req.body?.user);
  if (!session.isValid) {
    return res.status(400).json({ error: 'User is required' });
  }

  const snapshot = await fetchMarketSnapshots();
  const stock = snapshot.items.find(item => item.symbol === symbol);
  if (!stock) {
    return res.status(404).json({ error: 'Stock not found' });
  }

  await addWatchlistSymbol(symbol, session.user);
  const result = await getWatchlistResult(session.user);
  res.status(201).json(result);
});

app.delete('/api/watchlist/:symbol', async (req, res) => {
  const session = buildSession(req.query.user);
  if (!session.isValid) {
    return res.status(400).json({ error: 'User is required' });
  }

  await removeWatchlistSymbol(req.params.symbol, session.user);
  const result = await getWatchlistResult(session.user);
  res.json(result);
});

app.post('/api/ai/ask', async (req, res) => {
  const { question = '', symbol = '' } = req.body || {};
  const result = await getGroundedAiAnswer({ question, symbol });
  res.json(result);
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Stock India Plus API running on http://localhost:${port}`);
});
