// 顧客情報
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  joinDate: Date;
  lastPurchaseDate?: Date;
  notes?: string;
}

// 注文情報
export interface Order {
  id: string;
  customerId: string;
  orderDate: Date;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: OrderItem[];
  notes?: string;
}

// 注文アイテム
export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// 連絡ログ
export interface ContactLog {
  id: string;
  customerId: string;
  type: 'email' | 'sms' | 'call' | 'note';
  subject: string;
  message: string;
  sentDate: Date;
  status: 'sent' | 'failed' | 'pending';
}

// メンバーシップ情報
export interface MembershipInfo {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsRequired: number;
  benefits: string[];
  discountPercentage: number;
}
