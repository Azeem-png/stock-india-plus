package com.stockindiaplus.demo

data class MarketOverviewDto(
    val indexName: String,
    val value: Int,
    val changePercent: Double,
    val todayReason: String,
    val tomorrowOutlook: String,
    val confidence: Int,
    val quickSignals: QuickSignalsDto
)

data class QuickSignalsDto(
    val bias: String,
    val risk: String,
    val fiiFlow: String,
    val volatility: String
)

data class NewsDto(
    val source: String,
    val title: String,
    val impact: String,
    val url: String
)

data class StockDto(
    val symbol: String,
    val name: String,
    val exchange: String,
    val price: Double,
    val changePercent: Double,
    val marketCap: String,
    val pe: String,
    val sector: String,
    val view: String,
    val summary: String,
    val tradingViewSymbol: String,
    val tradingViewUrl: String
)

data class AiAskRequest(
    val question: String,
    val symbol: String
)

data class AiAskResponse(
    val answer: String,
    val confidence: Int,
    val sources: List<AiSource>
)

data class AiSource(
    val source: String,
    val url: String
)
