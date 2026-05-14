# Finance — Personal Finance Tracker

A mobile-first personal finance web app with cloud sync. Sign in from any device and your data follows you.

---

## Does it have a database?

**Yes — [Supabase](https://supabase.com)** (PostgreSQL). Data is stored in the cloud, tied to your account, and synced across all your devices. There is no custom backend to run — Supabase acts as the API layer directly.

**Flow:**
1. You sign up / sign in on the auth page
2. On first login the app seeds demo data into your account
3. Every add / edit / delete writes to Supabase in the background
4. Logging in on another device loads all your data automatically

**In-memory state** is managed by Zustand. Supabase is the source of truth; Zustand is the fast local cache for React rendering.

---

## Deployment (free, ~10 minutes)

### Step 1 — Create a Supabase project

1. Go to **[supabase.com](https://supabase.com)** → New project (free tier)
2. Open **SQL Editor → New query**, paste the contents of `supabase-schema.sql`, and run it
3. Go to **Authentication → Providers → Email** and **disable "Confirm email"** so users can sign in immediately without email verification (you can re-enable it later)
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create finance-app --public --push
# or push to an existing repo manually
```

### Step 3 — Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** → Add New Project → Import your GitHub repo
2. Vercel auto-detects Vite — no config needed
3. In **Environment Variables** add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy**

That's it. Every `git push` to `main` triggers a new deployment automatically.

### Local development with Supabase

```bash
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

---

## User Guide

### First Launch

On first open the app seeds itself with 3 months of example data so every widget is populated immediately. You can delete or overwrite this at any time.

### Navigation

| Tab | What it does |
|---|---|
| **Dashboard** | Monthly overview — spending vs budget, upcoming bills, goal progress, recent transactions |
| **Transactions** | Full transaction history with search, filters, add / edit / delete |
| **Bills** | Recurring payments (rent, subscriptions). Shows which are due soon |
| **Goals** | Savings goals with a progress bar and inline contribution button |
| **Trends** | Charts: category bar chart (this month vs last), radar spending pattern, daily-spend velocity |
| **Settings** | Theme, base currency, monthly budget, exchange-rate refresh |

### Adding a Transaction

1. Go to **Transactions** → tap **Add**
2. Fill in the date, description, amount, currency, and type (Expense / Income)
3. The **category is auto-detected** from the description — e.g. typing "Netflix" pre-selects *Entertainment*. You can always override it.
4. Hit **Add Transaction**. It appears immediately in the list and on the Dashboard.

### Tracking a Recurring Bill

1. Go to **Bills** → tap **Add Bill**
2. Set name, amount, currency, frequency (weekly / monthly / yearly), and next due date
3. The Dashboard's *Upcoming Bills* widget shows bills due within 7 days. Rows turn amber (≤ 2 days) or red (overdue).

### Creating a Savings Goal

1. Go to **Goals** → tap **Add Goal**
2. Set name, target amount, current amount, currency, and target date
3. On the goal card tap **Contribute** to add money toward the goal. The progress bar updates instantly.

### Reading the Trends Page

- **Velocity Stats** — Your average daily spend this month vs last month, plus a projected month-end total
- **Spending by Category** — Side-by-side bars: this month (blue) and last month (light blue) per category
- **Spending Pattern** — Radar chart showing the shape of your spending across categories

### Multi-Currency

Every transaction, bill, and goal stores its own currency. The Dashboard and Trends page **convert everything to your base currency** using live exchange rates (fetched from open.er-api.com, cached for 1 hour). When offline, hardcoded fallback rates are used.

Change your base currency in **Settings → Currency & Budget**.

### Monthly Budget

Set a monthly spending budget in Settings. The Dashboard Spending Widget shows a progress bar: green below 75%, amber at 75–90%, red above 90%.

### Dark / Light / System Theme

Settings → Appearance, or use the toggle in the sidebar (desktop). The chosen theme is remembered and applied before the page renders — no flash.

---

## Developer Guide

### Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI | React | 19 |
| Language | TypeScript | 6 (strict) |
| Build | Vite | 8 |
| Styling | Tailwind CSS | 4 (Vite plugin) |
| Routing | React Router DOM | 7 |
| Global state | Zustand | 5 |
| Forms | React Hook Form + Zod | 7 + 4 |
| Charts | recharts | 3 |
| Icons | lucide-react | 1 |
| Dates | date-fns | 4 |

### Setup

```bash
cd finance-app
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run lint       # ESLint
```

### Project Structure

```
src/
├── app/
│   └── router.tsx              # createBrowserRouter — 6 routes under AppShell
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Root layout: SideNav (desktop) + BottomNav (mobile) + Outlet
│   │   ├── SideNav.tsx         # Desktop left sidebar with theme toggle
│   │   ├── TopNav.tsx          # Mobile header bar
│   │   └── BottomNav.tsx       # Mobile 6-tab bottom nav
│   └── ui/
│       ├── Button.tsx          # variant: primary | ghost | outline | danger
│       ├── Input.tsx           # forwardRef input with label/error/hint
│       ├── Select.tsx          # forwardRef select
│       ├── Modal.tsx           # Portal + focus trap + Escape/backdrop dismiss
│       ├── Badge.tsx           # Category color chip
│       ├── ProgressBar.tsx     # Animated CSS fill via --progress-width custom property
│       ├── Card.tsx            # Surface panel + CardHeader helper
│       └── EmptyState.tsx
├── features/
│   ├── dashboard/              # Widgets composed from store selectors
│   ├── transactions/           # CRUD + filters + auto-categorization
│   ├── bills/                  # CRUD recurring bills
│   ├── goals/                  # CRUD goals + inline contribution
│   ├── trends/                 # recharts bar + radar charts
│   └── settings/               # Theme / currency / budget / rate refresh
├── hooks/
│   ├── useTheme.ts             # Reads settings.theme, toggles .dark on <html>
│   └── useExchangeRates.ts     # Fetch + 1-hr cache + fallback rates
├── lib/
│   ├── utils.ts                # cn() = twMerge(clsx(...))
│   ├── currencies.ts           # CURRENCY_LIST, FALLBACK_RATES, convertAmount(), formatMoney()
│   ├── categorize.ts           # autoCategory(description) → Category (keyword rules)
│   ├── dateUtils.ts            # Wrappers around date-fns
│   └── storage.ts              # seedDemoData() — runs once on first load
├── store/
│   ├── transactionsSlice.ts    # Zustand store + selectFilteredTransactions, selectMonthlyTotals, selectCategoryTotals
│   ├── billsSlice.ts           # + selectUpcomingBills(bills, days)
│   ├── goalsSlice.ts
│   ├── settingsSlice.ts
│   └── index.ts                # Re-exports all stores and selectors
├── types/
│   └── index.ts                # Transaction, Bill, Goal, Settings, Category, etc.
├── styles/
│   └── index.css               # @import "tailwindcss" + @custom-variant dark + @theme tokens
└── main.tsx                    # seedDemoData() → createRoot → RouterProvider
```

### Data Flow

```
User action (form submit / button click)
       ↓
1. Zustand store action → immediate UI re-render (no waiting)
2. Supabase insert/update/delete (fire-and-forget, background)
       ↓
On login: Supabase → fetchTransactions/Bills/Goals → setTransactions/Bills/Goals
       ↓
Selector functions (selectMonthlyTotals, etc.) recompute via useMemo
```

### State Architecture

Four **independent Zustand stores** (no persist middleware — Supabase is the source of truth):

```
useTransactionsStore  ← loaded from Supabase on login, kept in memory
useBillsStore         ← same
useGoalsStore         ← same
useSettingsStore      ← persisted in localStorage (just preferences: theme, currency, budget)
useAuthStore          ← Supabase User object + loading flag
```

Derived values live in selector functions, never in state:

```ts
const filtered = useMemo(
  () => selectFilteredTransactions(transactions, filters),
  [transactions, filters],
)
```

### Tailwind v4 — Key Differences from v3

- No `tailwind.config.js` needed — design tokens live in `@theme {}` inside `src/styles/index.css`
- Dark mode: `@custom-variant dark (&:where(.dark, .dark *))` replaces `darkMode: 'class'`
- Custom animations defined in `@theme` as `--animate-*` variables, `@keyframes` at the bottom of the CSS file
- Vite integration via `@tailwindcss/vite` plugin — no `postcss.config.js` needed

### Zod v4 — Breaking Change

```ts
// Zod v3 (no longer works in v4)
z.number({ invalid_type_error: 'Must be a number' })

// Zod v4 — just omit the option; use .positive('msg'), .min(), etc. for messages
z.number().positive('Amount must be positive')
```

### recharts v3 — Tooltip Formatter

The `formatter` prop receives `ValueType | undefined`. Always guard:

```ts
formatter={(value) => [
  typeof value === 'number' ? formatMoney(value, currency) : String(value ?? ''),
  '',
]}
```

### Adding a New Category

1. Add the string literal to `Category` in `src/types/index.ts`
2. Add a label in `CATEGORY_LABELS`
3. Add Tailwind classes in `src/components/ui/Badge.tsx` (`CATEGORY_CLASSES`, `CATEGORY_DOT_CLASSES`)
4. Optionally add keyword rules in `src/lib/categorize.ts`

### Resetting Demo Data

```js
// Browser console — re-run seed on next reload:
localStorage.removeItem('finance-app:seeded-v2')
location.reload()

// Wipe everything:
localStorage.clear()
location.reload()
```

Settings → **Clear All Data** does the same wipe with a confirmation prompt.
