const metaApiBase = document.querySelector('meta[name="stock-api-base"]')?.content || '';
const configuredApiBase = window.STOCK_API_BASE || metaApiBase || window.localStorage.getItem('stockDemoApiBase') || '';
const apiBase = configuredApiBase
  ? configuredApiBase.replace(/\/$/, '')
  : `${window.location.protocol}//${window.location.hostname}:8787/api`;
const userStorageKey = 'stockDemoUser';

const state = {
  language: 'hg',
  selectedSymbol: 'RELIANCE',
  settingsOpen: false,
  watchlist: [],
  currentUser: localStorage.getItem(userStorageKey) || ''
};

const copy = {
  en: {
    title: 'Stock India Plus', subtitle: 'Professional Indian stock intelligence demo', settingsTitle: 'Settings', langLabel: 'Language', themeLabel: 'Theme', searchPlaceholder: 'Search NSE/BSE stock e.g. Reliance, TCS, HDFC Bank', detailTitle: 'Selected stock details', tvText: 'Open on TradingView', saveText: 'Save to Watchlist', savedText: 'Saved in Watchlist', removeText: 'Remove from Watchlist', watchlistTitle: 'Your watchlist', watchlistEmpty: 'No saved stocks yet. Tap the button above to add your current pick.', whyTitle: 'Why market is moving', tomorrowTitle: 'Tomorrow outlook', sourcesTitle: 'Real source highlights', stocksTitle: 'Stocks to explore', aiTitle: 'AI Stock Analyst', askPlaceholder: 'Ask about a stock...', askButton: 'Ask AI', note: 'Demo mode with mock API. Replace with licensed market/news feeds before production.', loginTitle: 'Simple login', loginHint: 'Enter your name to keep a personal watchlist on this device.', loginPlaceholder: 'Your name', loginButton: 'Continue', switchUser: 'Switch user', currentUserLabel: 'Current user', watchlistNeedsLogin: 'Enter your name to use the watchlist.', authHeading: 'Welcome back', authSubtext: 'Log in with your name and jump into your personal stock dashboard.', logoutHint: 'Logout takes you back to the login screen while keeping the same simple local profile flow.'
  },
  hi: {
    title: 'स्टॉक इंडिया प्लस', subtitle: 'प्रोफेशनल भारतीय स्टॉक इंटेलिजेंस डेमो', settingsTitle: 'सेटिंग्स', langLabel: 'भाषा', themeLabel: 'थीम', searchPlaceholder: 'NSE/BSE स्टॉक खोजें जैसे Reliance, TCS, HDFC Bank', detailTitle: 'चुने गए स्टॉक की डिटेल्स', tvText: 'TradingView पर खोलें', saveText: 'वॉचलिस्ट में सेव करें', savedText: 'वॉचलिस्ट में सेव है', removeText: 'वॉचलिस्ट से हटाएं', watchlistTitle: 'आपकी वॉचलिस्ट', watchlistEmpty: 'अभी कोई सेव स्टॉक नहीं है। ऊपर वाला बटन दबाकर स्टॉक जोड़ें।', whyTitle: 'मार्केट क्यों मूव कर रहा है', tomorrowTitle: 'कल का आउटलुक', sourcesTitle: 'रीयल सोर्स हाइलाइट्स', stocksTitle: 'देखने लायक स्टॉक्स', aiTitle: 'एआई स्टॉक एनालिस्ट', askPlaceholder: 'किसी स्टॉक के बारे में पूछें...', askButton: 'AI से पूछें', note: 'यह डेमो mock API पर चल रहा है। प्रोडक्शन से पहले licensed market/news feeds लगानी होंगी।', loginTitle: 'सिंपल लॉगिन', loginHint: 'अपना नाम लिखें, ताकि इस डिवाइस पर आपकी अलग वॉचलिस्ट रहे।', loginPlaceholder: 'आपका नाम', loginButton: 'जारी रखें', switchUser: 'यूज़र बदलें', currentUserLabel: 'करेंट यूज़र', watchlistNeedsLogin: 'वॉचलिस्ट यूज़ करने के लिए अपना नाम डालें।', authHeading: 'वापसी पर स्वागत है', authSubtext: 'अपने नाम से लॉगिन करें और अपनी पर्सनल स्टॉक डैशबोर्ड में जाएं।', logoutHint: 'लॉगआउट करने पर आप फिर से लॉगिन स्क्रीन पर आ जाएंगे, वही simple local profile flow रहेगा।'
  },
  hg: {
    title: 'Stock India Plus', subtitle: 'Professional Indian stock intelligence demo', settingsTitle: 'Settings', langLabel: 'Language', themeLabel: 'Theme', searchPlaceholder: 'Search NSE/BSE stock e.g. Reliance, TCS, HDFC Bank', detailTitle: 'Selected stock details', tvText: 'Open on TradingView', saveText: 'Watchlist me save karo', savedText: 'Watchlist me saved hai', removeText: 'Watchlist se hatao', watchlistTitle: 'Tumhari watchlist', watchlistEmpty: 'Abhi koi stock saved nahi hai. Upar wale button se current stock add karo.', whyTitle: 'Market kyu move kar raha hai', tomorrowTitle: 'Kal ka outlook', sourcesTitle: 'Real source highlights', stocksTitle: 'Explore karne layak stocks', aiTitle: 'AI Stock Analyst', askPlaceholder: 'Kisi stock ke bare me pucho...', askButton: 'Ask AI', note: 'Ye demo mock API par chal raha hai. Production se pehle licensed market/news feeds lagani hongi.', loginTitle: 'Simple login', loginHint: 'Apna naam daalo, bas wahi tumhari identity hogi aur watchlist user-wise save hogi.', loginPlaceholder: 'Apna naam', loginButton: 'Continue', switchUser: 'Logout / user badlo', currentUserLabel: 'Current user', watchlistNeedsLogin: 'Watchlist use karne ke liye naam enter karo.', authHeading: 'Welcome back', authSubtext: 'Naam se login karo aur apni personal watchlist ke saath app me enter ho jao.', logoutHint: 'Logout karoge to wapas login screen par aa jaoge, simple profile flow same rahega.'
  }
};

async function getJson(path) {
  const res = await fetch(`${apiBase}${path}`);
  if (!res.ok) throw new Error(`API failed: ${path}`);
  return res.json();
}

async function sendJson(path, method, body) {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `API failed: ${method} ${path}`);
  }

  return res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function currentCopy() {
  return copy[state.language];
}

function getCurrentUser() {
  return state.currentUser;
}

function isLoggedIn() {
  return Boolean(getCurrentUser());
}

function isSaved(symbol = state.selectedSymbol) {
  return state.watchlist.some(item => item.symbol === symbol);
}

function setUserBadge() {
  const c = currentCopy();
  const user = getCurrentUser();
  setText('currentUserLabel', c.currentUserLabel);
  setText('currentUserName', user || '—');
  document.getElementById('switchUserButton').textContent = c.switchUser;
}

function renderAppShell() {
  const loggedIn = isLoggedIn();
  document.getElementById('authScreen').classList.toggle('hidden', loggedIn);
  document.getElementById('appShell').classList.toggle('hidden', !loggedIn);
  document.getElementById('appPhone').classList.toggle('auth-mode', !loggedIn);
  closeSettings();
}

function renderWatchButton() {
  const button = document.getElementById('watchlistButton');
  const c = currentCopy();

  if (!isLoggedIn()) {
    button.textContent = c.watchlistNeedsLogin;
    button.classList.remove('saved');
    button.disabled = true;
    return;
  }

  const saved = isSaved();
  button.textContent = saved ? c.savedText : c.saveText;
  button.classList.toggle('saved', saved);
  button.disabled = false;
}

function renderWatchlist() {
  const c = currentCopy();
  const container = document.getElementById('watchlistList');

  if (!isLoggedIn()) {
    container.innerHTML = `<div class="empty-state">${c.watchlistNeedsLogin}</div>`;
    return;
  }

  if (!state.watchlist.length) {
    container.innerHTML = `<div class="empty-state">${c.watchlistEmpty}</div>`;
    return;
  }

  container.innerHTML = state.watchlist.map(stock => `
    <div class="stock saved-stock">
      <div onclick="selectStock('${stock.symbol}')">
        <strong>${stock.symbol}</strong><br>
        <span class="muted">${stock.name}</span><br>
        <span class="pill">${stock.view}</span>
      </div>
      <div style="text-align:right">
        <strong>₹${Number(stock.price).toLocaleString('en-IN')}</strong><br>
        <span class="${stock.changePercent >= 0 ? 'green' : 'red'}">${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%</span><br>
        <button class="mini-btn danger" onclick="removeFromWatchlist('${stock.symbol}')">${c.removeText}</button>
      </div>
    </div>
  `).join('');
}

function setLang(lang) {
  state.language = lang;
  const c = currentCopy();
  setText('title', c.title);
  setText('subtitle', c.subtitle);
  setText('settingsTitle', c.settingsTitle);
  setText('langLabel', c.langLabel);
  setText('themeLabel', c.themeLabel);
  setText('detailTitle', c.detailTitle);
  setText('tvText', c.tvText);
  setText('watchlistTitle', c.watchlistTitle);
  setText('whyTitle', c.whyTitle);
  setText('tomorrowTitle', c.tomorrowTitle);
  setText('sourcesTitle', c.sourcesTitle);
  setText('stocksTitle', c.stocksTitle);
  setText('aiTitle', c.aiTitle);
  setText('apiNote', c.note);
  setText('loginTitle', c.loginTitle);
  setText('loginHint', c.loginHint);
  setText('authHeading', c.authHeading);
  setText('authSubtext', c.authSubtext);
  document.getElementById('searchInput').placeholder = c.searchPlaceholder;
  document.getElementById('aiQuestion').placeholder = c.askPlaceholder;
  document.getElementById('loginName').placeholder = c.loginPlaceholder;
  document.getElementById('askButton').textContent = c.askButton;
  document.getElementById('loginButton').textContent = c.loginButton;
  setUserBadge();
  renderWatchButton();
  renderWatchlist();
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

async function renderWatchlistData() {
  if (!isLoggedIn()) {
    state.watchlist = [];
    renderWatchButton();
    renderWatchlist();
    return;
  }

  const result = await getJson(`/watchlist?user=${encodeURIComponent(getCurrentUser())}`);
  state.watchlist = result.items || [];
  renderWatchButton();
  renderWatchlist();
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
  renderWatchButton();
}

async function loginUser(name) {
  const session = await getJson(`/session?name=${encodeURIComponent(name)}`);
  if (!session.isValid) {
    throw new Error('Please enter a valid name');
  }

  state.currentUser = session.user;
  localStorage.setItem(userStorageKey, session.user);
  document.getElementById('loginName').value = session.user;
  renderAppShell();
  setUserBadge();
  await renderWatchlistData();
}

async function handleLogin() {
  const input = document.getElementById('loginName');
  const value = input.value.trim();
  const error = document.getElementById('loginError');
  error.textContent = '';

  try {
    await loginUser(value);
  } catch (err) {
    error.textContent = err.message || 'Login failed';
  }
}

function logoutToSwitchUser() {
  state.currentUser = '';
  state.watchlist = [];
  localStorage.removeItem(userStorageKey);
  document.getElementById('loginName').value = '';
  document.getElementById('loginError').textContent = '';
  renderAppShell();
  setUserBadge();
  renderWatchButton();
  renderWatchlist();
}

async function toggleWatchlist() {
  const symbol = state.selectedSymbol;
  if (!symbol || !isLoggedIn()) return;

  const path = isSaved(symbol)
    ? `/watchlist/${encodeURIComponent(symbol)}?user=${encodeURIComponent(getCurrentUser())}`
    : '/watchlist';
  const method = isSaved(symbol) ? 'DELETE' : 'POST';
  const body = method === 'POST' ? { user: getCurrentUser(), symbol } : undefined;
  const result = await sendJson(path, method, body);
  state.watchlist = result.items || [];
  renderWatchButton();
  renderWatchlist();
}

async function removeFromWatchlist(symbol) {
  if (!isLoggedIn()) return;
  const result = await sendJson(`/watchlist/${encodeURIComponent(symbol)}?user=${encodeURIComponent(getCurrentUser())}`, 'DELETE');
  state.watchlist = result.items || [];
  renderWatchButton();
  renderWatchlist();
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
  renderAppShell();
  await renderOverview();
  await renderNews();
  await renderStocks();
  await selectStock(state.selectedSymbol);
  setLang(state.language);

  if (state.currentUser) {
    await loginUser(state.currentUser);
  } else {
    await renderWatchlistData();
  }

  document.getElementById('searchInput').addEventListener('input', e => renderStocks(e.target.value));
  document.getElementById('watchlistButton').addEventListener('click', toggleWatchlist);
  document.getElementById('loginButton').addEventListener('click', handleLogin);
  document.getElementById('switchUserButton').addEventListener('click', logoutToSwitchUser);
  document.getElementById('loginName').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
}

window.selectStock = selectStock;
window.toggleSettings = toggleSettings;
window.setLang = setLang;
window.setTheme = setTheme;
window.askAi = askAi;
window.removeFromWatchlist = removeFromWatchlist;

init().catch(err => {
  console.error(err);
  document.getElementById('apiNote').textContent = 'API connection failed. Start the local server first.';
});
