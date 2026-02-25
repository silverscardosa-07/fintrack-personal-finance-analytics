# 📊 FinTrack – Personal Finance Analytics Dashboard

A modern **data analytics–driven personal finance dashboard** that helps users track income, analyze spending patterns, monitor savings goals, and visualize financial trends over time.

🔗 **Live Demo:** https://fintrack-dashboard-orcin.vercel.app

💻 **GitHub Repo:** https://github.com/silverscardosa-07/fintrack-personal-finance-analytics.git

---

## 🚀 Features

### 💰 Financial Overview
- Monthly income & expense tracking
- Real-time savings calculation
- Savings rate analytics
- Highest spending category detection

### 🎯 Savings Goal Tracking
- Set monthly target savings
- Ahead/Behind target indicator
- Intelligent goal insights

### 📊 Interactive Visualizations
- Category-wise expense **Pie Chart**
- Expense distribution **Bar Chart**
- 📈 **Savings Trend Line Chart** (month-over-month analytics)

### 🗂 Historical Data (Analytics Focus)
- Save monthly financial snapshots
- Load previous records instantly
- Compare performance across months
- LocalStorage-based persistence

### ➕ Custom Categories
- Add & remove dynamic expense categories

### ⚠️ Smart Validation
- Negative value detection
- Overspending warning

---

## 🧠 Analytics Concepts Used

- Derived metrics (Savings, Savings Rate)
- Trend analysis (time-series visualization)
- Data normalization for storage
- State-driven real-time computation
- Snapshot-based historical comparison

---

## 🛠 Tech Stack

**Frontend**
- React (Hooks + useMemo for performance optimization)
- Recharts (Data visualization)

**State & Storage**
- React State Management
- LocalStorage for persistent historical analytics

**Styling**
- Modern responsive CSS
- Grid-based layout

**Deployment**
- Vercel

---

## 📷 Screenshots

### Dashboard Overview
![Dashboard](./screenshots/dashboard.png)

### Savings Trend
![Trend](./screenshots/trend.png)

### History Tracking
![History](./screenshots/history.png)

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/silverscardosa-07/fintrack-personal-finance-analytics.git
cd fintrack-dashboard
npm install
npm run dev

## 📂 Project Structure
src/
 ├── App.jsx
 ├── index.css
 └── main.jsx

## 📈 Real-World Use Case
This dashboard helps users:
- Track monthly spending behaviour
- Monitor savings performance
- Compare financial growth across months
- Make data-driven budgeting decisions

It can be used by:
- Individuals for personal finance planning
- FinTech apps for user analytics
- Banks to show customer spending insights

## 🧩 Future Enhancements
- Authentication & cloud sync
- CSV / Excel export
- ML-based spending prediction
- Category-wise budget limits

##👩‍💻 Author

Bipasha Chatterjee
CSE (AI/ML)
Data Analytics & Frontend Enthusiast