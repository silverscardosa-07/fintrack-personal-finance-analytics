import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Rent', 'Bills', 'Other']
const CHART_COLORS = ['#4f46e5', '#06b6d4', '#f97316', '#8b5cf6', '#ef4444', '#22c55e', '#eab308', '#0ea5e9']
const STORAGE_KEY = 'fintrack_history_v1'

const asCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const normalizeSnapshot = (snapshot) => {
  if (!snapshot || typeof snapshot !== 'object') return null

  const normalizedCategories = Array.isArray(snapshot.categories)
    ? snapshot.categories
        .map((category) => ({
          name: String(category?.name || '').trim(),
          amount: Number(category?.amount) || 0,
        }))
        .filter((category) => category.name)
    : []

  return {
    id: typeof snapshot.id === 'string' && snapshot.id ? snapshot.id : makeId(),
    month: typeof snapshot.month === 'string' ? snapshot.month : '',
    income: Number(snapshot.income) || 0,
    targetSavings: Number(snapshot.targetSavings) || 0,
    categories: normalizedCategories,
    totalExpense: Number(snapshot.totalExpense) || 0,
    savings: Number(snapshot.savings) || 0,
    savingsRate: Number(snapshot.savingsRate) || 0,
    createdAt: Number(snapshot.createdAt) || Date.now(),
  }
}

const loadHistoryFromStorage = () => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('History must be an array')

    return parsed.map(normalizeSnapshot).filter((snapshot) => snapshot && snapshot.month)
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    return []
  }
}

const byMostRecentMonth = (a, b) => {
  const monthCompare = b.month.localeCompare(a.month)
  if (monthCompare !== 0) return monthCompare
  return b.createdAt - a.createdAt
}

function App() {
  const [income, setIncome] = useState('')
  const [targetSavings, setTargetSavings] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map((name) => ({ name, amount: '' })))
  const [newCategory, setNewCategory] = useState('')
  const [historySnapshots, setHistorySnapshots] = useState(() => loadHistoryFromStorage())
  const [historyOpen, setHistoryOpen] = useState(false)

  const parsedIncome = Number(income) || 0
  const parsedTargetSavings = Number(targetSavings) || 0

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

    if (targetSavings !== '' && Number(targetSavings) < 0) {
      errors.push('Target savings cannot be negative.')
    }

    categories.forEach((category) => {
      if (category.amount !== '' && Number(category.amount) < 0) {
        errors.push(`${category.name} expense cannot be negative.`)
      }
    })

    return errors
  }, [categories, income, targetSavings])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(historySnapshots))
  }, [historySnapshots])

  const warning = totals.savings < 0 ? 'Warning: Your expenses are higher than your monthly income.' : ''
  const targetGap = totals.savings - parsedTargetSavings

  const insights = [
    `Food is ${parsedIncome > 0 ? (((totals.categoryTotals.find((c) => c.name === 'Food')?.amount || 0) / parsedIncome) * 100).toFixed(1) : '0.0'}% of your income.`,
    `Your savings rate is ${totals.savingsRate.toFixed(1)}%.`,
    `Top spending category: ${totals.highestCategory.name} at ${asCurrency(totals.highestCategory.amount)}.`,
  ]

  const chartData = totals.categoryTotals.filter((category) => category.amount > 0)

  const trendData = [...historySnapshots]
    .sort((a, b) => a.month.localeCompare(b.month) || a.createdAt - b.createdAt)
    .map((snapshot) => ({ month: snapshot.month, savings: snapshot.savings }))

  const sortedHistory = [...historySnapshots].sort(byMostRecentMonth)
  const recentHistory = sortedHistory.slice(0, 5)

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

  const handleSaveSnapshot = () => {
    if (!selectedMonth) {
      window.alert('Please select a month before saving a snapshot.')
      return
    }

    if (validationErrors.length > 0) {
      window.alert('Please fix validation errors before saving a snapshot.')
      return
    }

    const existingSnapshot = historySnapshots.find((snapshot) => snapshot.month === selectedMonth)
    const shouldOverwrite =
      !existingSnapshot || window.confirm(`A snapshot for ${selectedMonth} already exists. Overwrite it?`)

    if (!shouldOverwrite) return

    const snapshot = {
      id: existingSnapshot?.id || makeId(),
      month: selectedMonth,
      income: parsedIncome,
      targetSavings: parsedTargetSavings,
      categories: totals.categoryTotals,
      totalExpense: totals.totalExpense,
      savings: totals.savings,
      savingsRate: totals.savingsRate,
      createdAt: Date.now(),
    }

    setHistorySnapshots((previous) => {
      const nextHistory = existingSnapshot
        ? previous.map((entry) => (entry.id === existingSnapshot.id ? snapshot : entry))
        : [snapshot, ...previous]

      return nextHistory.sort(byMostRecentMonth)
    })
  }

  const handleLoadSnapshot = (snapshot) => {
    setSelectedMonth(snapshot.month)
    setIncome(String(snapshot.income))
    setTargetSavings(String(snapshot.targetSavings || 0))
    setCategories(snapshot.categories.map((category) => ({ name: category.name, amount: String(category.amount) })))
    setNewCategory('')
  }

  const handleDeleteSnapshot = (snapshotId) => {
    setHistorySnapshots((previous) => previous.filter((snapshot) => snapshot.id !== snapshotId))
  }

  const handleClearHistory = () => {
    if (!historySnapshots.length) return

    const shouldClear = window.confirm('Clear all saved history snapshots? This cannot be undone.')
    if (!shouldClear) return

    setHistorySnapshots([])
  }


  useEffect(() => {
    if (!historyOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setHistoryOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyOpen])

  const renderHistoryTable = (historyList) => (
    <div className="history-table">
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Expense</th>
            <th>Savings</th>
            <th>Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {historyList.map((snapshot) => (
            <tr key={snapshot.id}>
              <td className="history-month">{snapshot.month}</td>
              <td>{asCurrency(snapshot.income)}</td>
              <td>{asCurrency(snapshot.totalExpense)}</td>
              <td className={snapshot.savings < 0 ? 'negative' : 'positive'}>{asCurrency(snapshot.savings)}</td>
              <td>{snapshot.savingsRate.toFixed(1)}%</td>
              <td>
                <div className="history-actions">
                  <button type="button" className="ghost" onClick={() => handleLoadSnapshot(snapshot)}>Load</button>
                  <button type="button" className="remove" onClick={() => handleDeleteSnapshot(snapshot.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

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
            <div className="input-grid">
              <label>
                Month
                <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
              </label>
              <label>
                Target Savings
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={targetSavings}
                  onChange={(event) => setTargetSavings(event.target.value)}
                  placeholder="Set monthly target"
                />
              </label>
            </div>

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

            <div className="actions-row">
              <button type="button" className="save" onClick={handleSaveSnapshot}>Save Snapshot</button>
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
  <h3>Net Balance</h3>

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

            <div className="target-note">
              <h3>Target Check</h3>
              <p className={targetGap < 0 ? 'negative' : 'positive'}>
                {targetSavings === ''
                  ? 'Set a target savings value to track progress.'
                  : `${targetGap >= 0 ? 'Ahead by' : 'Behind by'} ${asCurrency(Math.abs(targetGap))} vs target.`}
              </p>
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
                      <Pie data={chartData} dataKey="amount" nameKey="name" outerRadius={90} label>
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

          <section className="card history-card">
            <div className="history-header">
              <h2>History</h2>
              <div className="history-header-actions">
                {sortedHistory.length > 5 && (
                  <button type="button" className="ghost" onClick={() => setHistoryOpen(true)}>
                    View all history
                  </button>
                )}
                <button
                  type="button"
                  className="ghost"
                  onClick={handleClearHistory}
                  disabled={historySnapshots.length === 0}
                >
                  Clear all history
                </button>
              </div>
            </div>

            {sortedHistory.length === 0 ? (
              <p className="empty">No snapshots saved yet. Save your first snapshot to start tracking history.</p>
            ) : (
              renderHistoryTable(recentHistory)
            )}
          </section>

          <section className="card trend-card">
            <h2>Savings Trend</h2>
            {trendData.length < 2 ? (
              <p className="empty">Save at least two monthly snapshots to unlock your savings trend.</p>
            ) : (
              <div className="trend-chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData} margin={{ top: 12, right: 20, left: 10, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={asCurrency} width={80} />
                    <Tooltip formatter={(value) => asCurrency(value)} labelFormatter={(label) => `Month: ${label}`} />
                    <Line type="monotone" dataKey="savings" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </main>

        {historyOpen && (
          <div className="modal-backdrop" onClick={() => setHistoryOpen(false)}>
            <section className="modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h2>All History</h2>
                <div className="modal-header-actions">
                  <button type="button" className="ghost" onClick={handleClearHistory} disabled={historySnapshots.length === 0}>
                    Clear all history
                  </button>
                  <button type="button" className="ghost" onClick={() => setHistoryOpen(false)} aria-label="Close history modal">
                    ×
                  </button>
                </div>
              </div>
              <div className="modal-body">
                {sortedHistory.length === 0 ? (
                  <p className="empty">No snapshots available.</p>
                ) : (
                  renderHistoryTable(sortedHistory)
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
