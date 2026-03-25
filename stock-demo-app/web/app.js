const apiBase = 'http://localhost:8787/api';

const state = {
  language: 'hg',
  selectedSymbol: 'RELIANCE',
  settingsOpen: false
};

const copy = {
  en: {
    title: 'Stock India Plus', subtitle: 'Professional Indian stock intelligence demo', settingsTitle: 'Settings', langLabel: 'Language', themeLabel: 'Theme', searchPlaceholder: 'Search NSE/BSE stock e.g. Reliance, TCS, HDFC Bank', detailTitle: 'Selected stock details', tvText: 'Open on TradingView', whyTitle: 'Why market is moving', tomorrowTitle: 'Tomorrow outlook', sourcesTitle: 'Real source highlights', stocksTitle: 'Stocks to explore', aiTitle: 'AI Stock Analyst', askPlaceholder: 'Ask about a stock...', askButton: 'Ask AI', note: 'Demo mode with mock API. Replace with licensed market/news feeds before production.'
  },
  hi: {
    title: 'स्टॉक इंडिया प्लस', subtitle: 'प्रोफेशनल भारतीय स्टॉक इंटेलिजेंस डेमो', settingsTitle: 'सेटिंग्स', langLabel: 'भाषा', themeLabel: 'थीम', searchPlaceholder: 'NSE/BSE स्टॉक खोजें जैसे Reliance, TCS, HDFC Bank', detailTitle: 'चुने गए स्टॉक की डिटेल्स', tvText: 'TradingView पर खोलें', whyTitle: 'मार्केट क्यों मूव कर रहा है', tomorrowTitle: 'कल का आउटलुक', sourcesTitle: 'रीयल सोर्स हाइलाइट्स', stocksTitle: 'देखने लायक स्टॉक्स', aiTitle: 'एआई स्टॉक एनालिस्ट', askPlaceholder: 'किसी स्टॉक के बारे में पूछें...', askButton: 'AI से पूछें', note: 'यह डेमो mock API पर चल रहा है। प्रोडक्शन से पहले licensed market/news feeds लगानी होंगी।'
  },
  hg: {
    title: 'Stock India Plus', subtitle: 'Professional Indian stock intelligence demo', settingsTitle: 'Settings', langLabel: 'Language', themeLabel: 'Theme', searchPlaceholder: 'Search NSE/BSE stock e.g. Reliance, TCS, HDFC Bank', detailTitle: 'Selected stock details', tvText: 'Open on TradingView', whyTitle: 'Market kyu move kar raha hai', tomorrowTitle: 'Kal ka outlook', sourcesTitle: 'Real source highlights', stocksTitle: 'Explore karne layak stocks', aiTitle: 'AI Stock Analyst', askPlaceholder: 'Kisi stock ke bare me pucho...', askButton: 'Ask AI', note: 'Ye demo mock API par chal raha hai. Production se pehle licensed market/news feeds lagani hongi.'
  }
};

async function getJson(path) {
  const res = await fetch(`${apiBase}${path}`);
  if (!res.ok) throw new Error(`API failed: ${path}`);
  return res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setLang(lang) {
  state.language = lang;
  const c = copy[lang];
  setText('title', c.title);
  setText('subtitle', c.subtitle);
  setText('settingsTitle', c.settingsTitle);
  setText('langLabel', c.langLabel);
  setText('themeLabel', c.themeLabel);
  setText('detailTitle', c.detailTitle);
  setText('tvText', c.tvText);
  setText('whyTitle', c.whyTitle);
  setText('tomorrowTitle', c.tomorrowTitle);
  setText('sourcesTitle', c.sourcesTitle);
  setText('stocksTitle', c.stocksTitle);
  setText('aiTitle', c.aiTitle);
  setText('apiNote', c.note);
  document.getElementById('searchInput').placeholder = c.searchPlaceholder;
  document.getElementById('aiQuestion').placeholder = c.askPlaceholder;
  document.getElementById('askButton').textContent = c.askButton;
  closeSettings();
}

function setTheme(mode) {
  if (mode === 'light') document.body.classList.add('light');
  else document.body.classList.remove('light');
  closeSettings();
}

function toggleSettings() {
  document.getElementById('settingsSheet').classList.toggle('open');
}

function closeSettings() {
  document.getElementById('settingsSheet').classList.remove('open');
}

async function renderOverview() {
  const overview = await getJson('/market/overview');
  setText('heroLabel', overview.indexName);
  document.getElementById('heroValue').innerHTML = `${overview.value.toLocaleString('en-IN')} <span style="font-size:18px">${overview.changePercent > 0 ? '+' : ''}${overview.changePercent}%</span>`;
  setText('whyBody', overview.todayReason);
  setText('tomorrowBody', overview.tomorrowOutlook);
  setText('biasText', overview.quickSignals.bias);
  setText('riskText', overview.quickSignals.risk);
  setText('fiiText', overview.quickSignals.fiiFlow);
  setText('volText', overview.quickSignals.volatility);
}

async function renderNews() {
  const items = await getJson('/news');
  document.getElementById('newsList').innerHTML = items.map(item => `
    <div class="news">
      <strong>${item.source}</strong> • ${item.impact}<br>
      <span class="muted">${item.title}</span><br>
      <a href="${item.url}" target="_blank">Source</a>
    </div>
  `).join('');
}

async function renderStocks(q = '') {
  const items = await getJson(`/stocks${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  document.getElementById('stockList').innerHTML = items.map(stock => `
    <div class="stock" onclick="selectStock('${stock.symbol}')">
      <div>
        <strong>${stock.symbol}</strong><br>
        <span class="muted">${stock.name}</span><br>
        <span class="pill">${stock.view}</span>
      </div>
      <div style="text-align:right">
        <strong>₹${Number(stock.price).toLocaleString('en-IN')}</strong><br>
        <span class="${stock.changePercent >= 0 ? 'green' : 'red'}">${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%</span>
      </div>
    </div>
  `).join('');
}

async function selectStock(symbol) {
  state.selectedSymbol = symbol;
  const stock = await getJson(`/stocks/${symbol}`);
  setText('selectedName', stock.symbol);
  setText('selectedSub', `${stock.name} • ${stock.exchange}`);
  document.getElementById('selectedPrice').innerHTML = `₹${Number(stock.price).toLocaleString('en-IN')} <span class="${stock.changePercent >= 0 ? 'green' : 'red'}" style="font-size:16px;">${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%</span>`;
  setText('selectedMcap', stock.marketCap);
  setText('selectedPE', stock.pe);
  setText('selectedSector', stock.sector);
  setText('selectedView', stock.view);
  setText('selectedReason', stock.summary);
  document.getElementById('tvButton').href = stock.tradingViewUrl;
}

async function askAi() {
  const question = document.getElementById('aiQuestion').value.trim();
  const res = await fetch(`${apiBase}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, symbol: state.selectedSymbol })
  });
  const data = await res.json();
  document.getElementById('aiAnswer').innerHTML = `${data.answer}<div class='footer-note'>Confidence: ${data.confidence}% • Sources: ${data.sources.map(s => s.source).join(', ')}</div>`;
}

async function init() {
  await renderOverview();
  await renderNews();
  await renderStocks();
  await selectStock(state.selectedSymbol);
  setLang(state.language);
  document.getElementById('searchInput').addEventListener('input', e => renderStocks(e.target.value));
}

init().catch(err => {
  console.error(err);
  document.getElementById('apiNote').textContent = 'API connection failed. Start the local server first.';
});
