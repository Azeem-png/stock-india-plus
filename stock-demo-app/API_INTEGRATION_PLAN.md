# API Integration Plan

## Ready endpoints in local mock server
- `GET /api/health`
- `GET /api/market/overview`
- `GET /api/news`
- `GET /api/stocks?q=`
- `GET /api/stocks/:symbol`
- `POST /api/ai/ask`

## Replace mock providers with real ones
1. Market data
   - connect an India-capable and legally allowed provider
   - map symbol, price, OHLC, volume, sector, valuation fields
2. News
   - ingest licensed feeds
   - store title, source, publishedAt, URL, stock tags
3. AI answers
   - retrieve trusted sources first
   - then call LLM
   - respond with citations + timestamps + confidence

## Guardrails
- no guaranteed up/down claims
- no guaranteed buy/sell language
- separate facts vs interpretation
- always show source attribution
- display confidence score and last updated time
