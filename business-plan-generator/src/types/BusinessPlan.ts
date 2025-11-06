export interface ExpenseItem {
  category: string
  description: string
  amount: number
  memo?: string
}

export interface SalesItem {
  name: string
  price: number
  features: string
  ratio: number
  cost: number
  profit: number
}

export interface SalesTarget {
  year: number
  sales: number
  profit: number
}

export interface CustomerSource {
  channel: string
  customerType: string
  ratio: number
}

export interface TeamMember {
  position: string
  role: string
  note: string
}

export interface CareerHistory {
  period: string
  experience: string
  note: string
}

export interface BusinessPlanData {
  // 店舗基本情報
  businessName: string
  ownerName: string
  address: string
  phone: string
  email: string
  businessType: string
  employeeCount: number
  establishedYear: string

  // 申請枠
  applicationCategory: 'normal' | 'startup' | 'wage-increase'
  isInvoiceEligible: boolean

  // 売上・利益構成
  salesComposition: SalesItem[]
  profitComposition: SalesItem[]
  
  // 売上目標
  salesTargets: SalesTarget[]
  
  // 集客方法
  customerSources: CustomerSource[]
  
  // 実施体制
  teamMembers: TeamMember[]
  
  // 代表者経歴
  ownerCareer: CareerHistory[]

  // 強み・弱み
  strengths: string[]
  weaknesses: string[]
  
  // 現状と課題
  currentSituation: string
  challenges: string

  // 事業目標
  businessGoals: string
  targetCustomers: string
  expectedEffects: string
  
  // 訴求サービス
  promotionService: string
  promotionPriceRange: string
  promotionTarget: string
  promotionBackground: string

  // 経費項目
  expenses: ExpenseItem[]
  totalExpense: number

  // 補助金計算
  subsidyRate: number
  subsidyLimit: number
  expectedSubsidy: number
}

export interface ExpenseCategory {
  id: string
  name: string
  description: string
  examples: string[]
}

export const expenseCategories: ExpenseCategory[] = [
  {
    id: 'machinery',
    name: '機械装置等費',
    description: '新商品開発や新サービスのための設備・機器購入費用',
    examples: ['真空包装機', 'POSレジシステム', 'ソフトクリームマシン', '製氷機']
  },
  {
    id: 'advertising',
    name: '広報費',
    description: 'お店や新商品をPRするための宣伝費用',
    examples: ['チラシ制作・配布', 'SNS広告', 'グルメサイト広告', 'ポスター作成']
  },
  {
    id: 'website',
    name: 'ウェブサイト関連費',
    description: 'オンライン販路拡大のためのWeb制作・運用費',
    examples: ['ホームページ作成', '予約機能付きサイト', 'ECサイト構築', 'SEO対策']
  },
  {
    id: 'exhibition',
    name: '展示会等出展費',
    description: '商談会・イベント・フェアへの出展費用',
    examples: ['食イベント出展', '物産展出展', '試食会開催', 'ブース設営']
  },
  {
    id: 'travel',
    name: '旅費',
    description: '情報収集・市場調査のための出張費',
    examples: ['先進地視察', '競合店舗調査', '業界セミナー参加', 'トレンド調査']
  },
  {
    id: 'development',
    name: '開発費',
    description: '新商品・新メニューの試作開発費用',
    examples: ['新メニュー試作材料', 'パッケージ試作', '商品開発費']
  },
  {
    id: 'materials',
    name: '資料購入費',
    description: '事業に必要な専門書籍・資料の購入費',
    examples: ['飲食経営専門書', 'マーケティング参考書', '業界レポート']
  },
  {
    id: 'rental',
    name: '借料（レンタル・リース費）',
    description: '機器・設備・会場のレンタル費用',
    examples: ['撮影機材レンタル', 'イベント会場レンタル', '機器リース']
  },
  {
    id: 'disposal',
    name: '設備処分費',
    description: '事業スペース拡大のための既存設備の廃棄費',
    examples: ['不要設備撤去', '古い厨房機器処分', '原状回復費']
  },
  {
    id: 'outsourcing',
    name: '委託・外注費',
    description: '専門業者への業務委託費用',
    examples: ['店舗改装工事', 'ロゴデザイン制作', 'プロモーション動画制作', 'コンサルティング']
  }
]
