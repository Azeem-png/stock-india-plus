package com.stockindiaplus.demo

/**
 * Android-only beta architecture notes for Stock India Plus.
 *
 * Suggested package split:
 * - data/model
 * - data/remote
 * - data/repository
 * - domain
 * - ui/home
 * - ui/stockdetail
 * - ui/settings
 * - ui/ai
 *
 * Suggested free/demo providers for beta experiments:
 * - Market/news: local mock API from stock-demo-app/server
 * - Later optional experimentation: Alpha Vantage / Twelve Data / GNews / NewsAPI
 *   (only if terms, limits, and India coverage are acceptable)
 *
 * Production reminder:
 * do not rely on free APIs for a real stock-news production app.
 */
object AndroidBetaArchitecture
