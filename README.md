# WealthFlow

WealthFlow is a lightweight, privacy‑first Progressive Web App (PWA) to track your loans, accounts, savings & investments, crypto, and day‑to‑day transactions — all stored locally in your browser. No backend, no sign‑in. Works offline and can be installed to your home screen.

Current local date/time: 2025-08-30 00:04

## What’s new (UI refresh)
- Modernized visual design with Inter font, rounded cards, subtle elevation and hover motion
- Sticky, translucent top bar with blur and improved action layout (Install button moved into top bar)
- Polished buttons (gradients, shadows), improved focus states for accessibility
- Table row hovers and refined spacing for a crisper, “rich” feel
- Mobile drawer and safe‑area polish maintained

## Highlights
- Single‑page app with clean, responsive UI (mobile‑friendly with slide‑out sidebar)
- PWA: installable, offline‑first caching, standalone mode
- Full local data ownership (localStorage). Import/Export your data as JSON
- Multi‑asset tracking: Cash/Bank/Credit Cards, manual Savings/Investments, Crypto holdings
- Lending module with daily interest accrual (Actual/365) and history
- Transactions with categories and a simple month‑close workflow that aggregates monthly totals
- Multi‑currency support (SGD, INR, USD base display) with live FX snapshot via Frankfurter API
- Live crypto prices via CoinGecko (2‑minute cache)
- Light/Dark theme toggle with automatic system detection

## Tech stack
- Vanilla HTML, CSS, JS (no build steps required)
- Progressive Web App: `manifest.webmanifest` + `service-worker.js`
- Data storage: `localStorage`
- External data:
  - FX: https://api.frankfurter.app (ECB rates)
  - Crypto prices: https://api.coingecko.com (simple price endpoint)

## Quick start
Because this is a static PWA, you can run it from any static server.

- Option A: Simple local server (Node)
  - `npx http-server` (or `npx serve`) from the project root
  - Open http://localhost:8080 (or the URL printed by your server)
- Option B: PHP built‑in server
  - `php -S localhost:8080 -t .`
  - Open http://localhost:8080
- Option C: Any static host (HTTPS recommended for PWA)
  - GitHub Pages, Netlify, Vercel, etc.

PWA features (install prompt, service worker) require HTTPS or `localhost`.

## File structure (important files)
- `index.html` — The entire app UI + logic (SPA). Contains all views and JS for state, rendering, and actions
- `service-worker.js` — Offline caching with cache‑first strategy and offline fallback
- `manifest.webmanifest` — PWA metadata (name, icons, theme, shortcuts)
- `offline.html` — Offline fallback page used by the service worker
- Icons — `icon-192.png`, `icon-512.png`, `apple-touch-icon-180.png`, SVGs

Vendor files under `vendor/` are present due to Composer scaffolding but are not required to run the app.

## Pages / Views
Navigation is handled within `index.html` using buttons in the left sidebar. Each view is a section that is shown/hidden (no page reloads).

1. Dashboard (view-dashboard)
   - KPIs: Net Worth (in selectable Base currency: SGD/INR/USD), Total Assets, Total Liabilities
   - Lending overview: Outstanding Principal, Total Repaid (Principal), Interest Collected
   - Assets by Category: Accounts, Savings & Investments, Crypto, Lending
   - Controls:
     - Base currency select (affects display only)
     - Include Lending toggle for net worth calculation
     - FX badge shows SGD→INR and SGD→USD snapshot

2. Accounts (view-accounts)
   - Track Cash, Bank, and Credit Card balances
   - Fields: Type, Name, Currency (INR/SGD), Balance/Limit Used, Note
   - Actions: Add/Update, Edit, Delete
   - Pay Credit Card: modal to transfer funds from Cash/Bank to a Credit Card (same currency requirement)

3. Savings & Investments (view-investments)
   - Manual entries for savings/investments
   - Fields: Asset Name, Currency (INR/SGD), Amount, Mode/Type (SSB/FD/ETF/…), Note
   - Actions: Add/Update, Edit, Delete
   - Increase (Top‑up) via modal: move funds from a matching‑currency Cash/Bank account into the investment; creates an Expense transaction with category "Savings"

4. Crypto (view-crypto)
   - Track crypto holdings with live price lookup (CoinGecko)
   - Fields: Ticker (e.g., BTC, ETH, SOL), Quantity, Buy Price (per unit), Currency (INR/SGD), Note
   - Actions: Add/Update, Edit, Delete, Refresh Prices
   - Shows Last Price (SGD/INR), Value (Base), and simple P/L (Base)

5. Lending (view-loans)
   - Create and manage simple loans with daily interest accrual (Actual/365) on remaining principal
   - New Loan fields: Borrower, Currency (INR/SGD), Principal, APR %, Start Date, Notes
   - Loans table shows: Borrower, Currency, APR, Principal Balance, Repaid, Interest, Last Txn, Status
   - Actions per loan: Payment (modal with interest/principal breakdown preview), Top‑up, Close/Reopen, History (alert), Delete

6. Transactions (view-transactions)
   - Record Expense, Income, or Transfer between accounts
   - Fields: Date, Type, Account, Target Account (for Transfer/CC Pay), Category, Amount, Note
   - Actions: Add Transaction, Delete
   - Close Month: aggregates all Expense transactions for a selected month into `Monthly Totals` (by category) and clears detailed transactions for that month

7. Categories (view-categories)
   - Manage list of categories (e.g., Food, Transport, Bills, …)
   - See Monthly Totals table (aggregated at month close) displayed in selected Base currency using stored FX snapshot

8. Settings & PWA (view-settings)
   - Instructions for PWA install and placement of manifest/service worker/icons
   - Shows sample manifest and service worker snippets

### Top bar controls (always visible)
- Theme toggle (Light/Dark)
- Export JSON — downloads your current local data as a JSON file
- Import JSON — restore data from a previously exported JSON file
- Reset All — clears all local data (irreversible)

## Data model & storage
- Stored under localStorage key `loan-tracker:v3`
- Structure (simplified):
  - loans: [{ id, borrower, currency, apr, startDate, notes, balance, totalRepaid, totalInterest, lastCalcDate, closed, createdAt, txns: [...] }]
  - accounts: [{ id, type, name, currency, amount, note }]
  - investments: [{ id, name, currency, amount, mode, note }]
  - crypto: [{ id, ticker, quantity, buyPrice, currency, note, lastPrice: { SGD, INR, USD } }]
  - transactions: [{ id, date, type, account, accountName, target, targetName, category, amount, currency, note }]
  - categories: ["Food", "Transport", ...]
  - monthlyTotals: { "YYYY-MM": { Category: { SGD, INR, fx } } }
  - cache: { rates: { ts, data }, prices: { [ids]: { ts, data } } }

Notes:
- A one‑time migration step auto‑loads prior `loan-tracker:v2` data if present
- FX cache TTL ≈ 10 minutes; Crypto prices cache TTL ≈ 2 minutes

## Currency & FX
- Base currency is for display (SGD/INR/USD). Accounts/transactions stay in their native currency
- FX conversion uses a snapshot from Frankfurter (SGD→INR,SGD→USD). Net worth and category totals use this snapshot for on‑screen aggregation

## PWA, offline & installation
- Service worker caches core assets (`index.html`, icons, manifest, `offline.html`)
- Works offline; live data (FX/crypto) refresh when network returns
- Installation prompt supported (Add to Home Screen / Install App). Button appears when available
- On iOS, use Safari → Share → Add to Home Screen
- iOS safe‑area insets (notch) are handled in CSS

## Accessibility & mobile UX
- Responsive grid and mobile drawer sidebar
- Buttons include labels/aria attributes where applicable
- Prevents scroll bleed when mobile menu is open

## Deployment
- Serve the project root over HTTPS for best PWA behavior
- If you modify static assets, consider bumping the `CACHE` version in `service-worker.js` to invalidate old caches
- Ensure `manifest.webmanifest`, `service-worker.js`, and icons reside at the app root alongside `index.html`

## Troubleshooting
- PWA not installing? Check HTTPS or use `localhost`, verify manifest and service worker paths
- Seeing stale assets? Clear site data or increment `CACHE` name in `service-worker.js`
- Crypto prices not updating? CoinGecko rate limited or offline — try again after a few minutes
- FX rates not showing? Frankfurter unreachable — app falls back to last cached or default values

## License
This project has no explicit license in the repository. Add a license file if you intend to distribute it.

