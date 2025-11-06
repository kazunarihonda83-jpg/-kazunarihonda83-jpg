import { useState } from 'react'
import { Plus, Trash2, Calculator } from 'lucide-react'
import type { BusinessPlanData, ExpenseItem } from '../types/BusinessPlan'
import { expenseCategories } from '../types/BusinessPlan'
import { strengthOptions, challengeOptions, goalOptions, targetCustomerOptions, expectedEffectOptions, weaknessOptions } from '../types/FormOptions'
import { generateBusinessPlanDocument } from '../utils/businessPlanGenerator'
import './BusinessPlanForm.css'

interface BusinessPlanFormProps {
  onSubmit: (data: BusinessPlanData) => void
}

const BusinessPlanForm = ({ onSubmit }: BusinessPlanFormProps) => {
  const [formData, setFormData] = useState<{
    businessName: string
    ownerName: string
    address: string
    phone: string
    email: string
    businessType: string
    employeeCount: number
    establishedYear: string
    applicationCategory: 'normal' | 'startup' | 'wage-increase'
    isInvoiceEligible: boolean
    strengths: string[]
    weaknesses: string[]
    challenges: string[]
    businessGoals: string[]
    targetCustomers: string[]
    expectedEffects: string[]
    promotionService: string
    promotionPriceRange: string
    promotionTarget: string
    promotionBackground: string
  }>({
    businessName: '',
    ownerName: '',
    address: '',
    phone: '',
    email: '',
    businessType: 'restaurant',
    employeeCount: 1,
    establishedYear: new Date().getFullYear().toString(),
    applicationCategory: 'normal',
    isInvoiceEligible: false,
    strengths: [],
    weaknesses: [],
    challenges: [],
    businessGoals: [],
    targetCustomers: [],
    expectedEffects: [],
    promotionService: '',
    promotionPriceRange: '',
    promotionTarget: '',
    promotionBackground: ''
  })

  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: 0
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }))
  }

  const handleCheckboxChange = (category: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[category] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      return { ...prev, [category]: newValues }
    })
  }

  const addExpense = () => {
    if (newExpense.category && newExpense.description && newExpense.amount > 0) {
      setExpenses([...expenses, { ...newExpense }])
      setNewExpense({ category: '', description: '', amount: 0 })
    }
  }

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index))
  }

  const calculateSubsidy = () => {
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    
    let baseLimit = 500000 // 通常枠50万円
    let subsidyRate = 2/3
    
    if (formData.applicationCategory === 'startup' || formData.applicationCategory === 'wage-increase') {
      baseLimit = 2000000 // 200万円
    }
    
    const subsidyLimit = formData.isInvoiceEligible ? baseLimit + 500000 : baseLimit
    const calculatedSubsidy = Math.min(totalExpense * subsidyRate, subsidyLimit)
    
    return {
      totalExpense,
      subsidyRate,
      subsidyLimit,
      expectedSubsidy: Math.floor(calculatedSubsidy)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const { totalExpense, subsidyRate, subsidyLimit, expectedSubsidy } = calculateSubsidy()
    
    // データを整形
    const businessPlanData: BusinessPlanData = {
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      businessType: formData.businessType,
      employeeCount: formData.employeeCount,
      establishedYear: formData.establishedYear,
      applicationCategory: formData.applicationCategory,
      isInvoiceEligible: formData.isInvoiceEligible,
      strengths: formData.strengths,
      weaknesses: formData.weaknesses,
      currentSituation: '', // 後で生成
      challenges: formData.challenges.join('、'),
      businessGoals: formData.businessGoals.join('、'),
      targetCustomers: formData.targetCustomers.join('、'),
      expectedEffects: formData.expectedEffects.join('、'),
      promotionService: formData.promotionService,
      promotionPriceRange: formData.promotionPriceRange,
      promotionTarget: formData.promotionTarget,
      promotionBackground: formData.promotionBackground,
      expenses,
      totalExpense,
      subsidyRate,
      subsidyLimit,
      expectedSubsidy,
      // 未使用の項目はデフォルト値
      salesComposition: [],
      profitComposition: [],
      salesTargets: [],
      customerSources: [],
      teamMembers: [],
      ownerCareer: []
    }
    
    // 高度な文章生成を使用
    const generatedDocument = generateBusinessPlanDocument(businessPlanData)
    businessPlanData.currentSituation = generatedDocument
    
    onSubmit(businessPlanData)
  }

  const subsidyInfo = calculateSubsidy()

  return (
    <form className="business-plan-form" onSubmit={handleSubmit}>
      <section className="form-section">
        <h2>🏪 店舗基本情報</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>店舗名 *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required
              placeholder="例: カフェレストラン さくら"
            />
          </div>

          <div className="form-group">
            <label>代表者名 *</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              required
              placeholder="例: 山田 太郎"
            />
          </div>

          <div className="form-group full-width">
            <label>所在地 *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="例: 東京都渋谷区〇〇 1-2-3"
            />
          </div>

          <div className="form-group">
            <label>電話番号 *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="例: 03-1234-5678"
            />
          </div>

          <div className="form-group">
            <label>メールアドレス *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="例: info@example.com"
            />
          </div>

          <div className="form-group">
            <label>業態 *</label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              required
            >
              <option value="restaurant">飲食店（一般）</option>
              <option value="cafe">カフェ</option>
              <option value="izakaya">居酒屋</option>
              <option value="ramen">ラーメン店</option>
              <option value="bakery">ベーカリー</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div className="form-group">
            <label>従業員数 *</label>
            <input
              type="number"
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleInputChange}
              required
              min="1"
              max="5"
            />
            <small>※正社員・常勤パート含む（5人以下が対象）</small>
          </div>

          <div className="form-group">
            <label>創業年 *</label>
            <input
              type="text"
              name="establishedYear"
              value={formData.establishedYear}
              onChange={handleInputChange}
              required
              placeholder="例: 2020"
            />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h2>📋 申請枠の選択</h2>
        
        <div className="form-group">
          <label>申請枠 *</label>
          <select
            name="applicationCategory"
            value={formData.applicationCategory}
            onChange={handleInputChange}
            required
          >
            <option value="normal">通常枠（上限50万円）</option>
            <option value="startup">創業枠（創業3年以内、上限200万円）</option>
            <option value="wage-increase">賃金引上げ枠（上限200万円）</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isInvoiceEligible"
              checked={formData.isInvoiceEligible}
              onChange={handleInputChange}
            />
            <span>インボイス特例対象（+50万円加算）</span>
          </label>
        </div>
      </section>

      <section className="form-section">
        <h2>💪 店舗の強み</h2>
        <p className="section-description">あなたの店舗の強みを選択してください（複数選択可）</p>
        
        <div className="checkbox-list">
          {strengthOptions.map(option => (
            <label key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.strengths.includes(option.value)}
                onChange={() => handleCheckboxChange('strengths', option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="form-section">
        <h2>📊 現在抱えている課題</h2>
        <p className="section-description">現在抱えている課題を選択してください（複数選択可）*</p>
        
        <div className="checkbox-list">
          {challengeOptions.map(option => (
            <label key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.challenges.includes(option.value)}
                onChange={() => handleCheckboxChange('challenges', option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {formData.challenges.length === 0 && (
          <small className="error-message">※少なくとも1つ選択してください</small>
        )}
      </section>

      <section className="form-section">
        <h2>🎯 今回の事業で実現したいこと</h2>
        <p className="section-description">今回の補助金で実現したいことを選択してください（複数選択可）*</p>
        
        <div className="checkbox-list">
          {goalOptions.map(option => (
            <label key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.businessGoals.includes(option.value)}
                onChange={() => handleCheckboxChange('businessGoals', option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {formData.businessGoals.length === 0 && (
          <small className="error-message">※少なくとも1つ選択してください</small>
        )}
      </section>

      <section className="form-section">
        <h2>👥 ターゲット顧客</h2>
        <p className="section-description">ターゲットとする顧客層を選択してください（複数選択可）*</p>
        
        <div className="checkbox-list">
          {targetCustomerOptions.map(option => (
            <label key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.targetCustomers.includes(option.value)}
                onChange={() => handleCheckboxChange('targetCustomers', option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {formData.targetCustomers.length === 0 && (
          <small className="error-message">※少なくとも1つ選択してください</small>
        )}
      </section>

      <section className="form-section">
        <h2>✨ 期待される効果</h2>
        <p className="section-description">この取り組みで期待される効果を選択してください（複数選択可）*</p>
        
        <div className="checkbox-list">
          {expectedEffectOptions.map(option => (
            <label key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.expectedEffects.includes(option.value)}
                onChange={() => handleCheckboxChange('expectedEffects', option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {formData.expectedEffects.length === 0 && (
          <small className="error-message">※少なくとも1つ選択してください</small>
        )}
      </section>

      <section className="form-section">
        <h2>⚠️ 弱み・改善点</h2>
        <p className="section-description">現時点での弱みや改善すべき点を選択してください（複数選択可）</p>
        <p className="section-description" style={{color: '#e53e3e', fontSize: '0.9rem'}}>※「人手不足」「後継者不足」は審査上マイナス印象のため含まれていません</p>
        
        <div className="checkbox-list">
          {weaknessOptions.map(option => (
            <label key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.weaknesses.includes(option.value)}
                onChange={() => handleCheckboxChange('weaknesses', option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="form-section">
        <h2>📢 訴求するサービス・商品（任意）</h2>
        <p className="section-description">特に力を入れたいサービス・商品がある場合は記入してください</p>
        
        <div className="form-group">
          <label>訴求するサービス・商品</label>
          <textarea
            name="promotionService"
            value={formData.promotionService}
            onChange={handleInputChange}
            rows={3}
            placeholder="例: 地元産食材を使った季節限定メニュー"
          />
        </div>

        <div className="form-group">
          <label>価格帯</label>
          <input
            type="text"
            name="promotionPriceRange"
            value={formData.promotionPriceRange}
            onChange={handleInputChange}
            placeholder="例: 1,500円〜2,500円"
          />
        </div>

        <div className="form-group">
          <label>どんな人に届けたいか</label>
          <textarea
            name="promotionTarget"
            value={formData.promotionTarget}
            onChange={handleInputChange}
            rows={3}
            placeholder="例: 健康志向の30〜40代女性、ランチタイムの近隣オフィスワーカー"
          />
        </div>

        <div className="form-group">
          <label>取り組みの背景・目的</label>
          <textarea
            name="promotionBackground"
            value={formData.promotionBackground}
            onChange={handleInputChange}
            rows={4}
            placeholder="例: コロナ禍で在宅勤務が増え、ランチデリバリーの需要が高まっている。この需要に応えるため、テイクアウト専用メニューを開発し、オンライン注文システムを導入する。"
          />
        </div>
      </section>

      <section className="form-section">
        <h2>💰 経費項目</h2>
        
        <div className="expense-input">
          <div className="form-grid">
            <div className="form-group">
              <label>経費分類 *</label>
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

            <div className="form-group full-width">
              <label>内容説明 *</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="例: テイクアウト用真空包装機の購入"
              />
            </div>

            <div className="form-group">
              <label>金額（円） *</label>
              <input
                type="number"
                value={newExpense.amount || ''}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                placeholder="例: 300000"
                min="0"
              />
            </div>

            <div className="form-group">
              <button type="button" onClick={addExpense} className="btn-add">
                <Plus size={18} /> 追加
              </button>
            </div>
          </div>
        </div>

        {expenses.length > 0 && (
          <div className="expense-list">
            <h3>登録済み経費</h3>
            <table>
              <thead>
                <tr>
                  <th>分類</th>
                  <th>内容</th>
                  <th>金額</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, index) => (
                  <tr key={index}>
                    <td>{exp.category}</td>
                    <td>{exp.description}</td>
                    <td>¥{exp.amount.toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeExpense(index)}
                        className="btn-remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}><strong>合計</strong></td>
                  <td colSpan={2}><strong>¥{subsidyInfo.totalExpense.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {expenses.length > 0 && (
        <section className="form-section subsidy-calculator">
          <h2><Calculator size={24} /> 補助金額シミュレーション</h2>
          
          <div className="calculation-result">
            <div className="calc-row">
              <span>申請総額:</span>
              <span className="amount">¥{subsidyInfo.totalExpense.toLocaleString()}</span>
            </div>
            <div className="calc-row">
              <span>補助率:</span>
              <span className="rate">{Math.floor(subsidyInfo.subsidyRate * 100)}%</span>
            </div>
            <div className="calc-row">
              <span>補助上限額:</span>
              <span className="amount">¥{subsidyInfo.subsidyLimit.toLocaleString()}</span>
            </div>
            <div className="calc-row highlight">
              <span>予想受給額:</span>
              <span className="amount">¥{subsidyInfo.expectedSubsidy.toLocaleString()}</span>
            </div>
          </div>
          
          <p className="note">
            ※この金額はシミュレーションです。実際の補助金額は審査により決定されます。<br/>
            ※補助金は後払いです。事業実施後の実績報告後に入金されます。
          </p>
        </section>
      )}

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn-submit" 
          disabled={
            expenses.length === 0 || 
            formData.challenges.length === 0 || 
            formData.businessGoals.length === 0 ||
            formData.targetCustomers.length === 0 ||
            formData.expectedEffects.length === 0
          }
        >
          事業計画書を生成
        </button>
      </div>
    </form>
  )
}

export default BusinessPlanForm
