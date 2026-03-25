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
    tradingViewSymbol: 'NSE:RELIANCE'
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
    tradingViewSymbol: 'NSE:TCS'
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
    tradingViewSymbol: 'NSE:HDFCBANK'
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
    tradingViewSymbol: 'NSE:INFY'
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
    tradingViewSymbol: 'NSE:ICICIBANK'
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
    url: 'https://www.reuters.com/'
  },
  {
    source: 'Moneycontrol',
    title: 'IT stocks slipped on weak global tech cues',
    impact: 'Negative for Nifty IT',
    url: 'https://www.moneycontrol.com/'
  },
  {
    source: 'NSE Filing',
    title: 'Large cap company announced capex expansion',
    impact: 'Stock-specific positive',
    url: 'https://www.nseindia.com/'
  }
];
