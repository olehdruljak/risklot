import { C } from "../lib/theme";
import { fmt2 } from "../lib/format";
import type { MultiRow } from "../lib/calc";

export function MultiDiagram({ out, stop }: { out: MultiRow[]; stop: number }) {
  const prices = out.map((r) => r.price).filter((n) => isFinite(n));
  if (!prices.length || !isFinite(stop)) return null;
  const all = [...prices, stop];
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const pos = (p: number) => ((p - min) / range) * 100;
  const eMin = Math.min(...prices.map(pos));
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "28px 16px 32px" }}>
      <div style={{ position: "relative", height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${eMin}%`, width: `${Math.abs(pos(stop) - eMin)}%`, background: "rgba(255,93,108,0.18)", borderRadius: 4 }} />
        {out.map((r, i) =>
          isFinite(r.price) ? (
            <div key={i} style={{ position: "absolute", left: `${pos(r.price)}%`, top: -4, transform: "translateX(-50%)" }}>
              <div style={{ width: 11, height: 11, borderRadius: 11, background: "#4F6FFF", boxShadow: "0 0 0 3px rgba(79,111,255,0.2)" }} />
              <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", fontSize: 10.5, color: C.text, whiteSpace: "nowrap", fontWeight: 600 }}>E{i + 1}</div>
              <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", fontSize: 9.5, color: C.faint, whiteSpace: "nowrap" }}>{fmt2(r.price, 2)}</div>
            </div>
          ) : null
        )}
        <div style={{ position: "absolute", left: `${pos(stop)}%`, top: -6, transform: "translateX(-50%)" }}>
          <div style={{ width: 3, height: 16, background: C.red, borderRadius: 2 }} />
          <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", fontSize: 10.5, color: C.red, whiteSpace: "nowrap", fontWeight: 700 }}>SL</div>
          <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", fontSize: 9.5, color: C.red, whiteSpace: "nowrap" }}>{fmt2(stop, 2)}</div>
        </div>
      </div>
    </div>
  );
}

export function RRBar({
  entry, stop, tp, rr, riskPts, rewardPts, distLabel,
}: { entry: number; stop: number; tp: number; rr: number; riskPts: number; rewardPts: number; distLabel: string }) {
  const valid = isFinite(entry) && isFinite(stop) && isFinite(tp) && isFinite(rr) && rr > 0;
  const riskFrac = valid ? 1 / (1 + rr) : 0.5;
  const rewardFrac = valid ? rr / (1 + rr) : 0.5;
  return (
    <div>
      <div style={{ display: "flex", height: 36, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ width: `${riskFrac * 100}%`, background: "linear-gradient(90deg, rgba(255,93,108,0.32), rgba(255,93,108,0.16))", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.red, whiteSpace: "nowrap" }}>{valid ? `\u2212${fmt2(riskPts)} ${distLabel}` : "Risk"}</span>
        </div>
        <div style={{ width: 2, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ width: `${rewardFrac * 100}%`, background: "linear-gradient(90deg, rgba(47,214,168,0.16), rgba(47,214,168,0.32))", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.green, whiteSpace: "nowrap" }}>{valid ? `+${fmt2(rewardPts)} ${distLabel}` : "Reward"}</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: C.faint }}>
        <span style={{ color: C.red, fontWeight: 600 }}>SL {isFinite(stop) ? fmt2(stop, 2) : ""}</span>
        <span style={{ fontWeight: 600, color: C.dim }}>Entry {isFinite(entry) ? fmt2(entry, 2) : ""}</span>
        <span style={{ color: C.green, fontWeight: 600 }}>TP {isFinite(tp) ? fmt2(tp, 2) : ""}</span>
      </div>
    </div>
  );
}
