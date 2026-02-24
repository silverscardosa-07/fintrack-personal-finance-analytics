import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Rent', 'Bills', 'Other']
const CHART_COLORS = ['#4f46e5', '#06b6d4', '#f97316', '#8b5cf6', '#ef4444', '#22c55e', '#eab308', '#0ea5e9']

const asCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

function App() {
  const [income, setIncome] = useState('')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map((name) => ({ name, amount: '' })))
  const [newCategory, setNewCategory] = useState('')

  const parsedIncome = Number(income) || 0

  const totals = useMemo(() => {
    const categoryTotals = categories.map((category) => ({
      ...category,
      amount: Number(category.amount) || 0,
    }))

    const totalExpense = categoryTotals.reduce((sum, category) => sum + category.amount, 0)
    const savings = parsedIncome - totalExpense
    const savingsRate = parsedIncome > 0 ? (savings / parsedIncome) * 100 : 0
    const highestCategory = categoryTotals.reduce(
      (highest, current) => (current.amount > highest.amount ? current : highest),
      { name: 'N/A', amount: 0 },
    )

    return {
      categoryTotals,
      totalExpense,
      savings,
      savingsRate,
      highestCategory,
    }
  }, [categories, parsedIncome])

  const validationErrors = useMemo(() => {
    const errors = []

    if (income !== '' && Number(income) < 0) {
      errors.push('Monthly income cannot be negative.')
    }

    categories.forEach((category) => {
      if (category.amount !== '' && Number(category.amount) < 0) {
        errors.push(`${category.name} expense cannot be negative.`)
      }
    })

    return errors
  }, [categories, income])

  const warning = totals.savings < 0 ? 'Warning: Your expenses are higher than your monthly income.' : ''
  
  const savingsHealth =
  totals.savingsRate >= 20 ? { label: 'Healthy', cls: 'badgeGood' } :
  totals.savingsRate >= 10 ? { label: 'Moderate', cls: 'badgeWarn' } :
  { label: 'Low', cls: 'badgeBad' }
  
  const insights = [
    `Food is ${parsedIncome > 0 ? (((totals.categoryTotals.find((c) => c.name === 'Food')?.amount || 0) / parsedIncome) * 100).toFixed(1) : '0.0'}% of your income.`,
    `Your savings rate is ${totals.savingsRate.toFixed(1)}%.`,
    `Top spending category: ${totals.highestCategory.name} at ${asCurrency(totals.highestCategory.amount)}.`,
  ]

  const chartData = totals.categoryTotals.filter((category) => category.amount > 0)

  const updateCategoryAmount = (index, value) => {
    setCategories((previous) => previous.map((category, i) => (i === index ? { ...category, amount: value } : category)))
  }

  const removeCategory = (index) => {
    setCategories((previous) => previous.filter((_, i) => i !== index))
  }

  const addCategory = () => {
    const cleanName = newCategory.trim()

    if (!cleanName) return
    if (categories.some((category) => category.name.toLowerCase() === cleanName.toLowerCase())) return

    setCategories((previous) => [...previous, { name: cleanName, amount: '' }])
    setNewCategory('')
  }

  return (
    <div className="app-shell">
      <div className="app">
        <header className="hero">
          <div>
            <span className="badge">FinTrack</span>
            <h1>Personal Finance Analytics Dashboard</h1>
            <p>Track your income, understand spending patterns, and improve savings with clean visual insights.</p>
          </div>
        </header>

        <main className="grid">
          <section className="card">
            <h2>Monthly Inputs</h2>
            <label>
              Monthly Income
              <input
                type="number"
                min="0"
                step="1"
                value={income}
                onChange={(event) => setIncome(event.target.value)}
                placeholder="Enter income"
              />
            </label>

            <div className="category-list">
              {categories.map((category, index) => (
                <div key={category.name} className="category-row">
                  <label>
                    {category.name}
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={category.amount}
                      onChange={(event) => updateCategoryAmount(index, event.target.value)}
                      placeholder="0"
                    />
                  </label>
                  <button
                    type="button"
                    className="remove"
                    onClick={() => removeCategory(index)}
                    disabled={DEFAULT_CATEGORIES.includes(category.name)}
                    title={DEFAULT_CATEGORIES.includes(category.name) ? 'Default categories cannot be removed' : 'Remove category'}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="new-category">
              <input
                type="text"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Add custom category"
              />
              <button type="button" onClick={addCategory}>Add</button>
            </div>

            {validationErrors.length > 0 && (
              <ul className="errors">
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}

            {warning && <p className="warning">{warning}</p>}
          </section>

          <section className="card">
            <h2>Summary</h2>
            <div className="stats">
              <article>
                <h3>Total Expense</h3>
                <p>{asCurrency(totals.totalExpense)}</p>
              </article>
              <article>
                <h3>Savings</h3>
                <p className={totals.savings < 0 ? 'negative' : 'positive'}>{asCurrency(totals.savings)}</p>
              </article>
              <article>
                <h3>Savings Rate</h3>
                <p>{totals.savingsRate.toFixed(1)}%</p>
              </article>
              <article>
                <h3>Highest Category</h3>
                <p>{totals.highestCategory.name}</p>
              </article>
            </div>
            <div className="balance-card">
    <div className="balance-top">
      <h3>Net Balance</h3>
      <span className={`badge ${savingsHealth.cls}`}>{savingsHealth.label}</span>
    </div>

    <p className={`balance-amount ${totals.savings < 0 ? 'negative' : 'positive'}`}>
      {asCurrency(totals.savings)}
    </p>

    <div className="progress" aria-label="Savings progress">
      <div
        className="progress-bar"
        style={{ width: `${Math.max(0, Math.min(100, totals.savingsRate))}%` }}
      />
    </div>

    <div className="balance-meta">
      <span>{asCurrency(totals.totalExpense)} spent</span>
      <span>{totals.savingsRate.toFixed(1)}% saved</span>
    </div>
  </div>
            <div className="insights">
              <h3>Insights</h3>
              <ul>
                {insights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card charts">
            <h2>Spending Breakdown</h2>
            {chartData.length === 0 ? (
              <p className="empty">Add expense values to view charts.</p>
            ) : (
              <div className="chart-grid">
                <div className="chart-box">
                  <h3>Category Share</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={chartData} dataKey="amount" nameKey="name" outerRadius={95}>
                        {chartData.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => asCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-box">
                  <h3>Category Amounts</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                      <Tooltip formatter={(value) => asCurrency(value)} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App