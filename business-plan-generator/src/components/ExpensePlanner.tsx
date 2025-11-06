import { useState, useEffect } from 'react'
import { Plus, Trash2, Calculator, Lightbulb, TrendingUp, DollarSign, Download, Save, Info, AlertTriangle, Calendar } from 'lucide-react'
import type { ExpenseItem } from '../types/BusinessPlan'
import { expenseCategories } from '../types/BusinessPlan'
import { expenseCategoryDetails } from '../types/ExpenseDetails'
import jsPDF from 'jspdf'
import './ExpensePlanner.css'

interface ExpensePlannerProps {
  onComplete: (expenses: ExpenseItem[], totalExpense: number, subsidyInfo: any) => void
}

const ExpensePlanner = ({ onComplete }: ExpensePlannerProps) => {
  const [businessName, setBusinessName] = useState('')
  const [applicationCategory, setApplicationCategory] = useState<'normal' | 'startup' | 'wage-increase'>('normal')
  const [isInvoiceEligible, setIsInvoiceEligible] = useState(false)
  
  // 入力モード選択用state
  const [inputMode, setInputMode] = useState<'preset' | 'purpose' | 'manual' | null>(null)
  
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: 0
  })

  // モーダル用state
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState<string | null>(null)
  
  // スケジュール管理用state
  const [applicationDeadline, setApplicationDeadline] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)

  // LocalStorageから読み込み
  useEffect(() => {
    const savedData = localStorage.getItem('expensePlannerData')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setBusinessName(data.businessName || '')
        setApplicationCategory(data.applicationCategory || 'normal')
        setIsInvoiceEligible(data.isInvoiceEligible || false)
        setExpenses(data.expenses || [])
        setApplicationDeadline(data.applicationDeadline || '')
        setInputMode(data.inputMode || null)
      } catch (e) {
        console.error('Failed to load saved data', e)
      }
    }
  }, [])

  // LocalStorageに保存
  const saveToLocalStorage = () => {
    const data = {
      businessName,
      applicationCategory,
      isInvoiceEligible,
      expenses,
      applicationDeadline,
      inputMode,
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem('expensePlannerData', JSON.stringify(data))
    alert('💾 下書きを保存しました！')
  }

  // 目的別おすすめ経費
  const purposeRecommendations = {
    'テイクアウト強化': [
      { category: '機械装置等費', description: 'テイクアウト用真空包装機', amount: 300000 },
      { category: '機械装置等費', description: '保温・保冷配達バッグ', amount: 50000 },
      { category: '広報費', description: 'テイクアウトメニューチラシ制作・配布', amount: 150000 },
      { category: '委託・外注費', description: 'テイクアウト窓口の改装工事', amount: 500000 }
    ],
    'デリバリー開始': [
      { category: '機械装置等費', description: 'デリバリー用保温ボックス', amount: 80000 },
      { category: 'ウェブサイト関連費', description: 'オンライン注文システム導入', amount: 200000 },
      { category: '広報費', description: 'デリバリーアプリ広告出稿', amount: 150000 },
      { category: '開発費', description: 'デリバリー専用メニュー開発', amount: 100000 }
    ],
    'Web集客強化': [
      { category: 'ウェブサイト関連費', description: 'ホームページリニューアル', amount: 300000 },
      { category: 'ウェブサイト関連費', description: 'SNS広告運用（6ヶ月）', amount: 200000 },
      { category: 'ウェブサイト関連費', description: 'プロモーション動画制作', amount: 250000 }
    ],
    '新メニュー開発': [
      { category: '開発費', description: '新商品試作開発費', amount: 150000 },
      { category: '機械装置等費', description: '新メニュー用調理機器', amount: 400000 },
      { category: '委託・外注費', description: 'メニュー撮影・デザイン制作', amount: 150000 },
      { category: '広報費', description: '新メニューPRチラシ・ポスター', amount: 100000 }
    ],
    '店舗改装': [
      { category: '委託・外注費', description: '店舗内装リノベーション', amount: 800000 },
      { category: '設備処分費', description: '既存設備の撤去・処分', amount: 100000 },
      { category: '機械装置等費', description: '新規厨房設備の導入', amount: 500000 },
      { category: '委託・外注費', description: '看板・サイン制作', amount: 200000 }
    ],
    'EC・通販開始': [
      { category: 'ウェブサイト関連費', description: 'ECサイト構築', amount: 400000 },
      { category: '機械装置等費', description: '冷凍・真空包装設備', amount: 500000 },
      { category: '開発費', description: '通販用商品パッケージ開発', amount: 200000 },
      { category: '広報費', description: 'EC広告・プロモーション', amount: 150000 }
    ]
  }

  // 申請枠別おまかせプラン
  const presetPlans = {
    'normal': {
      name: '通常枠プラン',
      description: '上限50万円の標準的なプラン',
      items: [
        { category: '広報費', description: 'LP作成（1個）', amount: 187500, note: '※税別：187,500円' },
        { category: '広報費', description: 'チラシ制作（4個）', amount: 300000, note: '※税別：300,000円' },
        { category: '広報費', description: 'DM発送（1,750部）', amount: 262500, note: '※税別：262,500円' }
      ],
      subtotal: 750000,
      tax: 75000,
      total: 825000,
      expectedSubsidy: 500000
    },
    'normal-invoice': {
      name: 'インボイス特例利用枠',
      description: '上限100万円（50万円＋50万円）のプラン',
      items: [
        { category: '広報費', description: 'メニュー表作成（1個）', amount: 260000, note: '※税別：260,000円' },
        { category: '広報費', description: 'チラシ制作（2個）', amount: 200000, note: '※税別：200,000円' },
        { category: '広報費', description: 'LP作成（1個）', amount: 375000, note: '※税別：375,000円' },
        { category: '広報費', description: 'DM発送（5,000部）', amount: 750000, note: '※税別：750,000円' }
      ],
      subtotal: 1585000,
      tax: 158500,
      total: 1743500,
      expectedSubsidy: 1000000
    },
    'wage-increase': {
      name: '賃金引上げ枠プラン',
      description: '上限200万円の賃金引上げ枠プラン',
      items: [
        { category: '広報費', description: 'メニュー表作成（1個）', amount: 250000, note: '※税別：250,000円' },
        { category: '広報費', description: 'チラシ制作（4個）', amount: 500000, note: '※税別：500,000円' },
        { category: '広報費', description: 'LP作成（1個）', amount: 750000, note: '※税別：750,000円' },
        { category: '広報費', description: 'DM発送（10,000部）', amount: 1500000, note: '※税別：1,500,000円' }
      ],
      subtotal: 3000000,
      tax: 300000,
      total: 3300000,
      expectedSubsidy: 2000000
    },
    'wage-increase-invoice': {
      name: '賃金引上げ枠＋インボイス特例利用枠',
      description: '上限250万円（200万円＋50万円）のプラン',
      items: [
        { category: '広報費', description: 'メニュー表作成（1個）', amount: 250000, note: '※税別：250,000円' },
        { category: '広報費', description: 'チラシ制作（4個）', amount: 500000, note: '※税別：500,000円' },
        { category: '広報費', description: 'LP作成（1個）', amount: 750000, note: '※税別：750,000円' },
        { category: '広報費', description: 'DM発送（15,000部）', amount: 2250000, note: '※税別：2,250,000円' }
      ],
      subtotal: 3750000,
      tax: 375000,
      total: 4125000,
      expectedSubsidy: 2500000
    }
  }

  const addExpense = () => {
    if (newExpense.category && newExpense.description && newExpense.amount > 0) {
      setExpenses([...expenses, { ...newExpense }])
      setNewExpense({ category: '', description: '', amount: 0 })
    }
  }

  const addRecommendedExpense = (expense: any) => {
    setExpenses([...expenses, expense])
  }

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index))
  }

  const calculateSubsidy = () => {
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    
    let baseLimit = 500000
    let subsidyRate = 2/3
    
    if (applicationCategory === 'startup' || applicationCategory === 'wage-increase') {
      baseLimit = 2000000
    }
    
    const subsidyLimit = isInvoiceEligible ? baseLimit + 500000 : baseLimit
    const calculatedSubsidy = Math.min(totalExpense * subsidyRate, subsidyLimit)
    
    return {
      totalExpense,
      subsidyRate,
      subsidyLimit,
      expectedSubsidy: Math.floor(calculatedSubsidy),
      selfPayment: totalExpense - Math.floor(calculatedSubsidy)
    }
  }

  // ウェブサイト関連費チェック
  const checkWebsiteFeeLimit = () => {
    const websiteFees = expenses.filter(exp => exp.category === 'ウェブサイト関連費')
    const websiteFeeTotal = websiteFees.reduce((sum, exp) => sum + exp.amount, 0)
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const limit = totalExpense * 0.25
    
    return {
      websiteFeeTotal,
      limit,
      isOver: websiteFeeTotal > limit,
      percentage: totalExpense > 0 ? Math.round((websiteFeeTotal / totalExpense) * 100) : 0
    }
  }

  // PDF出力
  const downloadPDF = () => {
    const doc = new jsPDF()
    const subsidyInfo = calculateSubsidy()
    
    let y = 20
    
    // タイトル
    doc.setFontSize(18)
    doc.text('Subsidy Expense Plan', 105, y, { align: 'center' })
    y += 15
    
    // 基本情報
    doc.setFontSize(12)
    doc.text(`Business Name: ${businessName || 'N/A'}`, 20, y)
    y += 10
    
    const categoryMap = {
      'normal': 'Normal (500,000 yen)',
      'startup': 'Startup (2,000,000 yen)',
      'wage-increase': 'Wage Increase (2,000,000 yen)'
    }
    doc.text(`Category: ${categoryMap[applicationCategory]}`, 20, y)
    y += 10
    doc.text(`Invoice Special: ${isInvoiceEligible ? 'Yes (+500,000 yen)' : 'No'}`, 20, y)
    y += 15
    
    // 経費一覧
    doc.setFontSize(14)
    doc.text('Expense Items', 20, y)
    y += 10
    
    doc.setFontSize(10)
    expenses.forEach((exp, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(`${index + 1}. ${exp.category}`, 20, y)
      y += 6
      doc.text(`   ${exp.description}`, 20, y)
      y += 6
      doc.text(`   Amount: ${exp.amount.toLocaleString()} yen`, 20, y)
      y += 8
    })
    
    y += 5
    
    // 合計
    doc.setFontSize(12)
    doc.text(`Total Expense: ${subsidyInfo.totalExpense.toLocaleString()} yen`, 20, y)
    y += 8
    doc.text(`Expected Subsidy: ${subsidyInfo.expectedSubsidy.toLocaleString()} yen`, 20, y)
    y += 8
    doc.text(`Self Payment: ${subsidyInfo.selfPayment.toLocaleString()} yen`, 20, y)
    
    doc.save(`expense-plan-${businessName || 'draft'}.pdf`)
    alert('📄 PDFをダウンロードしました！')
  }

  // プリセットプランを適用
  const applyPresetPlan = (planKey: string) => {
    const plan = presetPlans[planKey as keyof typeof presetPlans]
    if (!plan) return
    
    // 既存の経費をクリアして確認
    if (expenses.length > 0) {
      if (!confirm('既存の経費をクリアして、このプランを適用しますか？')) {
        return
      }
    }
    
    // プランの経費項目を追加
    const newExpenses: ExpenseItem[] = plan.items.map((item, index) => ({
      id: Date.now() + index,
      category: item.category,
      description: item.description,
      amount: item.amount,
      details: item.note
    }))
    
    setExpenses(newExpenses)
    alert(`✅ ${plan.name}を適用しました！\n\n合計: ¥${plan.total.toLocaleString()}（税込）\n予想受給額: ¥${plan.expectedSubsidy.toLocaleString()}`)
  }

  // 現在の申請枠とインボイス対応状況に合ったプランキーを取得
  const getCurrentPlanKey = () => {
    if (applicationCategory === 'normal') {
      return isInvoiceEligible ? 'normal-invoice' : 'normal'
    } else if (applicationCategory === 'wage-increase') {
      return isInvoiceEligible ? 'wage-increase-invoice' : 'wage-increase'
    }
    return 'normal'
  }

  const handleComplete = () => {
    const subsidyInfo = calculateSubsidy()
    onComplete(expenses, subsidyInfo.totalExpense, subsidyInfo)
  }

  const subsidyInfo = calculateSubsidy()

  return (
    <div className="expense-planner">
      <div className="planner-header">
        <h1>💰 補助金経費項目プランナー</h1>
        <p>あなたの目的に合った経費項目を簡単に選択・計算できます</p>
        <div className="header-actions">
          <button onClick={saveToLocalStorage} className="btn-save">
            <Save size={18} /> 下書き保存
          </button>
          <button onClick={downloadPDF} className="btn-download" disabled={expenses.length === 0}>
            <Download size={18} /> PDF出力
          </button>
        </div>
      </div>

      {/* 基本情報 */}
      <section className="planner-section basic-info">
        <h2>📋 基本情報</h2>
        
        <div className="info-grid">
          <div className="info-item">
            <label>店舗名</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="例: カフェレストラン さくら"
            />
          </div>

          <div className="info-item">
            <label>申請枠</label>
            <select
              value={applicationCategory}
              onChange={(e) => setApplicationCategory(e.target.value as any)}
            >
              <option value="normal">通常枠（上限50万円）</option>
              <option value="startup">創業枠（上限200万円）</option>
              <option value="wage-increase">賃金引上げ枠（上限200万円）</option>
            </select>
          </div>

          <div className="info-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={isInvoiceEligible}
                onChange={(e) => setIsInvoiceEligible(e.target.checked)}
              />
              <span>インボイス特例対象（+50万円）</span>
            </label>
          </div>
        </div>
      </section>

      {/* 入力モード選択 */}
      {!inputMode && (
        <section className="planner-section mode-selection">
          <h2>🎯 経費入力方法を選択してください</h2>
          <p className="section-description">3つの入力方法からお好みの方法をお選びください</p>
          
          <div className="mode-selection-grid">
            <div className="mode-card" onClick={() => setInputMode('preset')}>
              <div className="mode-icon">📊</div>
              <h3>全てお任せプラン</h3>
              <p>申請枠に最適化されたプランを一括適用</p>
              <ul className="mode-features">
                <li>✅ 最適な経費項目を自動設定</li>
                <li>✅ 税込金額を自動計算</li>
                <li>✅ 補助上限額に合わせた設計</li>
              </ul>
              <button className="btn-select-mode">このモードを選ぶ</button>
            </div>

            <div className="mode-card" onClick={() => setInputMode('purpose')}>
              <div className="mode-icon">💡</div>
              <h3>目的別おすすめ経費</h3>
              <p>実現したい目的に合わせた経費を提案</p>
              <ul className="mode-features">
                <li>✅ 6つの目的から選択</li>
                <li>✅ 目的に合った経費を提案</li>
                <li>✅ 必要な項目を選んで追加</li>
              </ul>
              <button className="btn-select-mode">このモードを選ぶ</button>
            </div>

            <div className="mode-card" onClick={() => setInputMode('manual')}>
              <div className="mode-icon">✏️</div>
              <h3>自由に経費を追加</h3>
              <p>カテゴリーを選んで自由に入力</p>
              <ul className="mode-features">
                <li>✅ 10カテゴリーから自由選択</li>
                <li>✅ 詳細な金額設定が可能</li>
                <li>✅ カスタマイズ性が高い</li>
              </ul>
              <button className="btn-select-mode">このモードを選ぶ</button>
            </div>
          </div>

          <div className="mode-selection-note">
            💡 いつでもモードを変更できます。下書き保存すると選択したモードも保存されます。
          </div>
        </section>
      )}

      {/* モード変更ボタン */}
      {inputMode && (
        <div className="mode-change-bar">
          <span className="current-mode">
            {inputMode === 'preset' && '📊 全てお任せプラン'}
            {inputMode === 'purpose' && '💡 目的別おすすめ経費'}
            {inputMode === 'manual' && '✏️ 自由に経費を追加'}
            モードで入力中
          </span>
          <button 
            className="btn-change-mode"
            onClick={() => {
              if (confirm('入力モードを変更しますか？\n※既存の経費は保持されます')) {
                setInputMode(null)
              }
            }}
          >
            入力モードを変更
          </button>
        </div>
      )}

      {/* 全てお任せプラン */}
      {inputMode === 'preset' && (
        <section className="planner-section preset-plans">
        <h2><TrendingUp size={24} /> 全てお任せプラン</h2>
        <p className="section-description">申請枠に最適化された経費プランを一括適用できます</p>
        
        <div className="preset-plan-card">
          {(() => {
            const planKey = getCurrentPlanKey()
            const plan = presetPlans[planKey as keyof typeof presetPlans]
            
            return (
              <>
                <div className="preset-plan-header">
                  <h3>📊 {plan.name}</h3>
                  <p>{plan.description}</p>
                </div>
                
                <div className="preset-plan-items">
                  <h4>📝 経費内訳</h4>
                  <ul className="preset-item-list">
                    {plan.items.map((item, idx) => (
                      <li key={idx}>
                        <span className="preset-item-name">{item.description}</span>
                        <span className="preset-item-amount">¥{item.amount.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="preset-plan-summary">
                  <div className="preset-summary-row">
                    <span>小計（税別）:</span>
                    <span>¥{plan.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="preset-summary-row">
                    <span>消費税（10%）:</span>
                    <span>¥{plan.tax.toLocaleString()}</span>
                  </div>
                  <div className="preset-summary-row total">
                    <span>合計（税込）:</span>
                    <span className="highlight">¥{plan.total.toLocaleString()}</span>
                  </div>
                  <div className="preset-summary-row subsidy">
                    <span>💰 予想受給額:</span>
                    <span className="subsidy-amount">¥{plan.expectedSubsidy.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  className="btn-apply-preset"
                  onClick={() => applyPresetPlan(planKey)}
                >
                  <TrendingUp size={20} /> このプランを適用する
                </button>
                
                <div className="preset-plan-note">
                  💡 このプランは現在の申請枠（{applicationCategory === 'normal' ? '通常枠' : '賃上げ枠'}）
                  {isInvoiceEligible && '＋インボイス特例'}に最適化されています
                </div>
              </>
            )
          })()}
        </div>
      </section>
      )}

      {/* 目的別おすすめ */}
      {inputMode === 'purpose' && (
        <section className="planner-section recommendations">
        <h2><Lightbulb size={24} /> 目的別おすすめ経費</h2>
        <p className="section-description">実現したいことを選ぶと、おすすめの経費項目が表示されます</p>
        
        <div className="purpose-buttons">
          {Object.keys(purposeRecommendations).map(purpose => (
            <button
              key={purpose}
              className={`purpose-btn ${selectedPurpose === purpose ? 'active' : ''}`}
              onClick={() => setSelectedPurpose(selectedPurpose === purpose ? '' : purpose)}
            >
              {purpose}
            </button>
          ))}
        </div>

        {selectedPurpose && (
          <div className="recommended-expenses">
            <h3>「{selectedPurpose}」におすすめの経費</h3>
            <div className="recommendation-list">
              {purposeRecommendations[selectedPurpose as keyof typeof purposeRecommendations].map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="rec-info">
                    <div className="rec-category">{rec.category}</div>
                    <div className="rec-description">{rec.description}</div>
                    <div className="rec-amount">¥{rec.amount.toLocaleString()}</div>
                  </div>
                  <button
                    className="btn-add-rec"
                    onClick={() => addRecommendedExpense(rec)}
                  >
                    <Plus size={18} /> 追加
                  </button>
                </div>
              ))}
            </div>
            <div className="rec-total">
              <strong>おすすめプラン合計:</strong>
              <span>¥{purposeRecommendations[selectedPurpose as keyof typeof purposeRecommendations]
                .reduce((sum, rec) => sum + rec.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </section>
      )}

      {/* 経費追加フォーム */}
      {inputMode === 'manual' && (
        <section className="planner-section add-expense">
        <h2><Plus size={24} /> 経費を追加</h2>
        
        <div className="category-help">
          <p>💡 各経費カテゴリーの詳細（対象/対象外、注意点、採択事例）を確認できます</p>
          <div className="category-help-buttons">
            {expenseCategories.map(cat => (
              <button
                key={cat.id}
                className="category-help-btn"
                onClick={() => setSelectedCategoryForDetail(cat.id)}
              >
                <Info size={14} /> {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="expense-form">
          <div className="form-row">
            <div className="form-field">
              <label>経費分類</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <option value="">選択してください</option>
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field wide">
              <label>内容説明</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="例: テイクアウト用真空包装機の購入"
              />
            </div>

            <div className="form-field">
              <label>金額（円）</label>
              <input
                type="number"
                value={newExpense.amount || ''}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                placeholder="300000"
                min="0"
              />
            </div>

            <button
              type="button"
              onClick={addExpense}
              className="btn-add-expense"
              disabled={!newExpense.category || !newExpense.description || newExpense.amount <= 0}
            >
              <Plus size={18} /> 追加
            </button>
          </div>
        </div>
      </section>
      )}

      {/* 登録済み経費一覧 */}
      {expenses.length > 0 && (
        <section className="planner-section expense-list">
          <h2><TrendingUp size={24} /> 登録済み経費（{expenses.length}件）</h2>
          
          <div className="expense-table-wrapper">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>分類</th>
                  <th>内容</th>
                  <th>金額</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td><span className="category-badge">{exp.category}</span></td>
                    <td>{exp.description}</td>
                    <td className="amount">¥{exp.amount.toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => removeExpense(index)}
                        className="btn-remove"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}><strong>合計</strong></td>
                  <td colSpan={2} className="total-amount">
                    <strong>¥{subsidyInfo.totalExpense.toLocaleString()}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* ウェブサイト関連費の警告 */}
      {expenses.length > 0 && (() => {
        const websiteCheck = checkWebsiteFeeLimit()
        return websiteCheck.websiteFeeTotal > 0 && (
          <section className={`planner-section website-warning ${websiteCheck.isOver ? 'warning-error' : 'warning-ok'}`}>
            <h2><AlertTriangle size={24} /> ウェブサイト関連費チェック</h2>
            <div className="website-check-content">
              <div className="website-check-row">
                <span className="label">ウェブサイト関連費合計:</span>
                <span className="value">¥{websiteCheck.websiteFeeTotal.toLocaleString()}</span>
              </div>
              <div className="website-check-row">
                <span className="label">全体経費に占める割合:</span>
                <span className={`value ${websiteCheck.isOver ? 'error' : ''}`}>{websiteCheck.percentage}%</span>
              </div>
              <div className="website-check-row">
                <span className="label">上限額（総額の1/4）:</span>
                <span className="value">¥{Math.floor(websiteCheck.limit).toLocaleString()}</span>
              </div>
              {websiteCheck.isOver ? (
                <div className="website-alert error">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>⚠️ 警告：ウェブサイト関連費が上限を超えています！</strong>
                    <p>ウェブサイト関連費は総額の1/4（25%）までしか補助対象になりません。</p>
                    <p>超過分: ¥{(websiteCheck.websiteFeeTotal - websiteCheck.limit).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="website-alert ok">
                  <Info size={20} />
                  <div>
                    <strong>✅ ウェブサイト関連費は上限内です</strong>
                    <p>あと ¥{Math.floor(websiteCheck.limit - websiteCheck.websiteFeeTotal).toLocaleString()} まで追加できます。</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )
      })()}

      {/* 補助金シミュレーション */}
      {expenses.length > 0 && (
        <section className="planner-section subsidy-simulation">
          <h2><Calculator size={24} /> 補助金額シミュレーション</h2>
          
          <div className="simulation-result">
            <div className="result-row">
              <span className="label">申請総額:</span>
              <span className="value">¥{subsidyInfo.totalExpense.toLocaleString()}</span>
            </div>
            <div className="result-row">
              <span className="label">補助率:</span>
              <span className="value highlight">{Math.round(subsidyInfo.subsidyRate * 100)}%</span>
            </div>
            <div className="result-row">
              <span className="label">補助上限額:</span>
              <span className="value">¥{subsidyInfo.subsidyLimit.toLocaleString()}</span>
            </div>
            <div className="result-row major">
              <span className="label"><DollarSign size={20} /> 予想受給額:</span>
              <span className="value large">¥{subsidyInfo.expectedSubsidy.toLocaleString()}</span>
            </div>
            <div className="result-row">
              <span className="label">自己負担額:</span>
              <span className="value">¥{subsidyInfo.selfPayment.toLocaleString()}</span>
            </div>
          </div>

          <div className="simulation-note">
            <p>💡 この金額はシミュレーションです。実際の補助金額は審査により決定されます。</p>
            <p>⚠️ 補助金は<strong>後払い</strong>です。事業実施後の実績報告後に入金されます。</p>
          </div>
        </section>
      )}

      {/* 申請スケジュール管理 */}
      <section className="planner-section schedule-section">
        <h2 onClick={() => setShowSchedule(!showSchedule)} style={{ cursor: 'pointer' }}>
          <Calendar size={24} /> 申請スケジュール管理 {showSchedule ? '▼' : '▶'}
        </h2>
        
        {showSchedule && (
          <div className="schedule-content">
            <div className="schedule-deadline">
              <label htmlFor="deadline">申請締切日:</label>
              <input
                id="deadline"
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="deadline-input"
              />
              {applicationDeadline && (() => {
                const deadline = new Date(applicationDeadline)
                const today = new Date()
                const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div className={`countdown ${daysLeft <= 7 ? 'urgent' : daysLeft <= 14 ? 'warning' : ''}`}>
                    {daysLeft > 0 ? (
                      <>⏰ あと <strong>{daysLeft}日</strong></>
                    ) : daysLeft === 0 ? (
                      <>🔥 <strong>本日締切！</strong></>
                    ) : (
                      <>❌ 締切を過ぎています</>
                    )}
                  </div>
                )
              })()}
            </div>

            <div className="schedule-todos">
              <h3>📝 申請準備チェックリスト</h3>
              <ul className="todo-list">
                <li>✅ 経営計画書の作成（様式2）</li>
                <li>✅ 補助事業計画書の作成（様式3）</li>
                <li>✅ 経費明細表の作成（様式4）</li>
                <li>✅ 見積書の取得（全ての経費項目）</li>
                <li>✅ 事業要件の確認（販路開拓に該当するか）</li>
                <li>✅ 必要書類の準備（登記簿謄本など）</li>
                <li>✅ 電子申請システムの利用登録</li>
              </ul>
            </div>

            <div className="schedule-reminders">
              <h3>🔔 リマインダー</h3>
              <div className="reminder-list">
                {applicationDeadline && (() => {
                  const deadline = new Date(applicationDeadline)
                  const today = new Date()
                  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <>
                      {daysLeft >= 14 && (
                        <div className="reminder-item">
                          📅 2週間前（{new Date(deadline.getTime() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}）：書類の最終確認を開始
                        </div>
                      )}
                      {daysLeft >= 7 && (
                        <div className="reminder-item warning">
                          ⚠️ 1週間前（{new Date(deadline.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}）：申請書提出の準備完了
                        </div>
                      )}
                      {daysLeft >= 3 && (
                        <div className="reminder-item urgent">
                          🔥 3日前（{new Date(deadline.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}）：最終チェック＆提出
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 完了ボタン */}
      <div className="planner-actions">
        <button
          onClick={handleComplete}
          className="btn-complete"
          disabled={expenses.length === 0}
        >
          経費計画を完了する
        </button>
      </div>

      {/* カテゴリー詳細モーダル */}
      {selectedCategoryForDetail && (() => {
        const detail = expenseCategoryDetails.find(d => d.id === selectedCategoryForDetail)
        if (!detail) return null
        
        return (
          <div className="modal-overlay" onClick={() => setSelectedCategoryForDetail(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{detail.name}</h2>
                <button className="modal-close" onClick={() => setSelectedCategoryForDetail(null)}>✕</button>
              </div>
              
              <div className="modal-body">
                <div className="modal-section">
                  <h3>📖 説明</h3>
                  <p>{detail.description}</p>
                </div>

                <div className="modal-section">
                  <h3>✅ 対象となるもの</h3>
                  <ul className="eligible-list">
                    {detail.eligible.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="modal-section">
                  <h3>❌ 対象外となるもの</h3>
                  <ul className="ineligible-list">
                    {detail.ineligible.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="modal-section">
                  <h3>⚠️ 注意点</h3>
                  <ul className="notes-list">
                    {detail.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="modal-section examples">
                  <h3>💡 実際の採択事例</h3>
                  <ul className="examples-list">
                    {detail.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-modal-close" onClick={() => setSelectedCategoryForDetail(null)}>
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default ExpensePlanner
