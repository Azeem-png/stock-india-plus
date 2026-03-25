# Product Plan - Stock India Plus

## Core promise
Explain the Indian stock market in simple language with real sources and AI-assisted reasoning.

## Main modules
- Home: market direction + reasons
- Tomorrow predictor: probabilistic outlook, not certainty
- Stock detail: performance, key news, fundamentals, technical snapshot
- AI analyst: answer user questions about any listed stock
- Language & theme settings
- Alerts/watchlist

## Key production architecture
1. Ingestion layer
   - pull news from licensed/allowed feeds
   - pull market data from approved APIs
   - corporate filings ingestion
2. Analysis layer
   - map events to sectors/stocks
   - generate reason graph for market up/down
   - compute confidence score
3. AI layer
   - RAG over trusted sources
   - answer with citations
   - strict anti-hallucination checks
4. Mobile app layer
   - Compose UI
   - offline cache
   - push alerts

## Important constraints
- Never say tomorrow will definitely go up/down
- Use probability bands and scenarios
- Show why recommendation changed
- Separate facts vs AI interpretation
- Always include timestamps and sources

## Example recommendation format
- Trend: Positive / Neutral / Negative
- Why: 3 bullet reasons
- Risks: 2 bullet risks
- Confidence: X%
- Sources: Reuters, exchange filing, quarterly results

## Recommended APIs to explore
- exchange-approved Indian market data vendors
- NewsAPI/GDELT for prototyping only if legally acceptable
- Polygon/Alpha Vantage/Twelve Data only if India coverage is sufficient
- LLM: OpenAI or on-prem retrieval-backed model
