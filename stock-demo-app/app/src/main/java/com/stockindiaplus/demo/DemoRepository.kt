package com.stockindiaplus.demo

class DemoRepository {
    // Replace with Retrofit/Ktor in real Android beta build.

    fun getStocks(): List<StockInsight> = listOf(
        StockInsight("RELIANCE", "Reliance Industries", "₹2,948", "+1.82%", "Strong index weight, retail optimism, and stable energy sentiment are helping the stock.", "Watch / Gradual Buy"),
        StockInsight("TCS", "Tata Consultancy Services", "₹4,102", "-0.94%", "Near-term pressure is linked to global IT demand softness and margin commentary concerns.", "Hold"),
        StockInsight("HDFCBANK", "HDFC Bank", "₹1,672", "+2.11%", "Credit growth hopes and strength in private banks are driving improved sentiment.", "Positive Bias"),
        StockInsight("INFY", "Infosys", "₹1,628", "+0.36%", "Long-term quality remains strong, but short-term upside depends on deal wins and US demand recovery.", "Neutral to Positive")
    )
}
