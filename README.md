# RiskLot — Position Size Calculator

A premium, fintech-styled position size calculator for traders. Sizes Forex,
Indices, Metals, Commodities and Stocks from your account risk, with automatic
USD exchange-rate conversion, a risk/reward visualizer, multi-entry scale-in
sizing, and a local trade journal.

Built with **React + TypeScript + Vite**.

## Features

- Four calculation engines — Forex (pip value), Indices ($/point), Metals/Commodities (contract size), Stocks (shares).
- Automatic FX: account-currency risk is converted to USD using live rates, cached for 24h, with manual override + auto toggle.
- Risk/reward bar, multi-entry scale-in (equal/weighted), trade summary, and a journal with win-rate stats.
- State and journal persist in `localStorage`.
- Fully responsive, dark, glassmorphism UI.

## Requirements

- Node.js 18+ and npm.

## Installation

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build into /dist
npm run preview  # preview the production build locally
```

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import it in Vercel — framework preset **Vite** is auto-detected.
3. Build command `npm run build`, output directory `dist`. Deploy.

The favicon is at `public/favicon.svg` and referenced from `index.html`.

## Exchange rates

Rates are fetched client-side from free, key-less endpoints:
`open.er-api.com` (primary) and `exchangerate.host` (fallback). They are USD-based
(units of currency per 1 USD), cached in `localStorage` with a timestamp, and
refreshed automatically when older than 24 hours. If both endpoints are
unreachable, the app uses the last cached value (or the built-in defaults in
`src/data/currencies.ts`) and flags the status.

To centralize calls (one shared fetch instead of per-visitor), point
`fetchRates()` in `src/lib/fx.ts` at your own caching proxy (e.g. a Vercel
serverless function) instead of the public endpoints.

## Customization

- **Instruments & contract specs:** `src/data/instruments.ts`. Each entry sets
  `kind`, `pointSize`, `pointLabel`, `vpp` (USD value per point/pip per lot) and
  `unit`. Users can also override value-per-point and point-size at runtime in
  the **Advanced** panel.
- **Currencies & FX defaults:** `src/data/currencies.ts` (`CURRENCIES`,
  `FX_TYPE`, `RATE_DEFAULTS`). `FX_TYPE` controls quote direction: `base`
  currencies (EUR, GBP, AUD, NZD) quote as `CUR/USD` and multiply; `quote`
  currencies (JPY, CHF, CAD, CZK) quote as `USD/CUR` and divide.
- **Theme:** `src/lib/theme.ts` (colors, glass surface, input style).
- **Pure logic** lives in `src/lib/calc.ts` and is framework-free — easy to unit test.

## Project structure

```
src/
  App.tsx              page composition + state
  types.ts             shared types
  data/                instruments + currencies
  lib/                 theme, storage, format, fx, calc (pure)
  components/          RiskLotIcon, UI primitives, charts
```

## Disclaimer

Educational tool — not financial advice. Cross-pair pip values and index/stock
contract sizes are typical defaults; verify against your broker and use the
Advanced overrides where they differ.
