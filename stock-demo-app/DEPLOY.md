# Deploy Guide - Stock India Plus

## Fastest deploy path
- Frontend: Vercel
- Backend API: Render

---

## 1) Deploy backend on Render
Project root for backend service:
- `stock-demo-app/server`

Recommended settings:
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`

Required environment variables:
- `MARKET_DATA_PROVIDER=twelvedata`
- `MARKET_DATA_API_KEY=...`
- `NEWS_PROVIDER=newsapi`
- `NEWS_API_KEY=...`
- `OPENAI_API_KEY=...`

Important note:
Current watchlist storage uses local JSON files. On many cloud hosts, local disk is not durable like a real database. So this deployment path is okay for demo/testing, but for stable production you should move watchlist data to a proper database.

Expected backend result:
- API base URL like `https://your-render-service.onrender.com/api`

---

## 2) Update frontend API base
Frontend is now production-config friendly.

It resolves API base in this order:
1. `window.STOCK_API_BASE`
2. `localStorage['stockDemoApiBase']`
3. fallback: current hostname with port `8787`

Examples:
- local fallback: `http://localhost:8787/api`
- production override: `https://your-render-service.onrender.com/api`

For production, the cleanest option is to define `window.STOCK_API_BASE` before loading `app.js`, or set `localStorage['stockDemoApiBase']` once.

---

## 3) Deploy frontend on Vercel
Project root for frontend deploy:
- `stock-demo-app`

This project includes:
- `vercel.json`

Goal:
- serve the `web/` folder as the frontend app

After deploy:
- open the Vercel URL
- confirm login screen opens first
- confirm stock search works
- confirm watchlist save/remove works
- confirm AI ask works
- confirm disclaimer is visible in app

---

## 4) Production test checklist
After both deploys, test:
- app opens correctly
- separate login screen works
- login with name enters app
- switch user works
- stock search works
- selected stock details load
- market overview loads
- news loads
- AI ask returns answer
- watchlist save works
- watchlist remove works
- user-wise watchlist separation works
- TradingView link opens
- disclaimer visible

---

## 5) Important production note
Still needed before public launch:
- privacy policy
- terms of use
- compliance/legal review
- better persistent production database
- stronger AI guardrails/citations

---

## 6) Recommended next technical improvement after deploy
Move watchlist storage from local JSON to a proper database.
Possible options:
- Supabase
- PostgreSQL
- Firebase
- MongoDB

For simplest serious next step, Supabase or PostgreSQL would be a good fit.
