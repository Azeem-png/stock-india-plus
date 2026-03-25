import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { marketOverview, news, stocks } from './data.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

function formatStock(stock) {
  return {
    ...stock,
    tradingViewUrl: `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(stock.tradingViewSymbol)}`
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: process.env.MARKET_DATA_PROVIDER || 'mock' });
});

app.get('/api/market/overview', (_req, res) => {
  res.json(marketOverview);
});

app.get('/api/news', (_req, res) => {
  res.json(news);
});

app.get('/api/stocks', (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const filtered = !q
    ? stocks
    : stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q)
      );
  res.json(filtered.map(formatStock));
});

app.get('/api/stocks/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = stocks.find(s => s.symbol === symbol);
  if (!stock) return res.status(404).json({ error: 'Stock not found' });
  res.json(formatStock(stock));
});

app.post('/api/ai/ask', (req, res) => {
  const { question = '', symbol = '' } = req.body || {};
  const stock = stocks.find(s => s.symbol === String(symbol).toUpperCase());
  const answer = stock
    ? `${stock.name} (${stock.symbol}) currently has a ${stock.view} stance in this demo. Main reason: ${stock.summary} This is a mock grounded response and should be upgraded with real-source RAG before production.`
    : `This is a mock AI response for question: ${question || 'No question provided'}. Connect OpenAI or another model with source-grounded retrieval before production.`;

  res.json({
    answer,
    confidence: stock ? 72 : 40,
    sources: news.map(item => ({ source: item.source, url: item.url }))
  });
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Stock India Plus mock API running on http://localhost:${port}`);
});
