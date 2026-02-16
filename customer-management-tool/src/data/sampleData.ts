import { Customer, Order, ContactLog, MembershipInfo } from '@/types';

export const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    address: '東京都渋谷区',
    company: '株式会社テック',
    membershipTier: 'gold',
    points: 2500,
    joinDate: new Date('2022-01-15'),
    lastPurchaseDate: new Date('2025-02-10'),
    notes: '優良顧客、定期購入者',
  },
  {
    id: '2',
    name: '鈴木花子',
    email: 'suzuki@example.com',
    phone: '090-9876-5432',
    address: '東京都新宿区',
    company: '株式会社デザイン',
    membershipTier: 'silver',
    points: 1200,
    joinDate: new Date('2023-06-20'),
    lastPurchaseDate: new Date('2025-02-05'),
  },
  {
    id: '3',
    name: '佐藤次郎',
    email: 'sato@example.com',
    phone: '090-5555-1111',
    membershipTier: 'bronze',
    points: 450,
    joinDate: new Date('2024-11-01'),
    lastPurchaseDate: new Date('2025-01-28'),
  },
  {
    id: '4',
    name: '鈴木美咲',
    email: 'misaki@example.com',
    phone: '090-3333-7777',
    address: '神奈川県横浜市',
    membershipTier: 'platinum',
    points: 5800,
    joinDate: new Date('2021-03-10'),
    lastPurchaseDate: new Date('2025-02-12'),
    notes: 'VIP顧客、月1回以上購入',
  },
];

export const sampleOrders: Order[] = [
  {
    id: 'O001',
    customerId: '1',
    orderDate: new Date('2025-02-10'),
    amount: 15000,
    status: 'completed',
    items: [
      { id: '1', productName: 'プロダクトA', quantity: 2, unitPrice: 5000 },
      { id: '2', productName: 'サービスB', quantity: 1, unitPrice: 5000 },
    ],
    notes: '定期購入',
  },
  {
    id: 'O002',
    customerId: '1',
    orderDate: new Date('2025-01-20'),
    amount: 8500,
    status: 'completed',
    items: [{ id: '1', productName: 'プロダクトC', quantity: 1, unitPrice: 8500 }],
  },
  {
    id: 'O003',
    customerId: '2',
    orderDate: new Date('2025-02-05'),
    amount: 12000,
    status: 'completed',
    items: [{ id: '1', productName: 'パッケージD', quantity: 3, unitPrice: 4000 }],
  },
  {
    id: 'O004',
    customerId: '4',
    orderDate: new Date('2025-02-12'),
    amount: 25000,
    status: 'pending',
    items: [
      { id: '1', productName: 'プレミアムプロダクト', quantity: 1, unitPrice: 25000 },
    ],
  },
];

export const sampleContactLogs: ContactLog[] = [
  {
    id: 'C001',
    customerId: '1',
    type: 'email',
    subject: 'キャンペーン通知',
    message: '新製品発表に関するメールを送信',
    sentDate: new Date('2025-02-12'),
    status: 'sent',
  },
  {
    id: 'C002',
    customerId: '1',
    type: 'sms',
    subject: 'ポイント還元通知',
    message: '500ポイントが加算されました',
    sentDate: new Date('2025-02-10'),
    status: 'sent',
  },
  {
    id: 'C003',
    customerId: '4',
    type: 'email',
    subject: 'VIP特典のご案内',
    message: 'VIP会員向けの特別セールについてのメール',
    sentDate: new Date('2025-02-08'),
    status: 'sent',
  },
];

export const membershipTiers: MembershipInfo[] = [
  {
    tier: 'bronze',
    pointsRequired: 0,
    benefits: ['基本的なサポート', 'ニュースレター配信'],
    discountPercentage: 0,
  },
  {
    tier: 'silver',
    pointsRequired: 1000,
    benefits: ['優先サポート', 'special sale access', '誕生日クーポン'],
    discountPercentage: 5,
  },
  {
    tier: 'gold',
    pointsRequired: 2500,
    benefits: ['VIPサポート', '送料無料', '特別セール先行利用', 'ポイント2倍'],
    discountPercentage: 10,
  },
  {
    tier: 'platinum',
    pointsRequired: 5000,
    benefits: ['24時間専属サポート', '完全送料無料', 'VIP限定イベント招待', 'ポイント3倍', '誕生月割引'],
    discountPercentage: 15,
  },
];
