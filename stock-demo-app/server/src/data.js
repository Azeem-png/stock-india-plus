export const stocks = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    exchange: 'NSE',
    price: 2948,
    changePercent: 1.82,
    marketCap: '₹19.9L Cr',
    pe: '28.4',
    sector: 'Energy / Retail',
    view: 'Watch / Gradual Buy',
    summary: 'Strong index weight, retail optimism, and stable energy sentiment are helping the stock.',
    tradingViewSymbol: 'NSE:RELIANCE',
    aliases: ['ril', 'reliance ind', 'reliance industries ltd']
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    price: 4102,
    changePercent: -0.94,
    marketCap: '₹14.8L Cr',
    pe: '31.7',
    sector: 'IT Services',
    view: 'Hold',
    summary: 'Near-term pressure is linked to global IT demand softness and margin commentary concerns.',
    tradingViewSymbol: 'NSE:TCS',
    aliases: ['tata consultancy', 'tata consultancy services ltd']
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    exchange: 'NSE',
    price: 1672,
    changePercent: 2.11,
    marketCap: '₹12.7L Cr',
    pe: '19.8',
    sector: 'Private Banking',
    view: 'Positive Bias',
    summary: 'Credit growth hopes and strength in private banks are driving improved sentiment.',
    tradingViewSymbol: 'NSE:HDFCBANK',
    aliases: ['hdfc', 'hdfc bank ltd']
  },
  {
    symbol: 'INFY',
    name: 'Infosys',
    exchange: 'NSE',
    price: 1628,
    changePercent: 0.36,
    marketCap: '₹6.7L Cr',
    pe: '25.2',
    sector: 'IT Services',
    view: 'Neutral to Positive',
    summary: 'Long-term quality remains strong, but short-term upside depends on deal wins and US demand recovery.',
    tradingViewSymbol: 'NSE:INFY',
    aliases: ['infosys ltd']
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank',
    exchange: 'NSE',
    price: 1214,
    changePercent: 1.44,
    marketCap: '₹8.5L Cr',
    pe: '20.6',
    sector: 'Private Banking',
    view: 'Positive',
    summary: 'Strong earnings consistency and sector momentum are supporting price action.',
    tradingViewSymbol: 'NSE:ICICIBANK',
    aliases: ['icici', 'icici bank ltd']
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    price: 782,
    changePercent: 1.12,
    marketCap: '₹7.0L Cr',
    pe: '10.5',
    sector: 'PSU Banking',
    view: 'Constructive',
    summary: 'PSU banking momentum and healthy credit growth are keeping sentiment supportive.',
    tradingViewSymbol: 'NSE:SBIN',
    aliases: ['sbi', 'state bank', 'state bank of india ltd']
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel',
    exchange: 'NSE',
    price: 1286,
    changePercent: 0.74,
    marketCap: '₹7.3L Cr',
    pe: '67.2',
    sector: 'Telecom',
    view: 'Positive Bias',
    summary: 'Tariff discipline and subscriber quality remain key support factors for the stock.',
    tradingViewSymbol: 'NSE:BHARTIARTL',
    aliases: ['airtel', 'bharti', 'bharti airtel ltd']
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro',
    exchange: 'NSE',
    price: 3688,
    changePercent: 0.91,
    marketCap: '₹5.1L Cr',
    pe: '36.1',
    sector: 'Capital Goods',
    view: 'Watch / Positive',
    summary: 'Order inflow visibility and infrastructure spending continue to support the long-term setup.',
    tradingViewSymbol: 'NSE:LT',
    aliases: ['larsen', 'toubro', 'l&t', 'larsen and toubro']
  },
  {
    symbol: 'ITC',
    name: 'ITC',
    exchange: 'NSE',
    price: 426,
    changePercent: -0.22,
    marketCap: '₹5.3L Cr',
    pe: '26.3',
    sector: 'FMCG',
    view: 'Rangebound',
    summary: 'Defensive demand support is intact, though upside may stay moderate without a fresh trigger.',
    tradingViewSymbol: 'NSE:ITC',
    aliases: ['itc ltd']
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever',
    exchange: 'NSE',
    price: 2416,
    changePercent: 0.18,
    marketCap: '₹5.7L Cr',
    pe: '55.6',
    sector: 'FMCG',
    view: 'Defensive Hold',
    summary: 'Defensive positioning helps, but volume growth and margin commentary remain important.',
    tradingViewSymbol: 'NSE:HINDUNILVR',
    aliases: ['hul', 'hindustan unilever ltd']
  }
];

export const marketOverview = {
  indexName: 'NIFTY 50',
  value: 22486,
  changePercent: 0.84,
  todayReason: 'Market is up mainly because banking stocks are strong, crude is stable, and foreign sentiment improved. IT weakness is limiting gains.',
  tomorrowOutlook: 'Tomorrow bias looks mildly positive, but it depends on global cues, FII flow, overnight US market, and any RBI/government headline.',
  confidence: 72,
  quickSignals: {
    bias: 'Mild Positive',
    risk: 'Medium',
    fiiFlow: 'Improving',
    volatility: 'Controlled'
  }
};

export const news = [
  {
    source: 'Reuters',
    title: 'Banking stocks gained after RBI liquidity comfort signals',
    impact: 'Positive for Bank Nifty',
    url: 'https://www.reuters.com/',
    publishedAt: null
  },
  {
    source: 'Moneycontrol',
    title: 'IT stocks slipped on weak global tech cues',
    impact: 'Negative for Nifty IT',
    url: 'https://www.moneycontrol.com/',
    publishedAt: null
  },
  {
    source: 'NSE Filing',
    title: 'Example filing-style headline for demo mode only',
    impact: 'Illustrative demo item, not live verified news',
    url: 'https://www.nseindia.com/',
    publishedAt: null
  }
];
