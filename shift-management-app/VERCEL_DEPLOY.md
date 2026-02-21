# Vercel デプロイガイド

## 📋 概要

このアプリは**フロントエンド（React）**と**バックエンド（Node.js + SQLite）**で構成されています。

- **Vercel**: フロントエンドのみデプロイ
- **別サービス（Render/Railway推奨）**: バックエンドをデプロイ

---

## 🚀 ステップ1: Vercelにフロントエンドをデプロイ

### 1-1. Vercelアカウントでログイン

https://vercel.com にアクセスしてログイン

### 1-2. GitHubリポジトリをインポート

1. 「Add New...」→「Project」をクリック
2. GitHubリポジトリを選択: `kazunarihonda83-jpg/-kazunarihonda83-jpg`
3. ブランチ: `genspark_ai_developer`（または`main`にマージ後）

### 1-3. プロジェクト設定

```
Framework Preset: Vite
Root Directory: shift-management-app
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 1-4. 環境変数を設定

**重要: バックエンドURLを指定**

```
Name: VITE_API_URL
Value: https://your-backend-url.com/api
```

※ バックエンドをデプロイ後、そのURLを設定してください

### 1-5. デプロイ

「Deploy」ボタンをクリック → 自動デプロイ開始

---

## 🖥️ ステップ2: バックエンドをデプロイ（Render推奨）

### オプション1: Render.com（無料プラン有り）

#### 2-1. Renderアカウント作成
https://render.com にアクセス

#### 2-2. 新しいWeb Serviceを作成

1. 「New +」→「Web Service」
2. GitHubリポジトリを接続
3. 設定:
   ```
   Name: shift-management-api
   Branch: genspark_ai_developer
   Root Directory: shift-management-app
   Runtime: Node
   Build Command: npm install
   Start Command: node server/app.js
   ```

#### 2-3. 環境変数（Render）

```
NODE_ENV=production
PORT=3000
```

#### 2-4. デプロイ

「Create Web Service」→ 自動デプロイ

#### 2-5. バックエンドURLをコピー

例: `https://shift-management-api.onrender.com`

#### 2-6. VercelにバックエンドURLを設定

Vercelダッシュボード → Settings → Environment Variables

```
VITE_API_URL=https://shift-management-api.onrender.com/api
```

保存後、Vercelを再デプロイ

---

### オプション2: Railway.app

#### 2-1. Railwayアカウント作成
https://railway.app

#### 2-2. 新しいプロジェクト

1. 「New Project」→「Deploy from GitHub repo」
2. リポジトリ選択
3. 設定:
   ```
   Root Directory: shift-management-app
   Start Command: node server/app.js
   ```

#### 2-3. 環境変数（Railway）

```
NODE_ENV=production
PORT=${{PORT}}
```

#### 2-4. ドメイン設定

Settings → Generate Domain

#### 2-5. VercelにURLを設定

Vercelに戻って環境変数を更新

---

## ⚠️ 重要な注意点

### SQLiteの制約

**Render/Railway**: SQLiteファイルは揮発性（再起動で消える）

**解決策:**
1. **PostgreSQL/MySQL使用（推奨）**
   - Renderの無料PostgreSQLを使用
   - コード修正が必要（sqlite → pg）

2. **永続ストレージ使用**
   - Railwayの永続ボリューム

3. **クラウドDB使用**
   - Supabase（PostgreSQL）
   - PlanetScale（MySQL）

---

## 🔄 デプロイ後の確認

### フロントエンド（Vercel）
https://your-app.vercel.app

### バックエンド（Render）
https://your-api.onrender.com
https://your-api.onrender.com/health

### 動作確認
1. フロントエンドにアクセス
2. ログイン画面が表示されるか
3. ログインできるか（テストアカウント）
4. APIが正常に動作するか

---

## 🐛 トラブルシューティング

### フロントエンドがAPIに接続できない

**原因**: CORS設定またはAPI URLが間違っている

**解決**:
```javascript
// server/app.js
app.use(cors({
  origin: ['https://your-app.vercel.app'],
  credentials: true
}));
```

### データベースが初期化されない

**解決**: Renderで初回起動時にseedスクリプト実行
```bash
npm run db:seed
```

### 環境変数が反映されない

Vercelで変更後、必ず再デプロイが必要

---

## 📞 サポート

問題がある場合は、以下を確認：
1. Vercelのビルドログ
2. Renderのアプリケーションログ
3. ブラウザのコンソール（F12）

---

## ✅ デプロイチェックリスト

- [ ] Vercelアカウント作成
- [ ] GitHubリポジトリ接続
- [ ] Vercelにフロントエンドデプロイ
- [ ] Render/Railwayアカウント作成
- [ ] バックエンドデプロイ
- [ ] バックエンドURLをVercelに設定
- [ ] Vercel再デプロイ
- [ ] 動作確認（ログイン、API通信）
- [ ] データベース永続化対応（本番環境）

---

これで完全なデプロイが完了します！🎉
