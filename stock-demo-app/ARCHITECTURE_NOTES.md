# Rough Technical Architecture

## Android app
- Kotlin + Jetpack Compose
- Navigation Compose
- Hilt DI
- MVVM
- Retrofit / Ktor
- Room + DataStore

## Backend
- Node.js / FastAPI
- Scheduler for market open/close summaries
- Vector DB for source-grounded stock Q&A
- News classifier by stock/sector/theme
- Confidence scoring service

## AI safety layer
- answer only from retrieved evidence
- show 'insufficient evidence' when weak
- no guaranteed buy/sell claims
- mandatory source links
- timestamp every answer

## Demo roadmap
Phase 1: UI only
Phase 2: Connect mock JSON APIs
Phase 3: Real source ingestion
Phase 4: AI with citations
Phase 5: Watchlist + notifications
