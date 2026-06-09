import type { CSSProperties } from "react";

export const C = {
  text: "#eef1f8", dim: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.36)",
  accent: "#4F6FFF", accent2: "#8aa0ff", green: "#2fd6a8", red: "#ff5d6c", gold: "#f0b35f",
  fill: "rgba(255,255,255,0.05)", fillHover: "rgba(255,255,255,0.08)", line: "rgba(255,255,255,0.07)",
} as const;

export const DAY = 24 * 60 * 60 * 1000;

export const glass: CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.022))",
  backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
  border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.32)",
};

export const fieldStyle: CSSProperties = {
  background: C.fill, border: "1px solid transparent", color: C.text, borderRadius: 13,
  padding: "13px 14px", width: "100%", fontSize: 15.5, fontWeight: 500, outline: "none",
  boxSizing: "border-box", transition: "background .15s, box-shadow .15s",
};
