// [code, symbol] — symbol "" renders the code as a suffix (e.g. "500 CZK")
export const CURRENCIES: [string, string][] = [
  ["USD", "$"], ["EUR", "\u20ac"], ["GBP", "\u00a3"], ["JPY", "\u00a5"], ["CHF", ""],
  ["AUD", "A$"], ["CAD", "C$"], ["NZD", "NZ$"], ["CZK", ""],
];

export const CUR_SYM: Record<string, string> = Object.fromEntries(
  CURRENCIES.map(([c, s]) => [c, s])
);

export type FxType = "base" | "quote";

// "base"  => pair is CUR/USD, multiply account amount by rate to get USD
// "quote" => pair is USD/CUR, divide account amount by rate to get USD
export const FX_TYPE: Record<string, FxType> = {
  EUR: "base", GBP: "base", AUD: "base", NZD: "base",
  JPY: "quote", CHF: "quote", CAD: "quote", CZK: "quote",
};

// Offline fallback — units of the account currency per 1 USD (live data overrides)
export const RATE_DEFAULTS: Record<string, number> = {
  USD: 1, EUR: 0.877, GBP: 0.741, JPY: 150, CHF: 0.88,
  AUD: 1.515, CAD: 1.36, NZD: 1.66, CZK: 22.15,
};
