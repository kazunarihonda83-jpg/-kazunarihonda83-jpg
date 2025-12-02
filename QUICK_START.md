# ⚡ クイックスタート - 5分でデプロイ

## 🎯 今すぐVercelにデプロイする

### 1️⃣ Vercelにアクセス
👉 https://vercel.com → GitHubでログイン

### 2️⃣ プロジェクトをインポート
- **「Add New」** → **「Project」**
- **「Import Git Repository」**
- リポジトリ: `kazunarihonda83-jpg/-kazunarihonda83-jpg`
- **「Import」** をクリック

### 3️⃣ 設定を入力（コピペでOK）

```
Project Name: shift-management-app

Root Directory: ./（変更しない）

Build Settings:
✅ Override: ON

Build Command:
npm run build

Output Directory:
shift-management-app/dist

Install Command:
npm run install

Environment Variables:
Key: VITE_API_URL
Value: https://3000-iqf0dj1wke1cog78fnr4y-cc2fbc16.sandbox.novita.ai
```

### 4️⃣ デプロイ
**「Deploy」** ボタンをクリック → 完了！🎉

---

## ✅ デプロイ後の確認

1. Vercelから発行されたURL（例: `https://your-app.vercel.app`）にアクセス
2. ログイン画面が表示されることを確認
3. テストアカウントでログイン:
   - Email: `admin@test.com`
   - Password: `password123`

---

## 📝 次のステップ（任意）

本番環境として使う場合は、バックエンドも別サービスにデプロイすることを推奨します。

### バックエンドのデプロイ（Render.com）

👉 https://render.com → GitHubでログイン

1. **「New」** → **「Web Service」**
2. リポジトリ: `kazunarihonda83-jpg/-kazunarihonda83-jpg`
3. 設定:
   ```
   Name: shift-management-api
   Root Directory: shift-management-app
   Build Command: npm install
   Start Command: node server/app.js
   
   Environment Variables:
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
4. **「Create Web Service」** → 完了！

5. 発行されたRender URL（例: `https://shift-management-api.onrender.com`）をVercelの環境変数 `VITE_API_URL` に設定して再デプロイ

---

## 🆘 問題が発生した場合

詳細な手順は `VERCEL_DEPLOY_STEP_BY_STEP.md` を参照してください。

---

## 🔗 リンク

- 📚 GitHub PR: https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg/pull/1
- 📖 詳細手順: [VERCEL_DEPLOY_STEP_BY_STEP.md](./VERCEL_DEPLOY_STEP_BY_STEP.md)
- 🌐 開発環境: https://5174-iqf0dj1wke1cog78fnr4y-cc2fbc16.sandbox.novita.ai
