import { Download, ArrowLeft, FileText } from 'lucide-react'
import type { BusinessPlanData } from '../types/BusinessPlan'
import './BusinessPlanPreview.css'
import jsPDF from 'jspdf'

interface BusinessPlanPreviewProps {
  data: BusinessPlanData
  onBack: () => void
}

const BusinessPlanPreview = ({ data, onBack }: BusinessPlanPreviewProps) => {
  
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // フォントサイズと位置の設定
    let y = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)

    // タイトル
    doc.setFontSize(18)
    doc.text('Business Plan / Jigyo Keikakusho', pageWidth / 2, y, { align: 'center' })
    y += 10
    doc.setFontSize(14)
    doc.text('Shokibo Jigyosha Jizokuka Hojokin', pageWidth / 2, y, { align: 'center' })
    y += 15

    // 基本情報
    doc.setFontSize(12)
    doc.text('1. Kihon Joho (Basic Information)', margin, y)
    y += 8
    
    doc.setFontSize(10)
    const basicInfo = [
      `Tenpo-mei: ${data.businessName}`,
      `Daihyosha-mei: ${data.ownerName}`,
      `Jusho: ${data.address}`,
      `Denwa: ${data.phone}`,
      `Email: ${data.email}`,
      `Jugyoin-su: ${data.employeeCount}nin`,
      `Sogyo-nen: ${data.establishedYear}nen`
    ]
    
    basicInfo.forEach(line => {
      doc.text(line, margin, y)
      y += 6
    })
    
    y += 5

    // 申請枠
    doc.setFontSize(12)
    doc.text('2. Shinsei-waku (Application Category)', margin, y)
    y += 8
    
    doc.setFontSize(10)
    const categoryMap = {
      'normal': 'Tsujowaku',
      'startup': 'Sogyowaku',
      'wage-increase': 'Chingin Hikiage-waku'
    }
    doc.text(`Waku: ${categoryMap[data.applicationCategory]}`, margin, y)
    y += 6
    doc.text(`Invoice Tokutei: ${data.isInvoiceEligible ? 'Tai' : 'Fu-tai'}`, margin, y)
    y += 10

    // 現状と課題
    doc.setFontSize(12)
    doc.text('3. Genjo to Kadai (Current Situation & Challenges)', margin, y)
    y += 8
    
    doc.setFontSize(10)
    const splitText = (text: string, maxWidth: number) => {
      return doc.splitTextToSize(text, maxWidth)
    }
    
    const situationLines = splitText(data.currentSituation, contentWidth)
    situationLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, margin, y)
      y += 6
    })
    
    y += 5
    const challengeLines = splitText(data.challenges, contentWidth)
    challengeLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, margin, y)
      y += 6
    })
    
    y += 10

    // 事業目標
    if (y > 250) {
      doc.addPage()
      y = 20
    }
    
    doc.setFontSize(12)
    doc.text('4. Jigyo Mokuhyo (Business Goals)', margin, y)
    y += 8
    
    doc.setFontSize(10)
    const goalLines = splitText(data.businessGoals, contentWidth)
    goalLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, margin, y)
      y += 6
    })
    
    y += 10

    // 経費明細
    if (y > 220) {
      doc.addPage()
      y = 20
    }
    
    doc.setFontSize(12)
    doc.text('5. Keihi Meisai (Expense Details)', margin, y)
    y += 8
    
    doc.setFontSize(10)
    data.expenses.forEach((exp, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(`${index + 1}. ${exp.category}`, margin, y)
      y += 6
      doc.text(`   ${exp.description}`, margin, y)
      y += 6
      doc.text(`   Kingaku: ${exp.amount.toLocaleString()}yen`, margin, y)
      y += 8
    })
    
    y += 5
    doc.text(`Gokei: ${data.totalExpense.toLocaleString()}yen`, margin, y)
    y += 6
    doc.text(`Yoso Jukyugaku: ${data.expectedSubsidy.toLocaleString()}yen`, margin, y)

    // PDFを保存
    doc.save(`jigyou-keikakusho-${data.businessName}.pdf`)
  }

  const downloadText = () => {
    let content = `事業計画書\n小規模事業者持続化補助金申請用\n\n`
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    
    content += `【1. 基本情報】\n\n`
    content += `店舗名: ${data.businessName}\n`
    content += `代表者名: ${data.ownerName}\n`
    content += `所在地: ${data.address}\n`
    content += `電話番号: ${data.phone}\n`
    content += `メールアドレス: ${data.email}\n`
    content += `従業員数: ${data.employeeCount}名\n`
    content += `創業年: ${data.establishedYear}年\n\n`
    
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    content += `【2. 申請枠】\n\n`
    const categoryMap = {
      'normal': '通常枠',
      'startup': '創業枠',
      'wage-increase': '賃金引上げ枠'
    }
    content += `申請枠: ${categoryMap[data.applicationCategory]}\n`
    content += `インボイス特例: ${data.isInvoiceEligible ? '対象' : '対象外'}\n\n`
    
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    content += `【3. 事業計画書】\n\n`
    content += data.currentSituation + '\n\n'
    
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    content += `【4. 経費明細】\n\n`
    
    data.expenses.forEach((exp, index) => {
      content += `${index + 1}. ${exp.category}\n`
      content += `   内容: ${exp.description}\n`
      content += `   金額: ¥${exp.amount.toLocaleString()}\n\n`
    })
    
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    content += `【5. 補助金計算】\n\n`
    content += `申請総額: ¥${data.totalExpense.toLocaleString()}\n`
    content += `補助率: ${Math.floor(data.subsidyRate * 100)}%\n`
    content += `補助上限額: ¥${data.subsidyLimit.toLocaleString()}\n`
    content += `予想受給額: ¥${data.expectedSubsidy.toLocaleString()}\n\n`
    content += `※補助金は後払いです。事業実施後の実績報告後に入金されます。\n\n`
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    content += `作成日: ${new Date().toLocaleDateString('ja-JP')}\n`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `事業計画書-${data.businessName}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="business-plan-preview">
      <div className="preview-actions">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={18} /> 入力画面に戻る
        </button>
        <div className="download-buttons">
          <button onClick={downloadPDF} className="btn-download">
            <Download size={18} /> PDF出力
          </button>
          <button onClick={downloadText} className="btn-download">
            <FileText size={18} /> テキスト出力
          </button>
        </div>
      </div>

      <div className="preview-content" id="preview-content">
        <div className="preview-header">
          <h1>事業計画書</h1>
          <p className="subtitle">小規模事業者持続化補助金申請用</p>
        </div>

        <section className="preview-section">
          <h2>1. 基本情報</h2>
          <table className="info-table">
            <tbody>
              <tr>
                <th>店舗名</th>
                <td>{data.businessName}</td>
              </tr>
              <tr>
                <th>代表者名</th>
                <td>{data.ownerName}</td>
              </tr>
              <tr>
                <th>所在地</th>
                <td>{data.address}</td>
              </tr>
              <tr>
                <th>電話番号</th>
                <td>{data.phone}</td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>{data.email}</td>
              </tr>
              <tr>
                <th>従業員数</th>
                <td>{data.employeeCount}名</td>
              </tr>
              <tr>
                <th>創業年</th>
                <td>{data.establishedYear}年</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="preview-section">
          <h2>2. 申請枠</h2>
          <table className="info-table">
            <tbody>
              <tr>
                <th>申請枠</th>
                <td>
                  {data.applicationCategory === 'normal' && '通常枠'}
                  {data.applicationCategory === 'startup' && '創業枠（創業3年以内）'}
                  {data.applicationCategory === 'wage-increase' && '賃金引上げ枠'}
                </td>
              </tr>
              <tr>
                <th>インボイス特例</th>
                <td>{data.isInvoiceEligible ? '対象（+50万円）' : '対象外'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="preview-section">
          <h2>3. 事業計画書</h2>
          <div className="text-content business-plan-document">
            {data.currentSituation.split('\n\n').map((paragraph, index) => {
              // セクションタイトル（【】で囲まれた部分）の判定
              if (paragraph.startsWith('【') && paragraph.includes('】')) {
                const [title, ...content] = paragraph.split('\n')
                return (
                  <div key={index} className="plan-section">
                    <h3 className="section-title">{title.replace(/【|】/g, '')}</h3>
                    {content.length > 0 && (
                      <div className="section-content">
                        {content.join('\n').split('\n').map((line, i) => {
                          if (line.startsWith('■ ')) {
                            return <h4 key={i} className="subsection-title">{line.replace('■ ', '')}</h4>
                          }
                          if (line.startsWith('・') || line.startsWith('${index + 1}.')) {
                            return <p key={i} className="list-item">{line}</p>
                          }
                          if (line.trim().length > 0) {
                            return <p key={i}>{line}</p>
                          }
                          return null
                        })}
                      </div>
                    )}
                  </div>
                )
              }
              // 通常の段落
              return paragraph.trim().length > 0 ? <p key={index}>{paragraph}</p> : null
            })}
          </div>
        </section>

        <section className="preview-section">
          <h2>4. 経費明細</h2>
          <table className="expense-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>分類</th>
                <th>内容</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map((exp, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{exp.category}</td>
                  <td>{exp.description}</td>
                  <td>¥{exp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>合計</strong></td>
                <td><strong>¥{data.totalExpense.toLocaleString()}</strong></td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="preview-section subsidy-summary">
          <h2>5. 補助金計算</h2>
          <div className="summary-box">
            <div className="summary-row">
              <span>申請総額:</span>
              <span className="amount">¥{data.totalExpense.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>補助率:</span>
              <span>{Math.floor(data.subsidyRate * 100)}%</span>
            </div>
            <div className="summary-row">
              <span>補助上限額:</span>
              <span className="amount">¥{data.subsidyLimit.toLocaleString()}</span>
            </div>
            <div className="summary-row highlight">
              <span>予想受給額:</span>
              <span className="amount large">¥{data.expectedSubsidy.toLocaleString()}</span>
            </div>
          </div>
          <p className="note">
            ※補助金は後払いです。事業実施後の実績報告後に入金されます。
          </p>
        </section>

        <div className="preview-footer">
          <p>作成日: {new Date().toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    </div>
  )
}

export default BusinessPlanPreview
