# 顧客管理ツール (Customer Management Tool)

Node.js + Express + React を使用したシンプルな顧客管理アプリケーションです。

## 機能

- **顧客一覧表示**: すべての顧客情報を表示
- **新規顧客追加**: 名前、メールアドレス、電話番号、会社名の入力
- **顧客情報編集**: 既存の顧客情報を更新
- **顧客削除**: 顧客情報を削除

## プロジェクト構成

```
customer-management-tool/
├── server/                 # Express バックエンド
│   ├── package.json
│   └── server.js
├── client/                 # React フロントエンド
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── App.js
│   │   ├── App.css
│   │   └── services/
│   │       └── CustomerService.js
│   └── package.json
└── README.md
```

## セットアップ

### 必要な環境
- Node.js 14 以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
cd customer-management-tool
```

2. サーバーの依存パッケージをインストール
```bash
cd server
npm install
cd ..
```

3. クライアントの依存パッケージをインストール
```bash
cd client
npm install
cd ..
```

## 実行

### サーバーを起動
```bash
cd server
npm start
```

サーバーは `http://localhost:5000` で起動します。

### クライアント（別のターミナル）を起動
```bash
cd client
npm start
```

クライアントは `http://localhost:3000` で起動します。

## API エンドポイント

### GET /api/customers
すべての顧客を取得します。

**レスポンス例:**
```json
[
  {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "phone": "090-1234-5678",
    "company": "ABC会社"
  }
]
```

### GET /api/customers/:id
特定の顧客を取得します。

### POST /api/customers
新しい顧客を追加します。

**リクエスト例:**
```json
{
  "name": "新規顧客",
  "email": "new@example.com",
  "phone": "090-9999-9999",
  "company": "新規会社"
}
```

### PUT /api/customers/:id
顧客情報を更新します。

### DELETE /api/customers/:id
顧客を削除します。

## 技術スタック

- **バックエンド**: Node.js, Express.js
- **フロントエンド**: React, Axios
- **データベース**: インメモリ（セッション中のみ保持）

## ライセンス

ISC

## 作者

Claude Code
