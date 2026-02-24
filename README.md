# Personal-Finance-analytics-dashboard
# FinTrack – Personal Finance Analytics Dashboard

FinTrack is a React + Vite web app for tracking monthly income and spending. It helps users understand expense distribution, estimate savings, and quickly review actionable finance insights.

## Features

- Input monthly income and category expenses.
- Preloaded categories: Food, Travel, Shopping, Rent, Bills, Other.
- Add/remove custom categories dynamically.
- Live calculations:
  - Total expense
  - Savings
  - Savings rate (%)
  - Highest spending category
- Visual analytics:
  - Pie chart for category share
  - Bar chart for category amounts
- Rule-based insights (non-AI), including:
  - Food spend as a share of income
  - Savings-rate health signal
  - Top spending category summary
- Input validation and warnings:
  - No negative income/expenses
  - Warning when expenses exceed income (negative savings)
- Responsive dashboard layout for desktop and mobile.

## Tech Stack

- **Frontend:** React + Vite
- **Charts:** Recharts
- **Styling:** Plain CSS
- **Deployment target:** Vercel

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

Then open the local URL printed by Vite (usually `http://localhost:5173`).

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Vercel will auto-detect **Vite** settings.
4. Use the default build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

## Security Note

This MVP runs fully in the browser and does not require API keys. Do not hardcode or expose API keys in frontend code.
