# Stock India Plus Demo

A more complete prototype for an Indian stock intelligence app.

## What this project now includes
- Android UI concept in Kotlin Compose (`app/.../MainActivity.kt`)
- Android-style browser/mobile preview (`preview/index.html`)
- Runnable web prototype (`web/`)
- Local mock API server (`server/`)
- Search flow for stocks
- Stock detail panel
- TradingView deep links
- Settings flow for language + dark/light mode
- AI ask endpoint scaffold
- API integration plan for replacing mock data with real providers

## Current status
This project is now **prototype-ready**, not full production-ready.
You can run a local demo right now using the web app + mock server.

## Run locally
### 1. Start backend mock API
```bash
cd stock-demo-app/server
npm install
npm start
```

### 2. Start a static file server for the web app
Example using Python:
```bash
cd stock-demo-app/web
python -m http.server 5500
```
Then open:
- `http://localhost:5500`

Mock API will run on:
- `http://localhost:8787`

## Folder overview
- `app/` → Kotlin Compose demo screen
- `preview/` → standalone browser preview mockup
- `web/` → runnable frontend prototype
- `server/` → local Express mock API
- `RUN.md` → quick run steps
- `API_INTEGRATION_PLAN.md` → real API replacement plan
- `PRODUCT_PLAN.md` → product scope and module plan
- `ARCHITECTURE_NOTES.md` → technical direction

## Working features now
- stock search
- stock list filtering
- stock details view
- TradingView redirect button
- market overview card
- news highlights feed
- AI analyst ask flow (mock backend answer)
- language setting
- theme setting
- mobile-style UI presentation

## Not finished for production yet
These still need real implementation before launch:
- live Indian market data provider integration
- real licensed financial/news sources
- source-grounded AI with citations
- login/auth
- watchlist persistence
- alerts/notifications
- chart widgets inside app
- compliance/disclaimer layer
- refresh scheduling and caching

## Real data sources to explore later
- NSE India
- BSE India
- SEBI filings / corporate announcements
- Reuters / Bloomberg / Moneycontrol / ET Markets (only with valid usage/licensing)
- a proper India-capable market data vendor

## Important
Do **not** ship stock recommendations or tomorrow-market direction claims without:
- reliable sources
- timestamps
- confidence scoring
- disclaimers
- legal/compliance review
