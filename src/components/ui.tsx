import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { C, fieldStyle } from "../lib/theme";

export interface Opt {
  value: string;
  label: string;
  color?: string;
}

export function SLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.faint, marginBottom: 9 }}>
      {children}
    </div>
  );
}

export function FInput({
  value, onChange, placeholder, step,
}: { value: string; onChange: (v: string) => void; placeholder?: string; step?: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={fieldStyle}
      onFocus={(e) => {
        e.target.style.boxShadow = "0 0 0 3px rgba(79,111,255,0.28)";
        e.target.style.background = C.fillHover;
      }}
      onBlur={(e) => {
        e.target.style.boxShadow = "none";
        e.target.style.background = C.fill;
      }}
    />
  );
}

export function FSelect({
  value, onChange, options, groups,
}: {
  value: string;
  onChange: (v: string) => void;
  options?: Opt[];
  groups?: { label: string; options: Opt[] }[];
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...fieldStyle, appearance: "none", paddingRight: 34, cursor: "pointer" }}
      >
        {groups
          ? groups.map((g) => (
              <optgroup key={g.label} label={g.label} style={{ background: "#15171f" }}>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: "#15171f", color: C.text }}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))
          : options?.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#15171f", color: C.text }}>
                {o.label}
              </option>
            ))}
      </select>
      <ChevronDown size={16} style={{ position: "absolute", right: 12, top: 14, color: C.dim, pointerEvents: "none" }} />
    </div>
  );
}

export function Segmented({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: Opt[] }) {
  return (
    <div style={{ display: "flex", gap: 4, background: C.fill, borderRadius: 13, padding: 4 }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1, padding: "9px 6px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13.5, fontWeight: 600, background: on ? o.color || C.accent : "transparent",
              color: on ? "#fff" : C.dim, boxShadow: on ? "0 4px 14px rgba(0,0,0,0.28)" : "none",
              transition: "all .15s",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Metric({
  label, value, color, size = 23,
}: { label: ReactNode; value: ReactNode; color?: string; size?: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, color: C.faint, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: size, fontWeight: 700, color: color || C.text, marginTop: 6, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

export function KV({ label, value, color }: { label: ReactNode; value: ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ color: C.dim, fontSize: 13.5 }}>{label}</span>
      <span style={{ color: color || C.text, fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export function Disclosure({
  title, hint, open, onToggle, children,
}: { title: ReactNode; hint?: ReactNode; open: boolean; onToggle: () => void; children: ReactNode }) {
  // glass is applied by the caller wrapper; keep this self-contained:
  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.022))",
        backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
        border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.32)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: "18px 22px", color: C.text }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600 }}>
          {title}
          {hint && <span style={{ color: C.faint, fontWeight: 400, fontSize: 13 }}>{hint}</span>}
        </span>
        <ChevronDown size={18} color={C.dim} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && <div style={{ padding: "2px 22px 24px" }}>{children}</div>}
    </div>
  );
}
