import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Copy, Check, Save, BookOpen, X, RefreshCw } from "lucide-react";

import { C, glass, fieldStyle, DAY } from "./lib/theme";
import { store } from "./lib/storage";
import { fetchRates } from "./lib/fx";
import { num, fmtLots, fmt2, money, fxPair, fmtRate, fmtTime, liveQuoteFor } from "./lib/format";
import { computeCalc, computeMulti } from "./lib/calc";
import { INSTRUMENTS, INSTRUMENT_GROUPS, unitFor } from "./data/instruments";
import { CURRENCIES, CUR_SYM, RATE_DEFAULTS } from "./data/currencies";
import type {
  RatesMap, Trade, ExtraEntry, Direction, RiskMode, AllocMode, RatesStatus,
} from "./types";

import RiskLotIcon from "./components/RiskLotIcon";
import { SLabel, FInput, FSelect, Segmented, Metric, KV, Disclosure } from "./components/ui";
import { MultiDiagram, RRBar } from "./components/charts";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [account, setAccount] = useState("100000");
  const [currency, setCurrency] = useState("USD");
  const [exRate, setExRate] = useState("1");
  const [auto, setAuto] = useState(true);
  const [rates, setRates] = useState<RatesMap>(RATE_DEFAULTS);
  const [ratesAt, setRatesAt] = useState(0);
  const [ratesStatus, setRatesStatus] = useState<RatesStatus>("default");
  const [riskMode, setRiskMode] = useState<RiskMode>("0.5");
  const [customRisk, setCustomRisk] = useState("0.75");
  const [instrument, setInstrument] = useState("US100");
  const [direction, setDirection] = useState<Direction>("Long");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [tp, setTp] = useState("");
  const [copied, setCopied] = useState(false);

  const [rrOpen, setRrOpen] = useState(true);
  const [multiMode, setMultiMode] = useState(false);
  const [allocMode, setAllocMode] = useState<AllocMode>("equal");
  const [extra, setExtra] = useState<ExtraEntry[]>([]);
  const [advOpen, setAdvOpen] = useState(false);
  const [adv, setAdv] = useState({ vpp: "", pointSize: "", contract: "" });
  const [sumOpen, setSumOpen] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showJournal, setShowJournal] = useState(false);

  const loadRates = async (haveCache: boolean) => {
    setRatesStatus("loading");
    const res = await fetchRates();
    if (res) {
      setRates(res.rates);
      setRatesAt(res.at);
      setRatesStatus("live");
      store.set("tpsc_rates", JSON.stringify(res));
      return;
    }
    setRatesStatus(haveCache ? "cached" : "default");
  };

  useEffect(() => {
    (async () => {
      try {
        const s = await store.get("tpsc_settings");
        if (s) {
          const v = JSON.parse(s);
          if (v.account != null) setAccount(v.account);
          if (v.currency && CUR_SYM[v.currency] !== undefined) setCurrency(v.currency);
          if (v.riskMode) setRiskMode(v.riskMode);
          if (v.customRisk != null) setCustomRisk(v.customRisk);
          if (v.instrument && INSTRUMENTS[v.instrument]) setInstrument(v.instrument);
        }
      } catch { /* ignore */ }
      try {
        const j = await store.get("tpsc_journal");
        if (j) setTrades(JSON.parse(j));
      } catch { /* ignore */ }
      setLoaded(true);

      // FX rates: cached < 24h used as-is, otherwise auto-refreshed
      let cached = false;
      try {
        const rc = await store.get("tpsc_rates");
        if (rc) {
          const o = JSON.parse(rc);
          if (o && o.rates) {
            setRates(o.rates);
            setRatesAt(o.at || 0);
            cached = true;
            const fresh = o.at && Date.now() - o.at < DAY;
            setRatesStatus(fresh ? "live" : "cached");
            if (!fresh) loadRates(true);
          }
        }
      } catch { /* ignore */ }
      if (!cached) loadRates(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded) store.set("tpsc_settings", JSON.stringify({ account, currency, riskMode, customRisk, instrument }));
  }, [account, currency, riskMode, customRisk, instrument, loaded]);

  useEffect(() => {
    if (loaded) store.set("tpsc_journal", JSON.stringify(trades));
  }, [trades, loaded]);

  // when Auto is on, keep the editable rate synced to the live quote
  useEffect(() => {
    if (currency === "USD") {
      setExRate("1");
      return;
    }
    if (auto) {
      const q = liveQuoteFor(currency, rates);
      if (isFinite(q)) setExRate(String(+q.toFixed(6)));
    }
  }, [currency, rates, auto]);

  const onCurrency = (c: string) => {
    setCurrency(c);
    setAuto(true);
  };

  const riskPct = riskMode === "custom" ? num(customRisk) / 100 : parseFloat(riskMode) / 100;

  const calc = useMemo(
    () => computeCalc({ account, currency, exRate, rates, riskPct, entry, stop, tp, instrument, advOpen, adv }),
    [account, currency, exRate, rates, riskPct, entry, stop, tp, instrument, advOpen, adv]
  );

  const primaryW = useMemo(() => {
    const s = extra.reduce((a, x) => a + (isFinite(num(x.weight)) ? num(x.weight) : 0), 0);
    return Math.max(0, 100 - s);
  }, [extra]);

  const multi = useMemo(
    () => (multiMode ? computeMulti(calc, entry, extra, allocMode, primaryW) : null),
    [multiMode, calc, entry, extra, allocMode, primaryW]
  );

  const positionLots = multiMode && multi ? multi.totalLots : calc.singleLots;
  const spec = calc.base;
  const distLabel = spec.pointLabel;
  const unit = spec.unit || "lots";

  const copyLots = () => {
    const txt = fmtLots(positionLots);
    if (txt === "\u2014") return;
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  const addEntry = () => setExtra((e) => [...e, { price: "", weight: "20" }]);
  const rmEntry = (i: number) => setExtra((e) => e.filter((_, idx) => idx !== i));
  const setExtraField = (i: number, k: keyof ExtraEntry, v: string) =>
    setExtra((e) => e.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  const canSave = isFinite(positionLots) && positionLots > 0 && isFinite(calc.rr);
  const saveTrade = () => {
    if (!canSave) return;
    setTrades((tr) => [
      {
        id: Date.now(), date: new Date().toISOString(), instrument, direction,
        entry: multiMode && multi ? fmt2(multi.wAvgEntry, 5) : entry, stop, tp,
        lots: positionLots, riskPct: riskPct * 100, rr: calc.rr,
        expProfit: calc.potProfit, expLoss: calc.potLoss, currency, result: null,
      },
      ...tr,
    ]);
    setShowJournal(true);
  };
  const setResult = (id: number, r: "win" | "loss") =>
    setTrades((tr) => tr.map((t) => (t.id === id ? { ...t, result: t.result === r ? null : r } : t)));
  const delTrade = (id: number) => setTrades((tr) => tr.filter((t) => t.id !== id));

  const stats = useMemo(() => {
    const wins = trades.filter((t) => t.result === "win").length;
    const losses = trades.filter((t) => t.result === "loss").length;
    const rrs = trades.map((t) => t.rr).filter((n) => isFinite(n));
    const counts: Record<string, number> = {};
    trades.forEach((t) => (counts[t.instrument] = (counts[t.instrument] || 0) + 1));
    let most = "\u2014", max = 0;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > max) { max = v; most = k; }
    });
    return {
      total: trades.length,
      avgRR: rrs.length ? rrs.reduce((a, b) => a + b, 0) / rrs.length : NaN,
      most,
      winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : NaN,
      totalProfit: trades.reduce((a, t) => a + (isFinite(t.expProfit) ? t.expProfit : 0), 0),
      totalLoss: trades.reduce((a, t) => a + (isFinite(t.expLoss) ? t.expLoss : 0), 0),
    };
  }, [trades]);

  const instGroups = INSTRUMENT_GROUPS.map((g) => ({
    label: g.label,
    options: g.keys.map((k) => ({ value: k, label: INSTRUMENTS[k].label })),
  }));
  const effQuote = currency === "USD" ? 1 : num(exRate) > 0 ? num(exRate) : liveQuoteFor(currency, rates);
  const statusText =
    ratesStatus === "loading" ? "Updating\u2026" : ratesStatus === "live" ? "Live" : ratesStatus === "cached" ? "Cached" : "Default";
  const statusColor = ratesStatus === "live" ? C.green : ratesStatus === "loading" ? C.dim : C.gold;

  return (
    <div style={{ minHeight: "100%", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif", background: "radial-gradient(1100px 560px at 50% -8%, rgba(79,111,255,0.18), transparent 60%), radial-gradient(720px 520px at 92% 110%, rgba(125,147,255,0.10), transparent 60%), #0a0b12", padding: "26px 16px 72px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Brand */}
        <div style={{ position: "relative", textAlign: "center", padding: "12px 0 6px" }}>
          <button
            onClick={() => setShowJournal((v) => !v)}
            aria-label="Journal"
            style={{ position: "absolute", top: 8, right: 0, background: showJournal ? C.accent : C.fill, border: "none", color: showJournal ? "#fff" : C.dim, borderRadius: 12, padding: "9px 11px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}
          >
            <BookOpen size={16} />
            {trades.length ? trades.length : ""}
          </button>
          <div style={{ display: "inline-flex", filter: "drop-shadow(0 10px 26px rgba(79,111,255,0.5))" }}>
            <RiskLotIcon size={64} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginTop: 14 }}>
            Risk<span style={{ color: C.accent }}>Lot</span>
          </div>
          <div style={{ color: C.dim, fontSize: 13.5, marginTop: 6 }}>Position Size Calculator for Traders</div>
        </div>

        {/* HERO */}
        <div style={{ ...glass, border: "1px solid rgba(79,111,255,0.22)", background: "linear-gradient(165deg, rgba(79,111,255,0.20) 0%, rgba(255,255,255,0.04) 46%, rgba(255,255,255,0.02) 100%)", boxShadow: "0 24px 70px rgba(0,0,0,0.5), 0 0 90px rgba(79,111,255,0.16)", padding: "30px 22px 28px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,0.08)", borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 600 }}>{spec.label.split(" ")[0]}</span>
            <span style={{ background: direction === "Long" ? "rgba(47,214,168,0.16)" : "rgba(255,93,108,0.16)", color: direction === "Long" ? C.green : C.red, borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 700 }}>{direction}</span>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: C.faint, marginTop: 12 }}>Position Size</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: "clamp(54px, 16vw, 96px)", fontWeight: 700, letterSpacing: -3, lineHeight: 1, background: "linear-gradient(135deg, #ffffff 0%, #8aa0ff 110%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "#dfe6ff" }}>{fmtLots(positionLots)}</span>
            <span style={{ fontSize: 20, fontWeight: 500, color: C.dim }}>{unit}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <button
              onClick={copyLots}
              style={{ background: copied ? C.green : "linear-gradient(180deg, #5a78ff, #4F6FFF)", color: "#fff", border: "none", borderRadius: 14, padding: "13px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: copied ? "none" : "0 8px 24px rgba(79,111,255,0.45)", transition: "all .15s" }}
            >
              {copied ? <Check size={17} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy size"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 20, flexWrap: "wrap", fontSize: 13.5, color: C.dim }}>
            <span>
              Risk <b style={{ color: C.text, fontWeight: 600 }}>{money(calc.riskAmt, currency)}</b>
              {currency !== "USD" && isFinite(calc.riskUSD) ? <span style={{ color: C.faint }}> ({money(calc.riskUSD, "USD")})</span> : null}
            </span>
            <span style={{ color: C.faint }}>·</span>
            <span>Stop <b style={{ color: C.text, fontWeight: 600 }}>{fmt2(calc.singleDistPts)} {distLabel}</b></span>
            {isFinite(calc.rr) && (
              <>
                <span style={{ color: C.faint }}>·</span>
                <span>RR <b style={{ color: C.text, fontWeight: 600 }}>1:{calc.rr.toFixed(2)}</b></span>
              </>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ ...glass, padding: 24 }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><SLabel>Instrument</SLabel><FSelect value={instrument} onChange={setInstrument} groups={instGroups} /></div>
            <div><SLabel>Direction</SLabel><Segmented value={direction} onChange={(v) => setDirection(v as Direction)} options={[{ value: "Long", label: "Long", color: C.green }, { value: "Short", label: "Short", color: C.red }]} /></div>
          </div>

          <div style={{ marginTop: 20 }}>
            <SLabel>Entry · Stop · Target</SLabel>
            <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <FInput value={entry} onChange={setEntry} placeholder="Entry" />
              <FInput value={stop} onChange={setStop} placeholder="Stop" />
              <FInput value={tp} onChange={setTp} placeholder="Target" />
            </div>
          </div>

          <div style={{ height: 1, background: C.line, margin: "22px 0" }} />

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><SLabel>Account size</SLabel><FInput value={account} onChange={setAccount} placeholder="100000" /></div>
            <div><SLabel>Currency</SLabel><FSelect value={currency} onChange={onCurrency} options={CURRENCIES.map(([c]) => ({ value: c, label: c }))} /></div>
          </div>

          {currency !== "USD" && (
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.faint }}>Current FX rate</div>
                  <div style={{ fontSize: 24, fontWeight: 700, marginTop: 5, letterSpacing: -0.5 }}>
                    <span style={{ color: C.dim, fontSize: 14, fontWeight: 600, marginRight: 8 }}>{fxPair(currency)}</span>
                    {fmtRate(effQuote, currency)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 8, background: statusColor, boxShadow: ratesStatus === "live" ? `0 0 8px ${C.green}` : "none" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: statusColor }}>{statusText}</span>
                  </div>
                  {ratesAt ? <div style={{ fontSize: 10.5, color: C.faint, marginTop: 5 }}>Updated {fmtTime(ratesAt)}</div> : null}
                </div>
              </div>
              {ratesStatus === "cached" && <div style={{ fontSize: 11, color: C.gold, marginTop: 8 }}>Using cached FX rate — live source unavailable</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <button
                  onClick={() => loadRates(true)}
                  disabled={ratesStatus === "loading"}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: C.fill, border: "none", borderRadius: 11, padding: "9px 13px", cursor: "pointer", color: C.accent2, fontSize: 13, fontWeight: 600 }}
                >
                  <RefreshCw size={13} style={ratesStatus === "loading" ? { animation: "rl-spin .8s linear infinite" } : undefined} /> Refresh rate
                </button>
                <button
                  onClick={() => setAuto((v) => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: C.fill, border: "none", borderRadius: 11, padding: "9px 13px", cursor: "pointer", color: C.text, fontSize: 13, fontWeight: 600 }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: 6, background: auto ? C.accent : "transparent", border: auto ? "none" : `1.5px solid ${C.faint}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {auto && <Check size={13} color="#fff" />}
                  </span>
                  Auto FX rate
                </button>
              </div>
              {!auto && (
                <div style={{ marginTop: 12 }}>
                  <SLabel>Manual {fxPair(currency)}</SLabel>
                  <FInput value={exRate} onChange={setExRate} placeholder="rate" step="0.0001" />
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <SLabel>Risk per trade</SLabel>
            <Segmented value={riskMode} onChange={(v) => setRiskMode(v as RiskMode)} options={[{ value: "0.25", label: "0.25%" }, { value: "0.5", label: "0.5%" }, { value: "1", label: "1%" }, { value: "custom", label: "Custom" }]} />
            {riskMode === "custom" && <div style={{ marginTop: 10 }}><FInput value={customRisk} onChange={setCustomRisk} placeholder="0.75" step="0.05" /></div>}
          </div>
        </div>

        {/* Risk / reward */}
        <Disclosure title="Risk / reward" hint={isFinite(calc.rr) ? `1 : ${calc.rr.toFixed(2)}` : "add a target"} open={rrOpen} onToggle={() => setRrOpen((v) => !v)}>
          <RRBar entry={calc.E} stop={calc.S} tp={calc.T} rr={calc.rr} riskPts={calc.rrRiskPrice / calc.pointSize} rewardPts={calc.rrRewardPrice / calc.pointSize} distLabel={distLabel} />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 22 }}>
            <Metric label="Potential loss" value={money(calc.potLoss, currency)} color={C.red} size={20} />
            <Metric label="R : R" value={isFinite(calc.rr) ? `1:${calc.rr.toFixed(2)}` : "\u2014"} color={C.accent2} size={20} />
            <Metric label="Potential profit" value={money(calc.potProfit, currency)} color={C.green} size={20} />
          </div>
        </Disclosure>

        {/* Multi-entry */}
        <Disclosure title="Multi-entry scale-in" hint={multiMode && multi ? `${fmtLots(multi.totalLots)} ${unit} combined` : "single entry"} open={multiMode} onToggle={() => setMultiMode((v) => !v)}>
          {multiMode && multi && (
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, maxWidth: 240 }}>
                {(["equal", "weighted"] as AllocMode[]).map((m) => (
                  <button key={m} onClick={() => setAllocMode(m)} style={{ flex: 1, background: allocMode === m ? C.accent : C.fill, color: allocMode === m ? "#fff" : C.dim, border: "none", borderRadius: 10, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {m === "equal" ? "Equal" : "Weighted"}
                  </button>
                ))}
              </div>
              {multi.out.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < multi.out.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span style={{ width: 52, fontSize: 12.5, color: C.faint, fontWeight: 600 }}>Entry {i + 1}</span>
                  {i === 0 ? (
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{fmt2(r.price, 5)}</span>
                  ) : (
                    <input type="number" inputMode="decimal" value={extra[i - 1].price} onChange={(e) => setExtraField(i - 1, "price", e.target.value)} placeholder="price" style={{ ...fieldStyle, flex: 1, padding: "8px 11px" }} />
                  )}
                  {allocMode === "weighted" &&
                    (i === 0 ? (
                      <span style={{ width: 56, textAlign: "right", fontSize: 13, color: C.dim }}>{fmt2(primaryW)}%</span>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, width: 56 }}>
                        <input type="number" value={extra[i - 1].weight} onChange={(e) => setExtraField(i - 1, "weight", e.target.value)} style={{ ...fieldStyle, width: 42, padding: "8px 6px" }} />
                        <span style={{ fontSize: 12, color: C.faint }}>%</span>
                      </div>
                    ))}
                  <span style={{ width: 56, textAlign: "right", fontSize: 14, fontWeight: 700, color: C.accent2 }}>{fmtLots(r.lots)}</span>
                  {i > 0 ? (
                    <button onClick={() => rmEntry(i - 1)} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer" }}><Trash2 size={15} /></button>
                  ) : (
                    <span style={{ width: 15 }} />
                  )}
                </div>
              ))}
              <button onClick={addEntry} style={{ marginTop: 12, background: C.fill, border: "none", color: C.accent2, borderRadius: 11, padding: "10px 0", width: "100%", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={15} /> Add entry
              </button>
              <div style={{ marginTop: 16 }}><MultiDiagram out={multi.out} stop={calc.S} /></div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 18 }}>
                <Metric label={`Combined ${unit}`} value={`${fmtLots(multi.totalLots)}`} color={C.accent2} size={19} />
                <Metric label="Total risk" value={money(multi.totalRisk, currency)} color={C.red} size={19} />
                <Metric label="Avg entry" value={fmt2(multi.wAvgEntry, 2)} size={19} />
              </div>
            </div>
          )}
        </Disclosure>

        {/* Advanced */}
        <Disclosure title="Advanced" hint="broker specs" open={advOpen} onToggle={() => setAdvOpen((v) => !v)}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><SLabel>Value / point</SLabel><FInput value={adv.vpp} onChange={(v) => setAdv((a) => ({ ...a, vpp: v }))} placeholder={calc.vpp.toFixed(2)} /></div>
            <div><SLabel>Point size</SLabel><FInput value={adv.pointSize} onChange={(v) => setAdv((a) => ({ ...a, pointSize: v }))} placeholder={String(spec.pointSize)} /></div>
            <div><SLabel>Contract</SLabel><FInput value={adv.contract} onChange={(v) => setAdv((a) => ({ ...a, contract: v }))} placeholder="100000" /></div>
          </div>
        </Disclosure>

        {/* Trade summary */}
        <Disclosure title="Trade summary" open={sumOpen} onToggle={() => setSumOpen((v) => !v)}>
          <div>
            <KV label="Instrument" value={spec.label.split(" ")[0]} />
            <KV label="Direction" value={direction} color={direction === "Long" ? C.green : C.red} />
            <KV label="Account" value={money(calc.acc, currency)} />
            <KV label="Risk" value={`${fmt2(riskPct * 100)}%  ·  ${money(calc.riskAmt, currency)}`} color={C.red} />
            {currency !== "USD" && <KV label="FX rate" value={`${fxPair(currency)}  ${fmtRate(effQuote, currency)}`} />}
            {currency !== "USD" && <KV label="Risk in USD" value={money(calc.riskUSD, "USD")} />}
            <KV label="Position size" value={`${fmtLots(positionLots)} ${unit}`} color={C.accent2} />
            <KV label="Entry" value={multiMode && multi ? fmt2(multi.wAvgEntry, 5) : entry || "\u2014"} />
            <KV label="Stop loss" value={stop || "\u2014"} color={C.red} />
            <KV label="Take profit" value={tp || "\u2014"} color={C.green} />
            <KV label="R : R" value={isFinite(calc.rr) ? `1 : ${calc.rr.toFixed(2)}` : "\u2014"} color={C.accent2} />
            <KV label="Expected loss" value={money(calc.potLoss, currency)} color={C.red} />
            <KV label="Expected profit" value={money(calc.potProfit, currency)} color={C.green} />
            <button onClick={saveTrade} disabled={!canSave} style={{ marginTop: 16, width: "100%", background: canSave ? C.fill : "rgba(255,255,255,0.03)", color: canSave ? C.text : C.faint, border: "none", borderRadius: 13, padding: "13px 0", fontSize: 14.5, fontWeight: 600, cursor: canSave ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Save size={16} /> Save to journal
            </button>
          </div>
        </Disclosure>

        {/* Journal */}
        {showJournal && (
          <div style={{ ...glass, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Journal</span>
              <button onClick={() => setShowJournal(false)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Metric label="Trades" value={stats.total} size={20} />
              <Metric label="Avg R:R" value={isFinite(stats.avgRR) ? `1:${stats.avgRR.toFixed(2)}` : "\u2014"} color={C.accent2} size={20} />
              <Metric label="Win rate" value={isFinite(stats.winRate) ? `${stats.winRate.toFixed(0)}%` : "\u2014"} color={C.green} size={20} />
              <Metric label="Top mkt" value={stats.most} size={16} />
              <Metric label="Exp profit" value={money(stats.totalProfit, currency)} color={C.green} size={16} />
              <Metric label="Exp loss" value={money(stats.totalLoss, currency)} color={C.red} size={16} />
            </div>
            {trades.length === 0 ? (
              <div style={{ color: C.faint, fontSize: 13.5, textAlign: "center", padding: "16px 0" }}>No trades yet. Build one and save it.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                {trades.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13, minWidth: 500 }}>
                    <span style={{ color: C.faint, width: 56, fontSize: 11.5 }}>{new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    <span style={{ width: 64, fontWeight: 600 }}>{t.instrument}</span>
                    <span style={{ width: 42, color: t.direction === "Long" ? C.green : C.red, fontWeight: 600 }}>{t.direction}</span>
                    <span style={{ width: 86, color: C.dim }}>{fmtLots(t.lots)} {unitFor(t.instrument)}</span>
                    <span style={{ width: 54, color: C.accent2 }}>1:{isFinite(t.rr) ? t.rr.toFixed(1) : "?"}</span>
                    <span style={{ flex: 1, color: C.green }}>{money(t.expProfit, t.currency || currency)}</span>
                    <button onClick={() => setResult(t.id, "win")} style={{ background: t.result === "win" ? C.green : C.fill, color: t.result === "win" ? "#fff" : C.dim, border: "none", borderRadius: 8, padding: "4px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>W</button>
                    <button onClick={() => setResult(t.id, "loss")} style={{ background: t.result === "loss" ? C.red : C.fill, color: t.result === "loss" ? "#fff" : C.dim, border: "none", borderRadius: 8, padding: "4px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>L</button>
                    <button onClick={() => delTrade(t.id)} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", color: C.faint, fontSize: 11, marginTop: 8, lineHeight: 1.7 }}>
          FX rates auto-refresh every 24h · all sizing runs on USD risk · stocks size in shares · adjust specs under Advanced
          <br />
          Educational tool — not financial advice
        </div>
      </div>
    </div>
  );
}
