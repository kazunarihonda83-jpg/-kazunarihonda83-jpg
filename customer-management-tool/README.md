# 顧客管理ツール (CRM System)

顧客情報、注文履歴、会員管理、連絡機能を備えた統合型顧客管理システムです。

## 📋 機能概要

### ✨ 実装機能

1. **ダッシュボード**
   - 総顧客数、VIP顧客数の表示
   - 総売上と平均注文額の統計
   - 最近の顧客と注文の一覧表示

2. **顧客管理**
   - 顧客情報の表示と検索
   - メンバーシップレベル（ブロンズ、シルバー、ゴールド、プラチナ）の管理
   - ポイント管理
   - 顧客詳細情報の表示
   - 購買履歴の確認

3. **注文管理**
   - 注文一覧の表示
   - 注文ステータス管理（完了、保留中、キャンセル）
   - 注文詳細の表示
   - 顧客ごとの購買履歴

4. **連絡管理**
   - 複数の連絡チャネル対応（メール、SMS、電話、ノート）
   - 連絡ログの記録と表示
   - 新しい連絡の追加機能
   - 連絡ステータスの管理

5. **会員管理**
   - 4段階のメンバーシップレベル
   - レベル別の特典表示
   - ポイント制度
   - 割引率の適用

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15.1.6 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 3.4.1
- **アイコン**: Lucide React 0.308.0
- **日付操作**: date-fns 3.0.0
- **ランタイム**: React 19.0.0

## 📂 プロジェクト構造

```
customer-management-tool/
├── src/
│   ├── app/
│   │   ├── page.tsx           # メインページ
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── globals.css        # グローバルスタイル
│   ├── components/
│   │   ├── Header.tsx         # ヘッダー
│   │   ├── Sidebar.tsx        # サイドバー
│   │   ├── Dashboard.tsx      # ダッシュボード統計
│   │   ├── CustomerList.tsx   # 顧客一覧
│   │   ├── CustomerDetail.tsx # 顧客詳細モーダル
│   │   ├── OrderList.tsx      # 注文一覧
│   │   ├── OrderDetail.tsx    # 注文詳細モーダル
│   │   ├── ContactLog.tsx     # 連絡ログ
│   │   └── ContactForm.tsx    # 連絡フォーム
│   ├── lib/
│   │   └── utils.ts           # ユーティリティ関数
│   ├── data/
│   │   └── sampleData.ts      # サンプルデータ
│   └── types/
│       └── index.ts           # TypeScript型定義
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 📊 データモデル

### Customer（顧客）
```typescript
{
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
```

### Order（注文）
```typescript
{
  id: string;
  customerId: string;
  orderDate: Date;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: OrderItem[];
  notes?: string;
}
```

### ContactLog（連絡ログ）
```typescript
{
  id: string;
  customerId: string;
  type: 'email' | 'sms' | 'call' | 'note';
  subject: string;
  message: string;
  sentDate: Date;
  status: 'sent' | 'failed' | 'pending';
}
```

## 🚀 使用方法

### インストール

```bash
cd customer-management-tool
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

### プロダクションビルド

```bash
npm run build
npm start
```

## 📱 ページ構成

1. **ダッシュボード** - システムの全体像と統計情報
2. **顧客管理** - 全顧客の一覧と詳細情報
3. **注文管理** - 全注文の一覧と詳細情報
4. **連絡管理** - 顧客との連絡履歴と新規連絡の追加
5. **設定** - メンバーシップ設定とシステム情報

## 🎨 UIコンポーネント

- **Header**: ページタイトルと現在のセクション表示
- **Sidebar**: ナビゲーションメニュー
- **StatCard**: 統計情報を表示するカード
- **Table**: データの一覧表示
- **Modal**: 詳細情報の表示
- **Form**: 新しい連絡情報の入力

## 🔧 カスタマイズ可能な要素

- **メンバーシップレベル**: `src/data/sampleData.ts` の `membershipTiers` で設定可能
- **サンプルデータ**: `src/data/sampleData.ts` で追加・修正可能
- **色彩スキーム**: `tailwind.config.js` で変更可能
- **日付フォーマット**: `src/lib/utils.ts` で調整可能

## 🌟 将来の拡張機能

- [ ] バックエンドAPI連携
- [ ] データベース統合（PostgreSQL など）
- [ ] 認証機能（ログイン、ユーザー権限）
- [ ] データエクスポート機能（CSV、PDF）
- [ ] メール/SMS自動送信機能
- [ ] グラフとチャート（より詳細な分析）
- [ ] ポイント自動計算機能
- [ ] キャンペーン管理機能
- [ ] モバイルアプリ対応
- [ ] リアルタイム通知機能

## 📝 ライセンス

ISC License

## 🎯 プロジェクト情報

- **バージョン**: 1.0.0
- **開発言語**: TypeScript
- **ステータス**: ✅ 完成・展開可能
