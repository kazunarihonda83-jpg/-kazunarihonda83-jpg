# 🚀 RestaurantTranslate - デプロイメントガイド

## 📦 プロジェクト構成

このプロジェクトは、**ユーザー向けアプリ**と**管理者向けアプリ**の2つに分離されています。

```
/home/user/webapp/
├── restaurant-menu-viewer/      # 👥 ユーザー向けアプリ（ポート3001）
├── restaurant-admin-panel/      # 🎛️ 管理者向けアプリ（ポート3002）
└── restaurant-translate/        # 📦 統合版（参考用）
```

## 🎯 アプリケーション概要

### 👥 ユーザー向けアプリ（restaurant-menu-viewer）

**目的**: 顧客がQRコードスキャンでアクセスするメニュー閲覧専用アプリ

**主な機能**:
- 🌍 8ヶ国語対応の多言語メニュー表示
- 🔊 音声読み上げ機能
- 🖼️ 写真付きビジュアルメニュー
- 🚫 アレルギー・食事制限情報表示
- 📱 モバイルファースト設計

**技術スタック**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Web Speech API

**ポート**: 3001

### 🎛️ 管理者向けアプリ（restaurant-admin-panel）

**目的**: レストラン管理者がメニュー管理・QRコード生成・分析を行う専用アプリ

**主な機能**:
- 📊 ダッシュボード（統計サマリー）
- 📱 QRコード生成・ダウンロード・印刷
- 🍽️ メニュー管理（CRUD操作）
- 📈 アクセス分析
- ⚙️ 設定・データ管理

**技術スタック**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- qrcode.react

**ポート**: 3002

## 🌐 現在のデプロイURL

### ✅ 本番環境（Sandbox）

**ユーザー向けアプリ**:
- URL: https://3001-im8wlpwehyh3f0rsaxz0b-c07dda5e.sandbox.novita.ai
- 用途: 顧客がQRコードスキャンでアクセス

**管理者向けアプリ**:
- URL: https://3002-im8wlpwehyh3f0rsaxz0b-c07dda5e.sandbox.novita.ai
- 用途: レストラン管理者が管理画面にアクセス

## 🚀 ローカル開発環境のセットアップ

### ユーザー向けアプリの起動

```bash
# プロジェクトディレクトリに移動
cd /home/user/webapp/restaurant-menu-viewer

# 依存関係のインストール（初回のみ）
npm install

# 開発サーバーの起動
npm run dev
```

アクセス: http://localhost:3001

### 管理者向けアプリの起動

```bash
# プロジェクトディレクトリに移動
cd /home/user/webapp/restaurant-admin-panel

# 依存関係のインストール（初回のみ）
npm install

# 開発サーバーの起動
npm run dev
```

アクセス: http://localhost:3002

### 両方同時に起動する場合

```bash
# ターミナル1: ユーザー向けアプリ
cd /home/user/webapp/restaurant-menu-viewer && npm run dev

# ターミナル2: 管理者向けアプリ
cd /home/user/webapp/restaurant-admin-panel && npm run dev
```

## 📦 本番環境へのデプロイ

### Vercelへのデプロイ（推奨）

#### ユーザー向けアプリ

```bash
cd /home/user/webapp/restaurant-menu-viewer

# Vercel CLIのインストール（初回のみ）
npm install -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

#### 管理者向けアプリ

```bash
cd /home/user/webapp/restaurant-admin-panel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

### Netlifyへのデプロイ

#### ユーザー向けアプリ

```bash
cd /home/user/webapp/restaurant-menu-viewer
npm run build

# Netlify CLIでデプロイ
netlify deploy --prod --dir=.next
```

#### 管理者向けアプリ

```bash
cd /home/user/webapp/restaurant-admin-panel
npm run build

# Netlify CLIでデプロイ
netlify deploy --prod --dir=.next
```

### Dockerでのデプロイ

#### Dockerfile（ユーザー向けアプリ）

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### Dockerfile（管理者向けアプリ）

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]
```

#### docker-compose.yml（両方）

```yaml
version: '3.8'

services:
  menu-viewer:
    build: ./restaurant-menu-viewer
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  admin-panel:
    build: ./restaurant-admin-panel
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

起動:
```bash
docker-compose up -d
```

## 🔧 環境変数の設定

### ユーザー向けアプリ（.env.local）

```env
# Next.js環境変数
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_ADMIN_URL=https://your-admin-domain.com

# アナリティクス（オプション）
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 管理者向けアプリ（.env.local）

```env
# Next.js環境変数
NEXT_PUBLIC_VIEWER_URL=https://your-viewer-domain.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# 認証（将来実装）
AUTH_SECRET=your-secret-key
```

## 📝 QRコードの設定

### ユーザー向けアプリURLの設定

管理者向けアプリでQRコードを生成する際、ユーザー向けアプリのURLを指定する必要があります。

1. 管理者向けアプリにアクセス
2. ダッシュボードで「QRコード生成」をクリック
3. 自動的にユーザー向けアプリのURL（ポート3001）が設定される
4. QRコードをダウンロードまたは印刷
5. テーブルに設置

**本番環境の場合**:
```javascript
// 管理者向けアプリ内で設定
const menuUrl = 'https://your-menu-domain.com';
```

## 🔒 セキュリティ設定

### CORS設定

ユーザー向けアプリと管理者向けアプリが異なるドメインにデプロイされている場合、CORS設定が必要です。

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-admin-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
};
```

### 管理者向けアプリの認証（将来実装）

現在は認証なしですが、本番環境では以下のような認証システムの実装を推奨します：

- Basic認証
- NextAuth.js
- Auth0
- Firebase Authentication

## 📊 モニタリングとログ

### Vercelでのモニタリング

Vercelダッシュボードで以下を確認：
- デプロイ状況
- アクセスログ
- エラーログ
- パフォーマンスメトリクス

### カスタムログ設定

```javascript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
    // 本番環境では外部ログサービスに送信
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // 本番環境ではSentryなどに送信
  },
};
```

## 🔄 アップデート手順

### 1. ユーザー向けアプリの更新

```bash
cd /home/user/webapp/restaurant-menu-viewer

# 変更をコミット
git add .
git commit -m "feat: Update menu viewer"

# デプロイ
vercel --prod
```

### 2. 管理者向けアプリの更新

```bash
cd /home/user/webapp/restaurant-admin-panel

# 変更をコミット
git add .
git commit -m "feat: Update admin panel"

# デプロイ
vercel --prod
```

## 🧪 テスト

### ビルドテスト

```bash
# ユーザー向けアプリ
cd /home/user/webapp/restaurant-menu-viewer && npm run build

# 管理者向けアプリ
cd /home/user/webapp/restaurant-admin-panel && npm run build
```

### 本番環境での動作確認

1. ユーザー向けアプリにアクセス
2. 言語切り替えが正常に動作するか確認
3. 音声読み上げが動作するか確認
4. QRコードスキャンテスト

5. 管理者向けアプリにアクセス
6. QRコード生成が正常に動作するか確認
7. ダウンロード・印刷機能を確認

## 📞 トラブルシューティング

### ポート衝突エラー

```bash
# ポート3001が既に使用されている場合
lsof -ti:3001 | xargs kill -9

# ポート3002が既に使用されている場合
lsof -ti:3002 | xargs kill -9
```

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### QRコードが表示されない

- ブラウザのJavaScriptが有効か確認
- コンソールエラーを確認
- qrcode.reactのバージョンを確認

## 📈 パフォーマンス最適化

### 画像最適化

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### キャッシュ戦略

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

## 🎉 まとめ

このガイドに従って、ユーザー向けアプリと管理者向けアプリを別々にデプロイすることで、以下のメリットがあります：

✅ **セキュリティ**: 管理画面を別ドメインで保護
✅ **スケーラビリティ**: 各アプリを独立してスケール
✅ **パフォーマンス**: 顧客向けアプリを軽量化
✅ **メンテナンス**: 独立した更新とデプロイ

---

**RestaurantTranslate** - 成功するインバウンド対応レストラン運営を 🌍🍽️
