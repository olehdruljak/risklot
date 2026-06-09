export type InstrumentKind = "index" | "forex" | "stock" | "metal";
export type Unit = "lots" | "shares";

export interface Instrument {
  label: string;
  kind: InstrumentKind;
  pointSize: number;   // price size of one point/pip
  pointLabel: string;  // "pts" | "pips" | "$"
  vpp?: number;        // USD value of one point/pip per lot
  usdBase?: boolean;   // USD-base forex pair -> pip value derived from price
  dynFallback?: number;
  unit: Unit;
}

export const INSTRUMENTS: Record<string, Instrument> = {
  // Indices — 1 lot = 1 USD per index point
  US100: { label: "US100 \u00b7 NASDAQ", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  US500: { label: "US500 \u00b7 S&P 500", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  US30: { label: "US30 \u00b7 Dow Jones", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  US2000: { label: "US2000 \u00b7 Russell", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  GER40: { label: "GER40 \u00b7 DAX", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  UK100: { label: "UK100 \u00b7 FTSE 100", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  FRA40: { label: "FRA40 \u00b7 CAC 40", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  EU50: { label: "EU50 \u00b7 Euro Stoxx", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  ESP35: { label: "ESP35 \u00b7 IBEX", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  SWI20: { label: "SWI20 \u00b7 SMI", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  NETH25: { label: "NETH25 \u00b7 AEX", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  JP225: { label: "JP225 \u00b7 Nikkei", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  HK50: { label: "HK50 \u00b7 Hang Seng", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  AUS200: { label: "AUS200 \u00b7 ASX 200", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },
  CHINA50: { label: "CHINA50 \u00b7 FTSE A50", kind: "index", pointSize: 1, pointLabel: "pts", vpp: 1, unit: "lots" },

  // Forex majors — USD quoted ($10 / pip per standard lot)
  EURUSD: { label: "EUR/USD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 10, unit: "lots" },
  GBPUSD: { label: "GBP/USD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 10, unit: "lots" },
  AUDUSD: { label: "AUD/USD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 10, unit: "lots" },
  NZDUSD: { label: "NZD/USD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 10, unit: "lots" },

  // Forex majors — USD base (pip value derived from price)
  USDJPY: { label: "USD/JPY", kind: "forex", pointSize: 0.01, pointLabel: "pips", usdBase: true, dynFallback: 150, unit: "lots" },
  USDCHF: { label: "USD/CHF", kind: "forex", pointSize: 0.0001, pointLabel: "pips", usdBase: true, dynFallback: 0.9, unit: "lots" },
  USDCAD: { label: "USD/CAD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", usdBase: true, dynFallback: 1.36, unit: "lots" },

  // Forex crosses — approximate USD pip value (override in Advanced)
  EURGBP: { label: "EUR/GBP", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 12.6, unit: "lots" },
  EURJPY: { label: "EUR/JPY", kind: "forex", pointSize: 0.01, pointLabel: "pips", vpp: 6.6, unit: "lots" },
  GBPJPY: { label: "GBP/JPY", kind: "forex", pointSize: 0.01, pointLabel: "pips", vpp: 6.6, unit: "lots" },
  AUDJPY: { label: "AUD/JPY", kind: "forex", pointSize: 0.01, pointLabel: "pips", vpp: 6.6, unit: "lots" },
  CADJPY: { label: "CAD/JPY", kind: "forex", pointSize: 0.01, pointLabel: "pips", vpp: 6.6, unit: "lots" },
  CHFJPY: { label: "CHF/JPY", kind: "forex", pointSize: 0.01, pointLabel: "pips", vpp: 6.6, unit: "lots" },
  NZDJPY: { label: "NZD/JPY", kind: "forex", pointSize: 0.01, pointLabel: "pips", vpp: 6.6, unit: "lots" },
  EURCHF: { label: "EUR/CHF", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 11.1, unit: "lots" },
  GBPCHF: { label: "GBP/CHF", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 11.1, unit: "lots" },
  EURAUD: { label: "EUR/AUD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 6.5, unit: "lots" },
  GBPAUD: { label: "GBP/AUD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 6.5, unit: "lots" },
  EURCAD: { label: "EUR/CAD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 7.35, unit: "lots" },
  GBPCAD: { label: "GBP/CAD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 7.35, unit: "lots" },
  EURNZD: { label: "EUR/NZD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 6.0, unit: "lots" },
  AUDNZD: { label: "AUD/NZD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 6.0, unit: "lots" },
  AUDCAD: { label: "AUD/CAD", kind: "forex", pointSize: 0.0001, pointLabel: "pips", vpp: 7.35, unit: "lots" },

  // Stocks — shares = risk / distance ($1 per $1 move)
  AAPL: { label: "AAPL \u00b7 Apple", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  MSFT: { label: "MSFT \u00b7 Microsoft", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  NVDA: { label: "NVDA \u00b7 Nvidia", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  AMZN: { label: "AMZN \u00b7 Amazon", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  GOOGL: { label: "GOOGL \u00b7 Alphabet", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  META: { label: "META \u00b7 Meta", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  TSLA: { label: "TSLA \u00b7 Tesla", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  NFLX: { label: "NFLX \u00b7 Netflix", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  AMD: { label: "AMD \u00b7 AMD", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  INTC: { label: "INTC \u00b7 Intel", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  JPM: { label: "JPM \u00b7 JPMorgan", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  V: { label: "V \u00b7 Visa", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  DIS: { label: "DIS \u00b7 Disney", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  BA: { label: "BA \u00b7 Boeing", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  KO: { label: "KO \u00b7 Coca-Cola", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  NKE: { label: "NKE \u00b7 Nike", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  BABA: { label: "BABA \u00b7 Alibaba", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  PLTR: { label: "PLTR \u00b7 Palantir", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  COIN: { label: "COIN \u00b7 Coinbase", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },
  UBER: { label: "UBER \u00b7 Uber", kind: "stock", pointSize: 1, pointLabel: "$", vpp: 1, unit: "shares" },

  // Metals
  XAUUSD: { label: "XAU/USD \u00b7 Gold", kind: "metal", pointSize: 1, pointLabel: "$", vpp: 100, unit: "lots" },
  XAGUSD: { label: "XAG/USD \u00b7 Silver", kind: "metal", pointSize: 1, pointLabel: "$", vpp: 5000, unit: "lots" },
  XPTUSD: { label: "XPT/USD \u00b7 Platinum", kind: "metal", pointSize: 1, pointLabel: "$", vpp: 100, unit: "lots" },
  XPDUSD: { label: "XPD/USD \u00b7 Palladium", kind: "metal", pointSize: 1, pointLabel: "$", vpp: 100, unit: "lots" },

  // Commodities
  WTIUSD: { label: "WTI \u00b7 Crude Oil", kind: "metal", pointSize: 1, pointLabel: "$", vpp: 1000, unit: "lots" },
  BCOUSD: { label: "BRENT \u00b7 Crude Oil", kind: "metal", pointSize: 1, pointLabel: "$", vpp: 1000, unit: "lots" },
  NATGAS: { label: "NATGAS \u00b7 Natural Gas", kind: "metal", pointSize: 1, pointLabel: "$", vpp: 10000, unit: "lots" },
  COPPER: { label: "COPPER \u00b7 HG Copper", kind: "metal", pointSize: 1, pointLabel: "$", vpp: 25000, unit: "lots" },
};

export const INSTRUMENT_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Indices", keys: ["US100", "US500", "US30", "US2000", "GER40", "UK100", "FRA40", "EU50", "ESP35", "SWI20", "NETH25", "JP225", "HK50", "AUS200", "CHINA50"] },
  { label: "Forex \u2014 majors", keys: ["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD", "USDJPY", "USDCHF", "USDCAD"] },
  { label: "Forex \u2014 crosses", keys: ["EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "CADJPY", "CHFJPY", "NZDJPY", "EURCHF", "GBPCHF", "EURAUD", "GBPAUD", "EURCAD", "GBPCAD", "EURNZD", "AUDNZD", "AUDCAD"] },
  { label: "Stocks", keys: ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "NFLX", "AMD", "INTC", "JPM", "V", "DIS", "BA", "KO", "NKE", "BABA", "PLTR", "COIN", "UBER"] },
  { label: "Metals", keys: ["XAUUSD", "XAGUSD", "XPTUSD", "XPDUSD"] },
  { label: "Commodities", keys: ["WTIUSD", "BCOUSD", "NATGAS", "COPPER"] },
];

export const unitFor = (k: string): string => INSTRUMENTS[k]?.unit ?? "lots";
