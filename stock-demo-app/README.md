# Stock India Plus Demo

Rough Android demo concept for an Indian stock intelligence app.

## Vision
A professional mobile app that explains:
- Why market is up/down today
- What may move the market tomorrow
- Real-source linked stock/news analysis
- AI chat for a particular stock
- Buy / hold / avoid style guidance with reasons and risk notes
- English / Hindi / Hinglish language toggle
- Dark / Light theme

## Demo Scope
This is a front-end demo scaffold with mock data and architecture notes.
Not financial advice. Not production-ready.

## Suggested stack
- Kotlin
- Jetpack Compose
- Material 3
- MVVM
- Retrofit
- Room
- DataStore
- Firebase/OneSignal optional

## Real data sources to integrate later
- NSE India
- BSE India
- SEBI filings / corporate announcements
- Moneycontrol / ET Markets / Reuters / Bloomberg links (subject to licensing)
- Screener / Tickertape style fundamentals sources
- OpenAI / local LLM + retrieval pipeline for AI answers

## Screens included in this demo
1. Home dashboard
2. Market explanation card
3. Tomorrow outlook card
4. Top movers list
5. Stock detail screen
6. AI analyst chat
7. Settings (language + theme)

## Important
For production, you will need:
- compliant market data licensing
- clear disclaimer system
- source attribution and timestamps
- confidence scoring
- hallucination guardrails for AI answers
- “not investment advice” messaging
