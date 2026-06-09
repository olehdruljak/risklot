import { CUR_SYM, FX_TYPE } from "../data/currencies";
import type { RatesMap } from "../types";

export const num = (v: string | number): number => {
  const n = parseFloat(String(v));
  return isFinite(n) ? n : NaN;
};

export const fmtLots = (v: number): string => (isFinite(v) && v > 0 ? v.toFixed(2) : "\u2014");

export const fmt2 = (v: number, d = 2): string =>
  isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: d }) : "\u2014";

export function money(v: number, cur: string): string {
  if (!isFinite(v)) return "\u2014";
  const dec = Math.abs(v) >= 1000 ? 0 : 2;
  const s = Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const sign = v < 0 ? "-" : "";
  const sym = CUR_SYM[cur];
  return sym ? `${sign}${sym}${s}` : `${sign}${s} ${cur}`;
}

export const fxPair = (c: string): string => (FX_TYPE[c] === "base" ? `${c}/USD` : `USD/${c}`);

export const liveQuoteFor = (c: string, rates: RatesMap): number => {
  const u = rates[c];
  if (!isFinite(u) || u <= 0) return NaN;
  return FX_TYPE[c] === "base" ? 1 / u : u;
};

export const fmtRate = (v: number, c: string): string => {
  if (!isFinite(v)) return "\u2014";
  return FX_TYPE[c] === "base" ? v.toFixed(4) : v >= 10 ? v.toFixed(2) : v.toFixed(4);
};

export const fmtTime = (t: number): string => {
  if (!t) return "";
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
