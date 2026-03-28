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

async function getNewsItems() {
  if (NEWS_PROVIDER !== 'newsapi' || !NEWS_API_KEY) {
    return { items: mockNews, provider: 'mock', usingFallback: true, error: 'News provider not configured' };
  }

  try {
    const url = `${NEWS_API_BASE_URL}/top-headlines?country=in&category=business&pageSize=8&apiKey=${encodeURIComponent(NEWS_API_KEY)}`;
    const payload = await fetchJson(url);
    const articles = Array.isArray(payload?.articles) ? payload.articles : [];

    const items = articles
      .filter(article => article?.title && article?.url)
      .map(article => ({
        source: article.source?.name || 'NewsAPI',
        title: trimText(article.title, 140),
        impact: article.description ? trimText(article.description, 120) : 'Market headline',
        url: article.url,
        publishedAt: article.publishedAt || null
      }));

    if (!items.length) throw new Error('No usable news articles returned');

    return { items, provider: 'newsapi', usingFallback: false, error: null };
  } catch (error) {
    return {
      items: mockNews,
      provider: 'mock',
      usingFallback: true,
      error: error instanceof Error ? error.message : 'Unknown news error'
    };
  }
}

function buildMockAiAnswer({ question, stock, newsItems }) {
  if (stock) {
    const headline = newsItems[0]?.title ? `Recent headline: ${newsItems[0].title}.` : '';
    return `${stock.name} (${stock.symbol}) currently shows a ${stock.view} setup in this demo. Price action is around ₹${stock.price}. ${stock.summary} ${headline} This answer is fallback-generated, so verify with live research before acting.`.trim();
  }

  return `Fallback answer: I couldn't reach the AI provider, but the question was: ${question || 'No question provided'}. Use the latest market overview and headlines before making any decision.`;
}

async function getGroundedAiAnswer({ question, symbol }) {
  const marketSnapshot = await fetchMarketSnapshots();
  const newsSnapshot = await getNewsItems();
  const stock = marketSnapshot.items.find(item => item.symbol === String(symbol || '').toUpperCase()) || null;

  const fallback = {
    answer: buildMockAiAnswer({ question, stock, newsItems: newsSnapshot.items }),
    confidence: stock ? 68 : 45,
    sources: newsSnapshot.items.map(item => ({ source: item.source, url: item.url })),
    provider: 'mock',
    usingFallback: true
  };

  if (!OPENAI_API_KEY) return fallback;

  try {
    const prompt = [
      'You are a concise market assistant for an Indian stocks demo app.',
      'Answer in plain English, keep it under 170 words, and do not give absolute financial advice.',
      'Use only the provided stock and news context. If context is thin, say so clearly.',
      '',
      `User question: ${question || 'No question provided'}`,
      `Selected symbol: ${symbol || 'None'}`,
      `Selected stock context: ${stock ? JSON.stringify(stock) : 'No matching stock found.'}`,
      `Recent news context: ${JSON.stringify(newsSnapshot.items.slice(0, 5))}`
    ].join('\n');

    const payload = {
      model: 'gpt-4.1-mini',
      input: prompt,
      max_output_tokens: 220
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
      confidence: stock ? 78 : 60,
      sources: newsSnapshot.items.map(item => ({ source: item.source, url: item.url })),
      provider: 'openai',
      usingFallback: false
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
  res.set('X-Provider', result.provider);
  res.set('X-Using-Fallback', String(result.usingFallback));
  if (result.error) res.set('X-Provider-Error', encodeURIComponent(result.error).slice(0, 180));
  res.json(result.items);
});

app.get('/api/stocks', async (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const snapshot = await fetchMarketSnapshots();
  const filtered = !q
    ? snapshot.items
    : snapshot.items.filter(stock =>
        stock.symbol.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q)
      );

  res.set('X-Provider', snapshot.provider);
  res.set('X-Using-Fallback', String(snapshot.usingFallback));
  if (snapshot.error) res.set('X-Provider-Error', encodeURIComponent(snapshot.error).slice(0, 180));
  res.json(filtered.map(formatStock));
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
