import type { BusinessPlanData } from '../types/BusinessPlan'

export function generateBusinessPlanDocument(data: Partial<BusinessPlanData>): string {
  const sections: string[] = []
  
  // 1. 事業概要
  sections.push(generateOverview(data))
  
  // 2. 代表者経歴と実績
  if (data.ownerCareer && data.ownerCareer.length > 0) {
    sections.push(generateOwnerProfile(data))
  }
  
  // 3. 現状分析（強み・弱み）
  sections.push(generateSWOTAnalysis(data))
  
  // 4. 売上・利益構造
  if (data.salesComposition && data.salesComposition.length > 0) {
    sections.push(generateSalesStructure(data))
  }
  
  // 5. 現在の集客状況
  if (data.customerSources && data.customerSources.length > 0) {
    sections.push(generateCustomerAcquisition(data))
  }
  
  // 6. 課題と取り組みの背景
  sections.push(generateChallengesAndBackground(data))
  
  // 7. 補助事業の内容
  sections.push(generateBusinessPlan(data))
  
  // 8. ターゲット顧客と訴求内容
  if (data.promotionService) {
    sections.push(generatePromotionStrategy(data))
  }
  
  // 9. 実施体制
  if (data.teamMembers && data.teamMembers.length > 0) {
    sections.push(generateImplementationStructure(data))
  }
  
  // 10. 売上目標と期待される効果
  sections.push(generateTargetsAndEffects(data))
  
  // 11. 経費の内訳と投資計画
  sections.push(generateInvestmentPlan(data))
  
  return sections.filter(s => s.length > 0).join('\n\n')
}

function generateOverview(data: Partial<BusinessPlanData>): string {
  const businessTypeMap: Record<string, string> = {
    'restaurant': '飲食店',
    'cafe': 'カフェ',
    'izakaya': '居酒屋',
    'ramen': 'ラーメン店',
    'bakery': 'ベーカリー',
    'other': '飲食業'
  }
  
  const type = businessTypeMap[data.businessType || 'restaurant'] || '飲食店'
  const yearsInBusiness = new Date().getFullYear() - parseInt(data.establishedYear || '2020')
  
  return `【事業概要】

当店「${data.businessName}」は、${data.address}において${type}を営む事業者です。${data.establishedYear}年の創業以来${yearsInBusiness}年にわたり、地域の皆様に支えられながら事業を展開してまいりました。

従業員数は${data.employeeCount}名（代表者含む）の小規模事業者ではありますが、地域に根差した誠実な経営を心がけ、着実に顧客基盤を築いてまいりました。`
}

function generateOwnerProfile(data: Partial<BusinessPlanData>): string {
  if (!data.ownerCareer || data.ownerCareer.length === 0) return ''
  
  const careers = data.ownerCareer
    .map(c => `・${c.period}：${c.experience}${c.note ? `（${c.note}）` : ''}`)
    .join('\n')
  
  return `【代表者経歴】

代表者である${data.ownerName}は、以下の経歴を有しております。

${careers}

これらの経験を活かし、確かなノウハウと実績に基づいた事業運営を行っております。`
}

function generateSWOTAnalysis(data: Partial<BusinessPlanData>): string {
  let text = '【当店の強みと課題】\n\n'
  
  // 強み
  if (data.strengths && data.strengths.length > 0) {
    text += '■ 当店の強み\n\n'
    text += '当店には以下のような強みがございます。\n\n'
    data.strengths.forEach((strength, index) => {
      text += `${index + 1}. ${strength}\n`
    })
    text += '\nこれらの強みを活かし、お客様から高い評価をいただいております。\n'
  }
  
  // 弱み・課題
  if (data.weaknesses && data.weaknesses.length > 0) {
    text += '\n■ 改善すべき課題\n\n'
    text += '一方で、以下のような課題も認識しております。\n\n'
    data.weaknesses.forEach((weakness, index) => {
      text += `${index + 1}. ${weakness}\n`
    })
    text += '\n今回の補助事業では、これらの課題を解決し、更なる事業発展を目指します。\n'
  }
  
  return text
}

function generateSalesStructure(data: Partial<BusinessPlanData>): string {
  if (!data.salesComposition || data.salesComposition.length === 0) return ''
  
  let text = '【売上・利益構造】\n\n'
  text += '■ 主力商品・サービス\n\n'
  text += '当店の売上を支える主力商品は以下の通りです。\n\n'
  
  data.salesComposition.forEach((item, index) => {
    const profitMargin = item.price > 0 ? Math.round((item.profit / item.price) * 100) : 0
    text += `${index + 1}. ${item.name}（${item.price.toLocaleString()}円）\n`
    text += `   特徴：${item.features}\n`
    text += `   売上構成比：${item.ratio}%、利益率：${profitMargin}%\n\n`
  })
  
  if (data.profitComposition && data.profitComposition.length > 0) {
    text += '■ 利益の中心\n\n'
    text += '利益面では、以下の商品が特に貢献しております。\n\n'
    data.profitComposition.forEach((item, index) => {
      text += `${index + 1}. ${item.name}：利益額${item.profit.toLocaleString()}円（構成比${item.ratio}%）\n`
    })
  }
  
  return text
}

function generateCustomerAcquisition(data: Partial<BusinessPlanData>): string {
  if (!data.customerSources || data.customerSources.length === 0) return ''
  
  let text = '【現在の集客状況】\n\n'
  text += '現在、当店への顧客流入経路は以下の通りです。\n\n'
  
  data.customerSources.forEach((source, index) => {
    text += `${index + 1}. ${source.channel}（${source.customerType}が中心、${source.ratio}%）\n`
  })
  
  text += '\nこれらの集客チャネルを基盤としつつ、今回の補助事業により新たな販路の開拓を目指します。\n'
  
  return text
}

function generateChallengesAndBackground(data: Partial<BusinessPlanData>): string {
  let text = '【課題認識と事業実施の背景】\n\n'
  
  if (data.challenges) {
    text += '■ 現状の課題\n\n'
    text += data.challenges + '\n\n'
  }
  
  if (data.promotionBackground) {
    text += '■ 本事業に取り組む背景\n\n'
    text += data.promotionBackground + '\n\n'
  } else {
    text += '■ 本事業に取り組む背景\n\n'
    text += '昨今の市場環境の変化や顧客ニーズの多様化を受け、従来の営業手法だけでは持続的な成長が困難になってきております。特に、デジタル化の進展により、オンラインでの情報発信力や販売チャネルの多様化が競争力の源泉となっています。\n\n'
    text += 'このような状況を踏まえ、当店の強みを活かしながら新たな顧客層へのアプローチを強化し、売上の安定化と拡大を図るため、本事業に取り組む決意をいたしました。\n'
  }
  
  return text
}

function generateBusinessPlan(data: Partial<BusinessPlanData>): string {
  let text = '【補助事業の具体的内容】\n\n'
  
  if (data.businessGoals) {
    text += data.businessGoals + '\n\n'
  }
  
  text += '具体的には、以下の取り組みを実施いたします。\n\n'
  
  if (data.expenses && data.expenses.length > 0) {
    const grouped = data.expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) acc[exp.category] = []
      acc[exp.category].push(exp)
      return acc
    }, {} as Record<string, typeof data.expenses>)
    
    Object.entries(grouped).forEach(([category, items]) => {
      text += `■ ${category}\n\n`
      items.forEach(item => {
        text += `・${item.description}（${item.amount.toLocaleString()}円）\n`
      })
      text += '\n'
    })
  }
  
  text += 'これらの投資により、販路の拡大と事業基盤の強化を実現いたします。\n'
  
  return text
}

function generatePromotionStrategy(data: Partial<BusinessPlanData>): string {
  let text = '【ターゲット顧客と訴求戦略】\n\n'
  
  if (data.promotionService) {
    text += `■ 訴求するサービス・商品\n\n`
    text += `${data.promotionService}\n\n`
  }
  
  if (data.promotionPriceRange) {
    text += `■ 価格帯\n\n`
    text += `${data.promotionPriceRange}\n\n`
  }
  
  if (data.promotionTarget) {
    text += `■ ターゲット顧客\n\n`
    text += `${data.promotionTarget}\n\n`
  }
  
  if (data.targetCustomers) {
    text += `メインターゲットは、${data.targetCustomers}です。\n\n`
  }
  
  text += 'これらのターゲットに対し、適切なメッセージと媒体を選定し、効果的な訴求を行ってまいります。\n'
  
  return text
}

function generateImplementationStructure(data: Partial<BusinessPlanData>): string {
  if (!data.teamMembers || data.teamMembers.length === 0) return ''
  
  let text = '【実施体制】\n\n'
  text += '本事業は、以下の体制で実施いたします。\n\n'
  
  data.teamMembers.forEach(member => {
    text += `・${member.position}：${member.role}`
    if (member.note) text += `（${member.note}）`
    text += '\n'
  })
  
  text += '\n各メンバーが役割を明確にし、責任を持って事業を推進してまいります。\n'
  
  return text
}

function generateTargetsAndEffects(data: Partial<BusinessPlanData>): string {
  let text = '【売上目標と期待される効果】\n\n'
  
  if (data.salesTargets && data.salesTargets.length > 0) {
    text += '■ 売上目標\n\n'
    text += '本事業の実施により、以下の売上目標の達成を目指します。\n\n'
    
    data.salesTargets.forEach(target => {
      text += `・${target.year}年度：売上高 ${target.sales.toLocaleString()}円、営業利益 ${target.profit.toLocaleString()}円\n`
    })
    text += '\n'
  }
  
  if (data.expectedEffects) {
    text += '■ 期待される効果\n\n'
    text += data.expectedEffects + '\n\n'
  }
  
  text += '以上の取り組みにより、持続的な成長基盤を確立し、地域経済の活性化にも貢献してまいります。\n'
  
  return text
}

function generateInvestmentPlan(data: Partial<BusinessPlanData>): string {
  if (!data.expenses || data.expenses.length === 0) return ''
  
  let text = '【投資計画と補助金活用】\n\n'
  text += '■ 経費内訳\n\n'
  
  data.expenses.forEach((exp, index) => {
    text += `${index + 1}. ${exp.category}：${exp.description}　${exp.amount.toLocaleString()}円\n`
  })
  
  text += `\n合計：${data.totalExpense?.toLocaleString() || 0}円\n\n`
  
  if (data.expectedSubsidy) {
    text += `補助金申請額：${data.expectedSubsidy.toLocaleString()}円（補助率${Math.round((data.subsidyRate || 0) * 100)}%）\n`
    text += `自己負担額：${((data.totalExpense || 0) - data.expectedSubsidy).toLocaleString()}円\n\n`
  }
  
  text += '本補助金を有効に活用し、投資効果を最大化することで、早期の事業目標達成を目指します。\n'
  
  return text
}
