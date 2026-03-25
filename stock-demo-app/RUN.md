# Run the Prototype

## 1) Start mock API server
```bash
cd stock-demo-app/server
npm install
npm start
```
Server runs on: `http://localhost:8787`

## 2) Open the web app
Open this file in browser:
- `stock-demo-app/web/index.html`

Recommended: run a simple static server if browser blocks local fetches.
Example with Python:
```bash
cd stock-demo-app/web
python -m http.server 5500
```
Then open:
- `http://localhost:5500`

## What works now
- stock search
- selected stock details
- TradingView deep link
- market overview via mock API
- news feed via mock API
- AI ask endpoint via mock API
- language/theme settings in UI

## What still needs real integration
- licensed Indian market data API
- licensed news API / feed agreements
- real OpenAI-backed source-grounded AI answers
- authentication, persistence, watchlist, alerts
