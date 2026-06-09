export type RatesMap = Record<string, number>;
export type Direction = "Long" | "Short";
export type TradeResult = "win" | "loss" | null;
export type RatesStatus = "default" | "live" | "cached" | "loading";
export type AllocMode = "equal" | "weighted";
export type RiskMode = "0.25" | "0.5" | "1" | "custom";

export interface ExtraEntry {
  price: string;
  weight: string;
}

export interface Trade {
  id: number;
  date: string;
  instrument: string;
  direction: Direction;
  entry: string;
  stop: string;
  tp: string;
  lots: number;
  riskPct: number;
  rr: number;
  expProfit: number;
  expLoss: number;
  currency: string;
  result: TradeResult;
}
