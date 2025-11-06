import { useState } from 'react'
import { FileText } from 'lucide-react'
import './App.css'
import ExpensePlanner from './components/ExpensePlanner'
import type { ExpenseItem } from './types/BusinessPlan'

function App() {
  const [isCompleted, setIsCompleted] = useState(false)
  const [expenseData, setExpenseData] = useState<{
    expenses: ExpenseItem[]
    totalExpense: number
    subsidyInfo: any
  } | null>(null)

  const handleComplete = (expenses: ExpenseItem[], totalExpense: number, subsidyInfo: any) => {
    setExpenseData({ expenses, totalExpense, subsidyInfo })
    setIsCompleted(true)
  }

  const handleReset = () => {
    setIsCompleted(false)
    setExpenseData(null)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <FileText size={32} />
          <h1>補助金経費項目プランナー</h1>
          <p>小規模事業者持続化補助金 - 経費計画サポートツール</p>
        </div>
      </header>

      <main className="app-main">
        {!isCompleted ? (
          <ExpensePlanner onComplete={handleComplete} />
        ) : (
          <div className="completion-screen">
            <div className="success-message">
              <h2>✅ 経費計画が完了しました！</h2>
              <div className="summary-card">
                <div className="summary-row">
                  <span>登録した経費項目:</span>
                  <strong>{expenseData?.expenses.length}件</strong>
                </div>
                <div className="summary-row">
                  <span>申請総額:</span>
                  <strong>¥{expenseData?.totalExpense.toLocaleString()}</strong>
                </div>
                <div className="summary-row highlight">
                  <span>予想受給額:</span>
                  <strong>¥{expenseData?.subsidyInfo.expectedSubsidy.toLocaleString()}</strong>
                </div>
              </div>

              <div className="expense-summary">
                <h3>登録された経費項目</h3>
                <table>
                  <thead>
                    <tr>
                      <th>分類</th>
                      <th>内容</th>
                      <th>金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseData?.expenses.map((exp, index) => (
                      <tr key={index}>
                        <td>{exp.category}</td>
                        <td>{exp.description}</td>
                        <td>¥{exp.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="next-steps">
                <h3>📋 次のステップ</h3>
                <ol>
                  <li>商工会・商工会議所に相談予約をする</li>
                  <li>この経費計画を基に事業計画書を作成する</li>
                  <li>必要な見積書を取得する</li>
                  <li>申請書類を準備して提出する</li>
                </ol>
              </div>

              <button onClick={handleReset} className="btn-reset">
                新しい計画を作成する
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 補助金経費項目プランナー - あなたの事業成長をサポート</p>
      </footer>
    </div>
  )
}

export default App
