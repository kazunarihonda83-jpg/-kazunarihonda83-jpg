# Vercelへのクイックデプロイ手順

## 🚀 最も簡単なデプロイ方法

### 手順1: GitHubにプッシュ

```bash
# 現在のブランチを確認
git branch

# mainブランチにマージ（まだの場合）
git checkout main
git merge genspark_ai_developer
git push origin main
```

### 手順2: Vercelにデプロイ

#### オプションA: Vercel Dashboard（推奨）

1. **Vercelにアクセス**: https://vercel.com
2. **GitHubでサインイン**
3. **「Add New...」→「Project」をクリック**
4. **リポジトリを選択**: `-kazunarihonda83-jpg`
5. **設定を入力**:
   ```
   Framework Preset: Vite
   Root Directory: shift-management-app
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
6. **環境変数を追加**:
   - Key: `VITE_API_URL`
   - Value: `https://3000-iqf0dj1wke1cog78fnr4y-cc2fbc16.sandbox.novita.ai/api`
   
   ⚠️ **注意**: これは一時的なサンドボックスURLです。本番環境ではバックエンドを別途デプロイしてください。

7. **「Deploy」をクリック**

#### オプションB: Deploy Buttonを使用

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg&project-name=shift-management-app&repository-name=shift-management-app&root-directory=shift-management-app&env=VITE_API_URL&envDescription=Backend%20API%20URL&envLink=https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg#deployment)

---

## ⚠️ 重要な注意事項

### バックエンドについて

このアプリは**フロントエンド（React）とバックエンド（Node.js + SQLite）**で構成されています。

**Vercelにフロントエンドのみをデプロイする場合:**
- バックエンドは別途デプロイが必要です
- 推奨サービス: Render.com、Railway.app、Heroku

**完全なデプロイ手順:**
1. バックエンドをRender/Railwayにデプロイ
2. デプロイされたバックエンドURLを取得
3. Vercelの環境変数を更新: `VITE_API_URL=https://your-backend.onrender.com/api`

詳細は `DEPLOYMENT.md` を参照してください。

---

## 🔧 ローカルでビルドテスト

デプロイ前にローカルでビルドが成功するか確認:

```bash
cd shift-management-app

# ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

ビルドが成功すれば、Vercelでも動作します。

---

## 🌐 デプロイ後の確認

デプロイが完了したら:

1. **フロントエンドURL**: Vercelが提供するURL（例: `https://shift-management-app.vercel.app`）
2. **動作確認**:
   - ログインページが表示される
   - デモアカウントでログイン可能
   - 各ページが正常に動作

### テストアカウント
- 管理者: admin@test.com / password123
- マネージャー: manager@test.com / password123
- スタッフ: staff@test.com / password123

---

## 🐛 トラブルシューティング

### ビルドエラーが発生する場合

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# ビルドを再試行
npm run build
```

### APIに接続できない場合

1. Vercelの環境変数を確認: `VITE_API_URL` が正しく設定されているか
2. バックエンドが起動しているか確認
3. CORS設定を確認（バックエンド側）

---

## 📚 参考ドキュメント

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- 詳細なデプロイ手順: `DEPLOYMENT.md`
