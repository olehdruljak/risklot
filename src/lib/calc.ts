import { INSTRUMENTS } from "../data/instruments";
import type { Instrument } from "../data/instruments";
import { FX_TYPE, RATE_DEFAULTS } from "../data/currencies";
import { num, liveQuoteFor } from "./format";
import type { RatesMap, ExtraEntry, AllocMode } from "../types";

export interface CalcParams {
  account: string;
  currency: string;
  exRate: string;
  rates: RatesMap;
  riskPct: number;
  entry: string;
  stop: string;
  tp: string;
  instrument: string;
  advOpen: boolean;
  adv: { vpp: string; pointSize: string; contract: string };
}

export interface CalcResult {
  acc: number; q: number; acctPerUsd: number; E: number; S: number; T: number;
  base: Instrument; vpp: number; pointSize: number; vpm: number; isStock: boolean;
  riskAmt: number; riskUSD: number; sizingBase: number;
  singleDistPrice: number; singleDistPts: number; singleLots: number;
  rrRiskPrice: number; rrRewardPrice: number; rr: number;
  potLoss: number; potProfit: number;
}

// Convert account-currency risk to USD, then size by asset class.
export function computeCalc(p: CalcParams): CalcResult {
  const acc = num(p.account);
  const E = num(p.entry), S = num(p.stop), T = num(p.tp);
  const base = INSTRUMENTS[p.instrument];
  const isStock = base.kind === "stock";

  let vpp = base.vpp ?? 1;
  if (base.usdBase) vpp = (base.pointSize * 100000) / (E || base.dynFallback || 1);
  let pointSize = base.pointSize;
  if (p.advOpen) {
    if (p.adv.vpp !== "" && isFinite(num(p.adv.vpp))) vpp = num(p.adv.vpp);
    if (p.adv.pointSize !== "" && isFinite(num(p.adv.pointSize))) pointSize = num(p.adv.pointSize);
  }
  const vpm = vpp / pointSize; // USD per 1.0 price move per lot

  const meta = FX_TYPE[p.currency];
  let q: number;
  if (p.currency === "USD") q = 1;
  else {
    q = num(p.exRate) > 0 ? num(p.exRate) : liveQuoteFor(p.currency, p.rates);
    if (!(q > 0)) q = meta === "base" ? 1 / (RATE_DEFAULTS[p.currency] || 1) : RATE_DEFAULTS[p.currency] || 1;
  }
  const acctPerUsd = p.currency === "USD" ? 1 : meta === "base" ? 1 / q : q;

  const riskAmt = isFinite(acc) && isFinite(p.riskPct) ? acc * p.riskPct : NaN;
  const riskUSD = riskAmt / acctPerUsd;
  const sizingBase = isStock ? riskAmt : riskUSD;

  const singleDistPrice = isFinite(E) && isFinite(S) ? Math.abs(E - S) : NaN;
  const singleDistPts = singleDistPrice / pointSize;
  const singleLots =
    isFinite(sizingBase) && isFinite(singleDistPrice) && singleDistPrice > 0
      ? sizingBase / (singleDistPrice * vpm)
      : NaN;

  const rrRiskPrice = singleDistPrice;
  const rrRewardPrice = isFinite(E) && isFinite(T) ? Math.abs(T - E) : NaN;
  const rr =
    isFinite(rrRiskPrice) && isFinite(rrRewardPrice) && rrRiskPrice > 0
      ? rrRewardPrice / rrRiskPrice
      : NaN;
  const potLoss = isFinite(riskAmt) ? riskAmt : NaN;
  const potProfit = isFinite(riskAmt) && isFinite(rr) ? riskAmt * rr : NaN;

  return {
    acc, q, acctPerUsd, E, S, T, base, vpp, pointSize, vpm, isStock,
    riskAmt, riskUSD, sizingBase, singleDistPrice, singleDistPts, singleLots,
    rrRiskPrice, rrRewardPrice, rr, potLoss, potProfit,
  };
}

export interface MultiRow {
  price: number; weight: number; primary?: boolean; dist: number; alloc: number; lots: number;
}
export interface MultiResult {
  out: MultiRow[]; totalLots: number; totalRisk: number; wAvgEntry: number;
}

export function computeMulti(
  calc: CalcResult,
  entry: string,
  extra: ExtraEntry[],
  allocMode: AllocMode,
  primaryW: number
): MultiResult {
  const { S, vpm, sizingBase, acctPerUsd, isStock } = calc;
  const rows = [
    { price: num(entry), weight: primaryW, primary: true },
    ...extra.map((x) => ({ price: num(x.price), weight: num(x.weight) })),
  ];
  const n = rows.length;
  const wTotal = rows.reduce((a, r) => a + (isFinite(r.weight) ? r.weight : 0), 0) || 1;
  const out: MultiRow[] = rows.map((r) => {
    const dist = isFinite(r.price) && isFinite(S) ? Math.abs(r.price - S) : NaN;
    const alloc = allocMode === "equal" ? sizingBase / n : sizingBase * ((isFinite(r.weight) ? r.weight : 0) / wTotal);
    const lots = isFinite(alloc) && isFinite(dist) && dist > 0 ? alloc / (dist * vpm) : NaN;
    return { ...r, dist, alloc, lots };
  });
  const totalLots = out.reduce((a, r) => a + (isFinite(r.lots) ? r.lots : 0), 0);
  const totalRiskBase = out.reduce((a, r) => a + (isFinite(r.lots) && isFinite(r.dist) ? r.lots * r.dist * vpm : 0), 0);
  const totalRisk = isStock ? totalRiskBase : totalRiskBase * acctPerUsd;
  const wAvgEntry = totalLots > 0 ? out.reduce((a, r) => a + (isFinite(r.lots) ? r.lots * r.price : 0), 0) / totalLots : NaN;
  return { out, totalLots, totalRisk, wAvgEntry };
}
