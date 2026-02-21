# シフト管理アプリ - UIデザインガイド

このドキュメントは、本アプリのUIデザインシステムを詳細に説明します。
同じ見た目のアプリを作る際は、この指示を参考にしてください。

---

## 🎨 デザインコンセプト

### 全体的な印象
- **モダンでクリーンなダッシュボード風デザイン**
- **ビジネスアプリケーションに最適化された実用的UI**
- **データの可視性と操作性を重視**
- **日本企業向けの落ち着いた色使い**

### デザインキーワード
- **プロフェッショナル**: 企業向けSaaSツールの質感
- **シンプル**: 余計な装飾を排除した機能美
- **直感的**: 初めてでも迷わない操作性
- **高コントラスト**: 視認性を重視した配色

---

## 🎨 カラーパレット

### プライマリカラー（メインアクション）
```css
/* ブルー系（信頼性・プロフェッショナル） */
Primary: #2563EB (Tailwind: blue-600)
Primary Hover: #1D4ED8 (Tailwind: blue-700)
Primary Light: #DBEAFE (Tailwind: blue-50)
Primary Text: #1E40AF (Tailwind: blue-800)
```

### セカンダリカラー（アクション系）
```css
/* グリーン（成功・ポジティブアクション） */
Success: #16A34A (Tailwind: green-600)
Success Hover: #15803D (Tailwind: green-700)

/* レッド（削除・警告） */
Danger: #DC2626 (Tailwind: red-600)
Danger Hover: #B91C1C (Tailwind: red-700)

/* イエロー（注意・進行中） */
Warning: #EAB308 (Tailwind: yellow-500)

/* パープル（特別な要素） */
Special: #9333EA (Tailwind: purple-600)

/* オレンジ（強調） */
Accent: #EA580C (Tailwind: orange-600)
```

### ニュートラルカラー（ベース）
```css
/* グレースケール */
Text Primary: #111827 (Tailwind: gray-900)
Text Secondary: #4B5563 (Tailwind: gray-600)
Text Tertiary: #6B7280 (Tailwind: gray-500)
Text Disabled: #9CA3AF (Tailwind: gray-400)

Background: #FFFFFF (white)
Surface: #F9FAFB (Tailwind: gray-50)
Border: #E5E7EB (Tailwind: gray-200)
Divider: #D1D5DB (Tailwind: gray-300)
```

---

## 📐 レイアウトシステム

### 全体構造
```
┌─────────────────────────────────────┐
│  Sidebar (固定幅240px)               │  Header (高さ64px)
│  - ロゴ                              │  - ページタイトル
│  - ナビゲーション                    │  - ユーザー情報
│  - ロールバッジ                      │  - ログアウト
│  - ログアウトボタン                  │
├─────────────────────────────────────┤
│  Content Area (max-width: 7xl)      │
│  - パディング: p-6                  │
│  - 余白: space-y-6                  │
│                                     │
└─────────────────────────────────────┘
```

### グリッドシステム
```css
/* 統計カード（ダッシュボード） */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
gap-6

/* フォーム */
grid-cols-1 md:grid-cols-2
gap-4

/* テーブル */
w-full overflow-x-auto
```

---

## 🧩 コンポーネントライブラリ

### 1. カード（Card）
```jsx
// 基本カード
<div className="bg-white rounded-lg shadow-md p-6">
  {/* コンテンツ */}
</div>

// 統計カード
<div className="bg-white rounded-lg shadow-md p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-600 text-sm mb-1">ラベル</p>
      <p className="text-3xl font-bold text-gray-900">
        123<span className="text-lg text-gray-600 ml-1">単位</span>
      </p>
    </div>
    <IconComponent className="w-12 h-12 text-blue-600" />
  </div>
</div>
```

### 2. ボタン（Button）
```jsx
// プライマリボタン
<button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
  <Icon className="w-5 h-5" />
  <span>ボタンテキスト</span>
</button>

// セカンダリボタン（成功）
<button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
  実行
</button>

// デンジャーボタン（削除）
<button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
  削除
</button>

// ゴーストボタン
<button className="text-gray-700 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
  キャンセル
</button>
```

### 3. テーブル（Table）
```jsx
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          ヘッダー
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          データ
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4. フォーム要素
```jsx
// 入力フィールド
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    ラベル <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="プレースホルダー"
  />
</div>

// セレクトボックス
<select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
  <option>オプション1</option>
</select>
```

### 5. バッジ（Badge）
```jsx
// ステータスバッジ（成功）
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  公開済み
</span>

// ステータスバッジ（進行中）
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
  下書き
</span>

// ステータスバッジ（エラー）
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
  エラー
</span>

// ロールバッジ（アイコン付き）
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  <Icon className="w-3 h-3 mr-1" />
  管理者
</span>
```

### 6. モーダル（Modal）
```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
    <h3 className="text-xl font-semibold mb-4">タイトル</h3>
    {/* コンテンツ */}
    <div className="flex justify-end space-x-3 mt-6">
      <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
        キャンセル
      </button>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        確定
      </button>
    </div>
  </div>
</div>
```

### 7. トースト通知
```jsx
// ライブラリ: sonner
import { toast } from 'sonner';

// 成功
toast.success('操作が完了しました');

// エラー
toast.error('エラーが発生しました');

// 情報
toast.info('情報メッセージ');
```

---

## 🎯 アイコンシステム

### アイコンライブラリ
**Lucide React** を使用
```bash
npm install lucide-react
```

### 使用頻度の高いアイコン
```jsx
import {
  // ナビゲーション
  Home, Calendar, Users, Clock, TrendingUp, BarChart3, FileText,
  
  // アクション
  Plus, Edit, Trash2, Search, Filter, Download, Send, X,
  
  // 状態
  CheckCircle, XCircle, AlertCircle, Info,
  
  // 矢印・方向
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  
  // その他
  Mail, Phone, MapPin, QrCode, Sparkles, Target, Star, Coins
} from 'lucide-react';
```

### アイコンサイズ規則
```jsx
// 小（インラインテキスト）
<Icon className="w-4 h-4" />

// 中（ボタン内）
<Icon className="w-5 h-5" />

// 大（統計カード）
<Icon className="w-12 h-12 text-blue-600" />

// 特大（空状態）
<Icon className="w-16 h-16 text-gray-400" />
```

---

## 📝 タイポグラフィ

### フォント
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### テキストスタイル
```jsx
// ページタイトル
<h1 className="text-3xl font-bold text-gray-900 mb-2">
  ページタイトル
</h1>

// サブタイトル
<p className="text-gray-600">
  説明文
</p>

// セクションタイトル
<h2 className="text-xl font-semibold mb-4">
  セクション
</h2>

// カードタイトル
<h3 className="text-lg font-semibold">
  カードタイトル
</h3>

// ラベル
<label className="block text-sm font-medium text-gray-700 mb-1">
  フィールド名
</label>

// ヘルプテキスト
<p className="text-sm text-gray-500">
  補足説明
</p>
```

---

## 🎭 インタラクション＆アニメーション

### ホバーエフェクト
```jsx
// ボタン
hover:bg-blue-700 transition-colors

// カード
hover:bg-gray-50

// テーブル行
hover:bg-gray-50

// リンク
hover:text-blue-700 hover:underline
```

### フォーカススタイル
```jsx
focus:outline-none focus:ring-2 focus:ring-blue-500
```

### トランジション
```jsx
// 色変化
transition-colors

// 汎用
transition-all duration-200
```

### ローディング状態
```jsx
disabled:opacity-50 disabled:cursor-not-allowed
```

---

## 📱 レスポンシブデザイン

### ブレークポイント
```css
/* Tailwind デフォルト */
sm: 640px   /* スマートフォン横 */
md: 768px   /* タブレット */
lg: 1024px  /* デスクトップ */
xl: 1280px  /* 大画面 */
2xl: 1536px /* 超大画面 */
```

### レスポンシブパターン
```jsx
// グリッド
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// テキストサイズ
text-2xl md:text-3xl lg:text-4xl

// パディング
p-4 md:p-6 lg:p-8

// 表示・非表示
hidden md:block
```

---

## 🎨 デザイントークン

### スペーシング
```jsx
gap-2    // 8px
gap-4    // 16px
gap-6    // 24px

p-4      // padding: 16px
p-6      // padding: 24px
px-4     // padding-left/right: 16px
py-2     // padding-top/bottom: 8px

space-x-2  // 子要素間の横間隔: 8px
space-y-4  // 子要素間の縦間隔: 16px
```

### ボーダー半径
```jsx
rounded-sm   // 2px
rounded      // 4px
rounded-lg   // 8px
rounded-xl   // 12px
rounded-full // 9999px（円形）
```

### シャドウ
```jsx
shadow-sm    // 軽いシャドウ
shadow-md    // 中程度（カード標準）
shadow-lg    // 強いシャドウ
```

---

## 🚀 実装のベストプラクティス

### 1. コンポーネント構造
```jsx
const PageName = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          タイトル
        </h1>
        <p className="text-gray-600">説明</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* カード */}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* コンテンツ */}
      </div>
    </div>
  );
};
```

### 2. 条件付きスタイリング
```jsx
className={`base-classes ${condition ? 'conditional-class' : 'alternative-class'}`}
```

### 3. 状態に応じた色分け
```jsx
// ステータス
const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

<span className={`px-2 py-1 rounded-full ${statusColors[status]}`}>
  {statusText}
</span>
```

---

## 📋 同じUIを作るための指示例

### 指示テンプレート

```
以下のデザインシステムでアプリを作成してください：

【デザインコンセプト】
- モダンなビジネスダッシュボード風
- Tailwind CSSを使用
- Lucide Reactでアイコン

【カラースキーム】
- プライマリ: blue-600 / blue-700（ホバー）
- 成功: green-600
- 警告: yellow-500
- エラー: red-600
- ベース: white背景、gray-50サーフェス

【主要コンポーネント】
1. カード: bg-white rounded-lg shadow-md p-6
2. ボタン: bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700
3. テーブル: thead bg-gray-50、hover:bg-gray-50
4. フォーム: focus:ring-2 focus:ring-blue-500

【レイアウト】
- サイドバー固定（240px幅）
- コンテンツエリア max-w-7xl mx-auto p-6
- 統計カード grid-cols-1 md:grid-cols-4 gap-6

【タイポグラフィ】
- ページタイトル: text-3xl font-bold text-gray-900
- サブタイトル: text-gray-600
- セクションタイトル: text-xl font-semibold

【アイコン】
- lucide-react を使用
- サイズ: ボタン内 w-5 h-5、統計カード w-12 h-12

【トースト通知】
- sonner ライブラリを使用
```

---

## 🎨 デザインリファレンス

このデザインは以下の要素を参考にしています：

1. **Vercel Dashboard** - クリーンで洗練されたビジネスUI
2. **Stripe Dashboard** - データ可視化に優れたレイアウト
3. **Linear** - モダンでミニマルなデザイン
4. **Notion** - 直感的な操作性
5. **Tailwind UI** - Tailwind CSSの公式コンポーネント

---

## ✅ チェックリスト

同じUIを再現する際は以下を確認：

- [ ] Tailwind CSSを導入
- [ ] lucide-reactをインストール
- [ ] sonnerをインストール（トースト通知用）
- [ ] カラーパレット（blue-600中心）
- [ ] カードコンポーネント（rounded-lg shadow-md）
- [ ] ボタンスタイル（transition-colors）
- [ ] テーブルスタイル（hover効果）
- [ ] フォームスタイル（focus:ring-2）
- [ ] レスポンシブグリッド
- [ ] アイコンサイズ統一
- [ ] タイポグラフィ階層
- [ ] スペーシング一貫性

---

**このガイドに従えば、全く同じ見た目のアプリが作成できます！** 🎨✨
