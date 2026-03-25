package com.stockindiaplus.demo

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { StockIndiaPlusDemoApp() }
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
    val verdict: String,
    val tradingViewUrl: String
)

@Composable
fun StockIndiaPlusDemoApp() {
    var language by remember { mutableStateOf(AppLanguage.HINGLISH) }
    var themeMode by remember { mutableStateOf(AppTheme.DARK) }
    val repository = remember { DemoRepository() }

    MaterialTheme(colorScheme = if (themeMode == AppTheme.DARK) darkColorScheme() else lightColorScheme()) {
        Surface(modifier = Modifier.fillMaxSize()) {
            DashboardScreen(
                language = language,
                themeMode = themeMode,
                onLanguageChange = { language = it },
                onThemeChange = { themeMode = it },
                stocks = repository.getStocks()
            )
        }
    }
}

@Composable
fun DashboardScreen(
    language: AppLanguage,
    themeMode: AppTheme,
    onLanguageChange: (AppLanguage) -> Unit,
    onThemeChange: (AppTheme) -> Unit,
    stocks: List<StockInsight>
) {
    var query by remember { mutableStateOf("") }
    var selectedStock by remember { mutableStateOf(stocks.first()) }
    var settingsOpen by remember { mutableStateOf(false) }

    val news = listOf(
        NewsItem("Reuters", "Banking stocks gained after RBI liquidity comfort signals", "Positive for Bank Nifty"),
        NewsItem("Moneycontrol", "IT stocks slipped on weak global tech cues", "Negative for Nifty IT"),
        NewsItem("NSE Filing", "Large cap company announced capex expansion", "Stock-specific positive")
    )

    val filteredStocks = stocks.filter {
        it.symbol.contains(query, true) || it.name.contains(query, true)
    }

    val marketReason = localized(
        language,
        "Market is up mainly because banking stocks are strong, crude is stable, and foreign sentiment improved. IT weakness is limiting gains.",
        "मार्केट ऊपर है क्योंकि बैंकिंग स्टॉक्स मजबूत हैं, कच्चे तेल में स्थिरता है और विदेशी सेंटीमेंट बेहतर हुआ है। आईटी सेक्टर कमजोरी से बढ़त सीमित है।",
        "Market upar hai mainly kyunki banking stocks strong hain, crude stable hai, aur foreign sentiment improve hua hai. IT weakness gains ko limit kar rahi hai."
    )

    val tomorrowOutlook = localized(
        language,
        "Tomorrow bias: mildly positive, but dependent on global cues, FII flow, overnight US market, and any RBI/government headline.",
        "कल का रुझान: हल्का पॉजिटिव, लेकिन यह ग्लोबल संकेतों, एफआईआई फ्लो, अमेरिकी बाजार और RBI/सरकारी खबरों पर निर्भर करेगा।",
        "Kal ka bias mildly positive lag raha hai, but global cues, FII flow, overnight US market, aur RBI/government headlines pe depend karega."
    )

    Box {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            HeaderCard(language, themeMode, onLanguageChange, onThemeChange, query, onQueryChange = { query = it }, onSettingsClick = { settingsOpen = true })
            HeroCard(language)
            SelectedStockCard(language, selectedStock)
            InsightCard(localized(language, "Why market is moving", "मार्केट क्यों मूव कर रहा है", "Market kyu move kar raha hai"), marketReason)
            InsightCard(localized(language, "Tomorrow outlook", "कल का आउटलुक", "Kal ka outlook"), tomorrowOutlook)
            SourcesCard(language, news)
            TopStocksCard(language, filteredStocks, onSelect = { selectedStock = it })
            AiAnalystCard(language, selectedStock)
            DisclaimerCard(language)
        }

        if (settingsOpen) {
            SettingsSheet(language, themeMode, onLanguageChange, onThemeChange, onClose = { settingsOpen = false })
        }
    }
}

@Composable
fun HeaderCard(
    language: AppLanguage,
    themeMode: AppTheme,
    onLanguageChange: (AppLanguage) -> Unit,
    onThemeChange: (AppTheme) -> Unit,
    query: String,
    onQueryChange: (String) -> Unit,
    onSettingsClick: () -> Unit
) {
    Card(shape = RoundedCornerShape(24.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text(localized(language, "Stock India Plus", "स्टॉक इंडिया प्लस", "Stock India Plus"), fontSize = 28.sp, fontWeight = FontWeight.Bold)
                    Text(localized(language, "Professional Indian stock intelligence", "प्रोफेशनल भारतीय स्टॉक इंटेलिजेंस", "Professional Indian stock intelligence"), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                FilledTonalIconButton(onClick = onSettingsClick) { Icon(Icons.Default.Settings, null) }
            }
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Default.Search, null) },
                label = { Text(localized(language, "Search stock", "स्टॉक खोजें", "Search stock")) }
            )
        }
    }
}

@Composable
fun SettingsSheet(
    language: AppLanguage,
    themeMode: AppTheme,
    onLanguageChange: (AppLanguage) -> Unit,
    onThemeChange: (AppTheme) -> Unit,
    onClose: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.scrim.copy(alpha = 0.35f)).clickable { onClose() }) {
        Card(
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(localized(language, "Settings", "सेटिंग्स", "Settings"), fontWeight = FontWeight.Bold, fontSize = 20.sp)
                Text(localized(language, "Language", "भाषा", "Language"), color = MaterialTheme.colorScheme.onSurfaceVariant)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = language == AppLanguage.ENGLISH, onClick = { onLanguageChange(AppLanguage.ENGLISH) }, label = { Text("English") }, leadingIcon = { Icon(Icons.Default.Language, null) })
                    FilterChip(selected = language == AppLanguage.HINDI, onClick = { onLanguageChange(AppLanguage.HINDI) }, label = { Text("Hindi") })
                    FilterChip(selected = language == AppLanguage.HINGLISH, onClick = { onLanguageChange(AppLanguage.HINGLISH) }, label = { Text("Hinglish") })
                }
                Text(localized(language, "Theme", "थीम", "Theme"), color = MaterialTheme.colorScheme.onSurfaceVariant)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = themeMode == AppTheme.LIGHT, onClick = { onThemeChange(AppTheme.LIGHT) }, label = { Text("Light") }, leadingIcon = { Icon(Icons.Default.WbSunny, null) })
                    FilterChip(selected = themeMode == AppTheme.DARK, onClick = { onThemeChange(AppTheme.DARK) }, label = { Text("Dark") })
                }
            }
        }
    }
}

@Composable
fun HeroCard(language: AppLanguage) {
    Card(shape = RoundedCornerShape(28.dp), modifier = Modifier.fillMaxWidth()) {
        Box(modifier = Modifier.background(Brush.horizontalGradient(listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.tertiary))).padding(20.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(localized(language, "NIFTY 50", "निफ्टी 50", "NIFTY 50"), color = MaterialTheme.colorScheme.onPrimary)
                Text("22,486  +0.84%", color = MaterialTheme.colorScheme.onPrimary, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
                Text(localized(language, "AI-backed market explanation with real sources", "रीयल सोर्स के साथ एआई आधारित मार्केट एक्सप्लनेशन", "Real sources ke saath AI-backed market explanation"), color = MaterialTheme.colorScheme.onPrimary)
            }
        }
    }
}

@Composable
fun SelectedStockCard(language: AppLanguage, stock: StockInsight) {
    val context = LocalContext.current
    Card(shape = RoundedCornerShape(22.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(localized(language, "Selected stock details", "चुने गए स्टॉक की डिटेल्स", "Selected stock details"), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Text(stock.symbol, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
            Text(stock.name, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("${stock.price}  ${stock.change}", fontWeight = FontWeight.Bold)
            Text(stock.summary)
            AssistChip(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(stock.tradingViewUrl))
                    context.startActivity(intent)
                },
                label = { Text(localized(language, "Open on TradingView", "TradingView पर खोलें", "Open on TradingView")) },
                leadingIcon = { Icon(Icons.Default.ShowChart, null) }
            )
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
                    HorizontalDivider()
                }
            }
        }
    }
}

@Composable
fun TopStocksCard(language: AppLanguage, stocks: List<StockInsight>, onSelect: (StockInsight) -> Unit) {
    Card(shape = RoundedCornerShape(22.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.ShowChart, null)
                Text(localized(language, "Stocks to explore", "देखने लायक स्टॉक्स", "Explore karne layak stocks"), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
            stocks.forEach { stock ->
                Column(modifier = Modifier.fillMaxWidth().clickable { onSelect(stock) }.padding(vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
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
                    AssistChip(onClick = { onSelect(stock) }, label = { Text(stock.verdict) })
                    HorizontalDivider()
                }
            }
        }
    }
}

@Composable
fun AiAnalystCard(language: AppLanguage, stock: StockInsight) {
    Card(shape = RoundedCornerShape(22.dp)) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.AutoAwesome, null)
                Text(localized(language, "AI Stock Analyst", "एआई स्टॉक एनालिस्ट", "AI Stock Analyst"), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
            OutlinedTextField(
                value = localized(language, "Should I buy ${stock.symbol}?", "क्या मुझे ${stock.symbol} खरीदना चाहिए?", "Kya mujhe ${stock.symbol} buy karna chahiye?"),
                onValueChange = {},
                modifier = Modifier.fillMaxWidth(),
                readOnly = true,
                label = { Text(localized(language, "Ask anything", "कुछ भी पूछें", "Kuch bhi pucho")) }
            )
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(localized(language, "Sample AI answer", "सैंपल एआई जवाब", "Sample AI answer"), fontWeight = FontWeight.Bold)
                    Text(localized(language, "${stock.name} currently looks ${stock.verdict}. Main reason: ${stock.summary} This beta demo should later use source-grounded AI before production.", "${stock.name} फिलहाल ${stock.verdict} दिखता है। मुख्य कारण: ${stock.summary} प्रोडक्शन से पहले इस बीटा डेमो में source-grounded AI लगना चाहिए।", "${stock.name} abhi ${stock.verdict} lag raha hai. Main reason: ${stock.summary} Production se pehle is beta demo me source-grounded AI lagna chahiye."))
                    Text(localized(language, "Confidence: 72% • Demo sources: Reuters, company commentary, sector trend", "कॉन्फिडेंस: 72% • डेमो सोर्स: Reuters, कंपनी कमेंट्री, सेक्टर ट्रेंड", "Confidence: 72% • Demo sources: Reuters, company commentary, sector trend"), style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}

@Composable
fun DisclaimerCard(language: AppLanguage) {
    Card(shape = RoundedCornerShape(22.dp)) {
        Text(
            localized(language, "Android beta demo only. Use licensed market/news APIs, timestamps, confidence, and compliance review before production.", "यह केवल Android beta demo है। प्रोडक्शन से पहले licensed market/news APIs, timestamps, confidence और compliance review जरूरी है।", "Ye sirf Android beta demo hai. Production se pehle licensed market/news APIs, timestamps, confidence, aur compliance review zaroori hai."),
            modifier = Modifier.padding(18.dp),
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

fun localized(language: AppLanguage, en: String, hi: String, hg: String): String = when (language) {
    AppLanguage.ENGLISH -> en
    AppLanguage.HINDI -> hi
    AppLanguage.HINGLISH -> hg
}
