# 🚀 クイックデプロイガイド

最速でVercelにデプロイする方法

---

## ⚡ 3ステップでデプロイ

### ステップ1: Vercel CLIをインストール（初回のみ）

```bash
npm install -g vercel
```

### ステップ2: Vercelにログイン

```bash
vercel login
```

### ステップ3: デプロイ

```bash
cd shift-management-app
vercel
```

質問に答える:
```
? Set up and deploy "shift-management-app"? [Y/n] Y
? Which scope? あなたのアカウント名
? Link to existing project? [y/N] N
? What's your project's name? shift-management-app
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

完了！🎉

---

## 🌐 デプロイ後のURL

Vercelが自動的にURLを生成します:
```
https://shift-management-app-xxx.vercel.app
```

---

## ⚙️ 環境変数を設定

### オプション1: Vercelダッシュボード

1. https://vercel.com/dashboard
2. プロジェクトを選択
3. Settings → Environment Variables
4. 追加:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.com/api
   ```
5. Save → Redeploy

### オプション2: CLI

```bash
vercel env add VITE_API_URL
# プロンプトでバックエンドURLを入力
# 例: https://your-backend-url.onrender.com/api
```

再デプロイ:
```bash
vercel --prod
```

---

## 🖥️ バックエンドのデプロイ

### Render（推奨・無料）

1. https://render.com にアクセス
2. 「New +」→「Web Service」
3. GitHubリポジトリを選択
4. 設定:
   ```
   Name: shift-management-api
   Branch: genspark_ai_developer
   Root Directory: shift-management-app
   Build Command: npm install
   Start Command: node server/app.js
   ```
5. 環境変数:
   ```
   NODE_ENV=production
   ```
6. 「Create Web Service」

デプロイ完了後、URLをコピー（例: `https://shift-management-api.onrender.com`）

### Vercelに戻って環境変数を設定

```bash
vercel env add VITE_API_URL production
# 値: https://shift-management-api.onrender.com/api
```

再デプロイ:
```bash
vercel --prod
```

---

## ✅ 確認

### フロントエンド
https://your-app.vercel.app

### バックエンド
https://your-api.onrender.com/health

### ログイン
- Email: admin@test.com
- Password: password123

---

## 🐛 トラブルシューティング

### ビルドエラー

```bash
# ローカルで確認
npm run build
```

### APIに接続できない

環境変数を確認:
```bash
vercel env ls
```

VITE_API_URLが正しく設定されているか確認

### CORS エラー

バックエンドのCORS設定を更新:
```javascript
// server/app.js
app.use(cors({
  origin: 'https://your-app.vercel.app'
}));
```

---

## 🎯 次のステップ

1. カスタムドメインを設定（オプション）
2. データベースを永続化（PostgreSQL推奨）
3. 環境変数をセキュアに管理

---

これで完了です！簡単でしょう？🚀
