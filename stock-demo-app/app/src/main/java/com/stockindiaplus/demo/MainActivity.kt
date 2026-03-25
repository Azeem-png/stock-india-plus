package com.stockindiaplus.demo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StockIndiaPlusDemoApp()
        }
    }
}

enum class AppLanguage { ENGLISH, HINDI, HINGLISH }
enum class AppTheme { LIGHT, DARK }

data class NewsItem(val source: String, val title: String, val impact: String)
data class StockInsight(
    val symbol: String,
    val name: String,
    val price: String,
    val change: String,
    val summary: String,
    val verdict: String
)

@Composable
fun StockIndiaPlusDemoApp() {
    var language by remember { mutableStateOf(AppLanguage.HINGLISH) }
    var themeMode by remember { mutableStateOf(AppTheme.DARK) }

    MaterialTheme(colorScheme = if (themeMode == AppTheme.DARK) darkColorScheme() else lightColorScheme()) {
        Surface(modifier = Modifier.fillMaxSize()) {
            DashboardScreen(
                language = language,
                themeMode = themeMode,
                onLanguageChange = { language = it },
                onThemeChange = { themeMode = it }
            )
        }
    }
}

@Composable
fun DashboardScreen(
    language: AppLanguage,
    themeMode: AppTheme,
    onLanguageChange: (AppLanguage) -> Unit,
    onThemeChange: (AppTheme) -> Unit
) {
    val news = listOf(
        NewsItem("Reuters", "Banking stocks gained after RBI liquidity comfort signals", "Positive for Bank Nifty"),
        NewsItem("Moneycontrol", "IT stocks slipped on weak global tech cues", "Negative for Nifty IT"),
        NewsItem("NSE Filing", "Large cap company announced capex expansion", "Stock-specific positive")
    )

    val stocks = listOf(
        StockInsight("RELIANCE", "Reliance Industries", "₹2,948", "+1.82%", "Energy + retail optimism, strong index weight support.", "Watch / Gradual Buy"),
        StockInsight("TCS", "Tata Consultancy Services", "₹4,102", "-0.94%", "Margin concern and soft global IT demand sentiment.", "Hold"),
        StockInsight("HDFCBANK", "HDFC Bank", "₹1,672", "+2.11%", "Private banks outperformed on credit growth hopes.", "Positive Bias")
    )

    val title = when (language) {
        AppLanguage.ENGLISH -> "Stock India Plus"
        AppLanguage.HINDI -> "स्टॉक इंडिया प्लस"
        AppLanguage.HINGLISH -> "Stock India Plus"
    }

    val marketReason = when (language) {
        AppLanguage.ENGLISH -> "Market is up mainly because banking stocks are strong, crude is stable, and foreign sentiment improved. IT weakness is limiting gains."
        AppLanguage.HINDI -> "मार्केट ऊपर है क्योंकि बैंकिंग स्टॉक्स मजबूत हैं, कच्चे तेल में स्थिरता है और विदेशी सेंटीमेंट बेहतर हुआ है। आईटी सेक्टर कमजोरी से बढ़त सीमित है।"
        AppLanguage.HINGLISH -> "Market upar hai mainly kyunki banking stocks strong hain, crude stable hai, aur foreign sentiment improve hua hai. IT weakness gains ko limit kar rahi hai."
    }

    val tomorrowOutlook = when (language) {
        AppLanguage.ENGLISH -> "Tomorrow bias: mildly positive, but dependent on global cues, FII flow, overnight US market, and any RBI/government headline."
        AppLanguage.HINDI -> "कल का रुझान: हल्का पॉजिटिव, लेकिन यह ग्लोबल संकेतों, एफआईआई फ्लो, अमेरिकी बाजार और RBI/सरकारी खबरों पर निर्भर करेगा।"
        AppLanguage.HINGLISH -> "Kal ka bias mildly positive lag raha hai, but global cues, FII flow, overnight US market, aur RBI/government headlines pe depend karega."
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        HeaderCard(title, language, themeMode, onLanguageChange, onThemeChange)
        HeroCard(language)
        InsightCard(
            title = localized(language, "Why market is moving", "मार्केट क्यों मूव कर रहा है", "Market kyu move kar raha hai"),
            body = marketReason
        )
        InsightCard(
            title = localized(language, "Tomorrow outlook", "कल का आउटलुक", "Kal ka outlook"),
            body = tomorrowOutlook
        )
        SourcesCard(language, news)
        TopStocksCard(language, stocks)
        AiAnalystCard(language)
        DisclaimerCard(language)
    }
}

@Composable
fun HeaderCard(
    title: String,
    language: AppLanguage,
    themeMode: AppTheme,
    onLanguageChange: (AppLanguage) -> Unit,
    onThemeChange: (AppTheme) -> Unit
) {
    Card(shape = RoundedCornerShape(24.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Text(
                localized(language, "Professional Indian stock intelligence", "प्रोफेशनल भारतीय स्टॉक इंटेलिजेंस", "Professional Indian stock intelligence"),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = language == AppLanguage.ENGLISH, onClick = { onLanguageChange(AppLanguage.ENGLISH) }, label = { Text("English") }, leadingIcon = { Icon(Icons.Default.Language, null) })
                FilterChip(selected = language == AppLanguage.HINDI, onClick = { onLanguageChange(AppLanguage.HINDI) }, label = { Text("Hindi") })
                FilterChip(selected = language == AppLanguage.HINGLISH, onClick = { onLanguageChange(AppLanguage.HINGLISH) }, label = { Text("Hinglish") })
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = themeMode == AppTheme.LIGHT, onClick = { onThemeChange(AppTheme.LIGHT) }, label = { Text("Light") }, leadingIcon = { Icon(Icons.Default.WbSunny, null) })
                FilterChip(selected = themeMode == AppTheme.DARK, onClick = { onThemeChange(AppTheme.DARK) }, label = { Text("Dark") })
            }
        }
    }
}

@Composable
fun HeroCard(language: AppLanguage) {
    Card(
        shape = RoundedCornerShape(28.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .background(Brush.horizontalGradient(listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.tertiary)))
                .padding(20.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(localized(language, "NIFTY 50", "निफ्टी 50", "NIFTY 50"), color = MaterialTheme.colorScheme.onPrimary)
                Text("22,486  +0.84%", color = MaterialTheme.colorScheme.onPrimary, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
                Text(
                    localized(language, "AI-backed market explanation with real sources", "रीयल सोर्स के साथ एआई आधारित मार्केट एक्सप्लनेशन", "Real sources ke saath AI-backed market explanation"),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            }
        }
    }
}

@Composable
fun InsightCard(title: String, body: String) {
    Card(shape = RoundedCornerShape(22.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Text(body, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun SourcesCard(language: AppLanguage, items: List<NewsItem>) {
    Card(shape = RoundedCornerShape(22.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(localized(language, "Real source highlights", "रीयल सोर्स हाइलाइट्स", "Real source highlights"), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            items.forEach {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("${it.source} • ${it.impact}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                    Text(it.title)
                    Divider()
                }
            }
        }
    }
}

@Composable
fun TopStocksCard(language: AppLanguage, stocks: List<StockInsight>) {
    Card(shape = RoundedCornerShape(22.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.ShowChart, null)
                Text(localized(language, "Stocks to explore", "देखने लायक स्टॉक्स", "Explore karne layak stocks"), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
            stocks.forEach { stock ->
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { }
                        .padding(vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text(stock.symbol, fontWeight = FontWeight.Bold)
                            Text(stock.name, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(stock.price, fontWeight = FontWeight.SemiBold)
                            Text(stock.change, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                    Text(stock.summary)
                    AssistChip(onClick = {}, label = { Text(stock.verdict) })
                    Divider()
                }
            }
        }
    }
}

@Composable
fun AiAnalystCard(language: AppLanguage) {
    Card(shape = RoundedCornerShape(22.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.AutoAwesome, null)
                Text(localized(language, "AI Stock Analyst", "एआई स्टॉक एनालिस्ट", "AI Stock Analyst"), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
            OutlinedTextField(
                value = localized(language, "Should I buy Infosys?", "क्या मुझे Infosys खरीदना चाहिए?", "Kya mujhe Infosys buy karna chahiye?"),
                onValueChange = {},
                modifier = Modifier.fillMaxWidth(),
                readOnly = true,
                label = { Text(localized(language, "Ask anything", "कुछ भी पूछें", "Kuch bhi pucho")) }
            )
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(localized(language, "Sample AI answer", "सैंपल एआई जवाब", "Sample AI answer"), fontWeight = FontWeight.Bold)
                    Text(
                        when (language) {
                            AppLanguage.ENGLISH -> "Infosys looks neutral-to-positive for long-term tracking, but near-term movement depends on deal wins, margin commentary, and US demand recovery. Not a blind buy. Better on dips with risk control."
                            AppLanguage.HINDI -> "Infosys लंबी अवधि के लिए न्यूट्रल-टू-पॉजिटिव दिखती है, लेकिन निकट अवधि की चाल डील विन, मार्जिन कमेंट्री और अमेरिकी डिमांड रिकवरी पर निर्भर करेगी। बिना सोचे-समझे खरीदारी नहीं। गिरावट पर रिस्क कंट्रोल के साथ बेहतर हो सकती है।"
                            AppLanguage.HINGLISH -> "Infosys long term tracking ke liye neutral-to-positive lagti hai, but near term move deal wins, margin commentary, aur US demand recovery pe depend karega. Blind buy nahi. Dips pe risk control ke saath better ho sakti hai."
                        }
                    )
                    Text(localized(language, "Confidence: 72% • Sources: Reuters, company commentary, sector trend", "कॉन्फिडेंस: 72% • सोर्स: Reuters, कंपनी कमेंट्री, सेक्टर ट्रेंड", "Confidence: 72% • Sources: Reuters, company commentary, sector trend"), style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}

@Composable
fun DisclaimerCard(language: AppLanguage) {
    Card(shape = RoundedCornerShape(22.dp)) {
        Text(
            when (language) {
                AppLanguage.ENGLISH -> "Demo only. This app must show source links, timestamps, confidence, and a not-investment-advice disclaimer in production."
                AppLanguage.HINDI -> "यह केवल डेमो है। प्रोडक्शन में ऐप को सोर्स लिंक, टाइमस्टैम्प, कॉन्फिडेंस स्कोर और निवेश सलाह नहीं है वाला डिस्क्लेमर दिखाना होगा।"
                AppLanguage.HINGLISH -> "Ye sirf demo hai. Production me app ko source links, timestamps, confidence score, aur not-investment-advice disclaimer dikhana hoga."
            },
            modifier = Modifier.padding(18.dp),
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

fun localized(en: String, hi: String, hg: String): String = hg
fun localized(language: AppLanguage, en: String, hi: String, hg: String): String = when (language) {
    AppLanguage.ENGLISH -> en
    AppLanguage.HINDI -> hi
    AppLanguage.HINGLISH -> hg
}
