# Shift Management App - デプロイメントガイド

このアプリケーションはフルスタック（React + Node.js + SQLite）です。
フロントエンドとバックエンドを分離してデプロイすることを推奨します。

## 🚀 推奨デプロイ方法

### オプション1: フロントエンド（Vercel） + バックエンド（Render/Railway）

#### A. バックエンドをRender/Railwayにデプロイ

**Render.com の場合:**
1. https://render.com にサインアップ
2. 「New +」→「Web Service」を選択
3. GitHubリポジトリを接続
4. 以下の設定を入力：
   - **Name**: shift-management-api
   - **Root Directory**: `shift-management-app`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/app.js`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `PORT=3000`
5. 「Create Web Service」をクリック
6. デプロイされたURL（例: `https://shift-management-api.onrender.com`）をコピー

#### B. フロントエンドをVercelにデプロイ

**準備:**
1. `.env.production` ファイルを作成:
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Vercelデプロイ手順:**
1. https://vercel.com にサインアップ
2. 「Add New...」→「Project」を選択
3. GitHubリポジトリをインポート
4. 設定を入力：
   - **Framework Preset**: Vite
   - **Root Directory**: `shift-management-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. 環境変数を追加：
   - `VITE_API_URL`: バックエンドのURL + `/api`
6. 「Deploy」をクリック

---

### オプション2: フロントエンドのみVercel（デモ用）

バックエンドなしでフロントエンドのみデプロイする場合：

1. API呼び出しをモックデータに置き換える
2. またはサンドボックスのバックエンドURLを使用（一時的）

**環境変数:**
```
VITE_API_URL=https://3000-iqf0dj1wke1cog78fnr4y-cc2fbc16.sandbox.novita.ai/api
```

⚠️ **注意**: サンドボックスURLは一時的なものなので、本番環境には向きません。

---

### オプション3: Vercel Serverless Functions（制限あり）

Vercelのサーバーレス関数を使用する場合：

**制約:**
- SQLiteは永続化されない（各リクエストで初期化）
- PostgreSQL/MySQLなどの外部DBが必要
- 実行時間制限（10秒 - Hobby、60秒 - Pro）

**手順:**
1. データベースをSupabase/PlanetScaleなどに移行
2. `/api` フォルダーをプロジェクトルートに作成
3. 各エンドポイントをServerless Functionに変換

---

## 🔧 GitHub連携デプロイ（推奨）

### 1. GitHubリポジトリの準備

```bash
# リポジトリが既にあることを確認
git remote -v

# 最新の変更をプッシュ
git push origin genspark_ai_developer

# mainブランチにマージ
git checkout main
git merge genspark_ai_developer
git push origin main
```

### 2. Vercelで自動デプロイ設定

1. Vercel Dashboard → 「Import Project」
2. GitHubリポジトリを選択
3. 上記の設定を入力
4. 以降、mainブランチへのプッシュで自動デプロイ

---

## 📋 環境変数一覧

### フロントエンド (.env)
```
VITE_API_URL=https://your-backend-url/api
```

### バックエンド
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-here
DATABASE_PATH=./database.db
```

---

## 🗄️ データベース移行（本番環境用）

SQLiteは開発用です。本番環境では以下のいずれかを推奨：

### PostgreSQL（Supabase）
1. https://supabase.com でプロジェクト作成
2. データベース接続情報を取得
3. `better-sqlite3` を `pg` に置き換え
4. スキーマを移行

### MySQL（PlanetScale）
1. https://planetscale.com でデータベース作成
2. 接続情報を取得
3. `better-sqlite3` を `mysql2` に置き換え
4. スキーマを移行

---

## 🧪 デプロイ後のテスト

### フロントエンド
- ログインページが表示されるか
- デモアカウントでログインできるか
- 各ページが正常に表示されるか

### バックエンド
- `https://your-api-url/health` がOKを返すか
- `https://your-api-url/` がAPI情報を返すか
- ログインAPIが動作するか

---

## 🔍 トラブルシューティング

### ビルドエラー
- `package.json` の依存関係を確認
- Node.jsバージョン（18.x以上推奨）
- `npm install` を実行して依存関係をインストール

### API接続エラー
- CORS設定を確認（バックエンド）
- 環境変数 `VITE_API_URL` が正しいか確認
- バックエンドが起動しているか確認

### データベースエラー
- SQLiteファイルのパスを確認
- 本番環境ではPostgreSQL/MySQLを使用

---

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## 🎯 クイックデプロイ（Vercel CLI）

```bash
# Vercel CLIをインストール（ローカル）
npm install -g vercel

# ログイン
vercel login

# プロジェクトルートでデプロイ
cd shift-management-app
vercel

# 本番デプロイ
vercel --prod
```

---

**推奨**: まずバックエンドをRender/Railwayにデプロイし、そのURLを使ってフロントエンドをVercelにデプロイしてください。
