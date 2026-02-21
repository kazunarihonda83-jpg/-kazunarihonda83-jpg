# 🚀 シフト管理アプリケーション

AIを活用した小売・飲食店向けシフト管理システム

---

## ✨ 主な機能

### 1. **AIシフト自動生成**
- スタッフの希望シフトを優先的に考慮
- 人件費を最適化
- ワンクリックで最適なシフトを作成

### 2. **シフト希望提出システム**
- スタッフが出勤不可日を事前申告
- 時間帯の希望も指定可能
- リアルタイムで管理者に通知

### 3. **シフト希望承認（管理者）**
- 全スタッフのシフト希望を一覧表示
- ワンクリックで承認
- 承認後、スタッフ画面も自動更新

### 4. **シフトカレンダー**
- 月次・週次・日次の3つの表示モード
- 管理者はカレンダー上で直接編集・削除可能

### 5. **勤怠管理**
- 手動・QRコード・GPS の3つの打刻方法
- リアルタイム時計表示
- 月次勤怠記録と統計

### 6. **評価管理**
- 5段階評価システム
- フィードバック・目標管理
- モチベーション統計

### 7. **レポート＆分析**
- 人件費計算・分析
- CSVエクスポート
- 視覚的なグラフ表示

### 8. **スタッフ管理**
- 完全なCRUD操作
- 役割管理（管理者・マネージャー・スタッフ）

---

## 🛠️ 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **React Query** - データフェッチング・キャッシング
- **Zustand** - 状態管理
- **React Router** - ルーティング
- **Lucide React** - アイコン
- **date-fns** - 日付操作

### バックエンド
- **Node.js + Express** - サーバー
- **SQLite** - データベース（開発環境）
- **JWT** - 認証
- **bcrypt** - パスワードハッシュ化

---

## 📦 インストール

### 前提条件
- Node.js 18.x以上
- npm 9.x以上

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg.git
cd -kazunarihonda83-jpg/shift-management-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### アクセス

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:3000

---

## 🧪 テストアカウント

| 役割 | メールアドレス | パスワード |
|------|----------------|-----------|
| 管理者 | admin@test.com | password123 |
| マネージャー | manager@test.com | password123 |
| スタッフ | staff@test.com | password123 |

---

## 🚀 デプロイ

### Vercel（フロントエンド）

```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
cd shift-management-app
vercel
```

詳細: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

### Render（バックエンド）

1. https://render.com にアクセス
2. 「New +」→「Web Service」
3. GitHubリポジトリを選択
4. 設定:
   - Root Directory: `shift-management-app`
   - Build Command: `npm install`
   - Start Command: `node server/app.js`

詳細: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

---

## 📁 プロジェクト構造

```
shift-management-app/
├── src/                    # フロントエンド
│   ├── pages/              # ページコンポーネント
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ShiftCalendar.jsx
│   │   ├── ShiftManagement.jsx
│   │   ├── ShiftRequest.jsx         # NEW: スタッフ希望提出
│   │   ├── ShiftRequestApproval.jsx # NEW: 管理者承認画面
│   │   ├── AttendanceTracking.jsx
│   │   ├── EvaluationManagement.jsx
│   │   ├── Reports.jsx
│   │   └── StaffList.jsx
│   ├── components/         # 共通コンポーネント
│   ├── store/              # Zustand状態管理
│   ├── api/                # API設定
│   └── App.jsx
├── server/                 # バックエンド
│   ├── app.js              # Expressサーバー
│   ├── routes/             # APIルート
│   ├── controllers/        # ビジネスロジック
│   ├── middleware/         # 認証・認可
│   └── db/                 # データベース
├── vercel.json             # Vercel設定
├── render.yaml             # Render設定
└── package.json
```

---

## 🔧 開発コマンド

```bash
# 開発サーバー（フロントエンド + バックエンド）
npm run dev

# フロントエンドのみ
npm run client

# バックエンドのみ
npm run server

# プロダクションビルド
npm run build

# ビルドをプレビュー
npm run preview

# データベースをシード
npm run db:seed
```

---

## 🌐 環境変数

### 開発環境 (.env.local)
```
VITE_API_URL=http://localhost:3000/api
```

### 本番環境 (.env.production)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 📊 データベーススキーマ

- **users** - ユーザー情報
- **stores** - 店舗情報
- **positions** - ポジション（役職）
- **shifts** - シフト
- **shift_requests** - シフト希望（NEW）
- **attendances** - 勤怠記録
- **evaluations** - 評価
- **feedback** - フィードバック
- **goals** - 目標

---

## 🎯 ワークフロー

```
1. スタッフがシフト希望を提出
   ↓
2. 管理者が「シフト希望承認」で確認
   ↓
3. 管理者が承認（スタッフに自動通知）
   ↓
4. 管理者が「AI自動生成」を実行
   ↓
5. スタッフの希望が反映されたシフトが完成！
```

---

## 🐛 トラブルシューティング

### ポートがすでに使用されている

```bash
# プロセスを終了
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### データベースをリセット

```bash
rm server/db/shift_management.db
npm run db:seed
```

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 ライセンス

MIT

---

## 🤝 コントリビューション

プルリクエストを歓迎します！

---

## 📞 サポート

問題がある場合は、Issuesを作成してください。

---

**開発者**: GenSpark AI Developer  
**リポジトリ**: https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg
