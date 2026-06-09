import type { RatesMap } from "../types";

// Free, no-key, CORS-enabled USD-based rates (units of currency per 1 USD).
// Primary: open.er-api.com  ·  Fallback: exchangerate.host
export async function fetchRates(): Promise<{ rates: RatesMap; at: number } | null> {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD");
    const d = (await r.json()) as { rates?: RatesMap };
    if (d && d.rates) return { rates: d.rates, at: Date.now() };
  } catch {
    /* try fallback */
  }
  try {
    const r = await fetch("https://api.exchangerate.host/latest?base=USD");
    const d = (await r.json()) as { rates?: RatesMap };
    if (d && d.rates) return { rates: { ...d.rates, USD: 1 }, at: Date.now() };
  } catch {
    /* offline */
  }
  return null;
}
