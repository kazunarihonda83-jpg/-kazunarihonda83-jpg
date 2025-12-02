# 🚀 Vercel デプロイ手順（完全版）

## ✅ 準備完了済み

以下の設定はすべて完了しています：
- ✅ `vercel.json` - Vercel設定ファイル
- ✅ `package.json` - ルートのビルド設定
- ✅ `.vercelignore` - 不要ファイルの除外
- ✅ ビルドテスト完了

---

## 📋 Vercel Web UIでのデプロイ手順（5分で完了）

### ステップ 1: Vercelにログイン

1. ブラウザで https://vercel.com にアクセス
2. **GitHub アカウントでログイン**

### ステップ 2: プロジェクトをインポート

1. ダッシュボードで **「Add New...」** → **「Project」** をクリック
2. **「Import Git Repository」** をクリック
3. リポジトリ一覧から **`kazunarihonda83-jpg/-kazunarihonda83-jpg`** を探す
4. 見つからない場合は **「Adjust GitHub App Permissions」** をクリックしてリポジトリへのアクセスを許可
5. **「Import」** をクリック

### ステップ 3: プロジェクト設定

以下の設定を確認・入力してください：

```
Project Name: shift-management-app
（好きな名前に変更可能）

Framework Preset: Other
（自動検出される場合もあります）

Root Directory: ./
（デフォルトのまま、変更しない）

Build and Output Settings:
  ✅ Override がONになっていることを確認

  Build Command: npm run build
  Output Directory: shift-management-app/dist
  Install Command: npm run install

Environment Variables:
  VITE_API_URL = https://3000-iqf0dj1wke1cog78fnr4y-cc2fbc16.sandbox.novita.ai
  （まずは開発環境のバックエンドURLを使用。後でRender.comに変更）
```

### ステップ 4: デプロイ実行

1. すべての設定を確認
2. **「Deploy」** ボタンをクリック
3. デプロイが開始されます（通常2-3分）

### ステップ 5: デプロイ完了

デプロイが完了すると：
- ✅ Vercel URLが発行されます（例: `https://shift-management-app.vercel.app`）
- ✅ 自動的にHTTPSが有効化されます
- ✅ 以降、GitHubにpushするたびに自動デプロイされます

---

## 🔧 デプロイ後の確認

### 1. フロントエンドの動作確認

1. Vercelから発行されたURLにアクセス
2. ログイン画面が表示されることを確認
3. テストアカウントでログイン:
   - Email: `admin@test.com`
   - Password: `password123`

### 2. バックエンド接続の確認

現在は開発環境のバックエンドに接続しています：
```
https://3000-iqf0dj1wke1cog78fnr4y-cc2fbc16.sandbox.novita.ai
```

**注意**: この開発環境は一時的なものです。本番環境では次のステップでRender.comにバックエンドをデプロイする必要があります。

---

## ⚙️ バックエンドのデプロイ（Render.com）

### ステップ 1: Renderにログイン

1. https://render.com にアクセス
2. **GitHub アカウントでログイン**

### ステップ 2: Web Serviceを作成

1. ダッシュボードで **「New +」** → **「Web Service」** をクリック
2. **「Connect a repository」** セクションで:
   - リポジトリ一覧から **`kazunarihonda83-jpg/-kazunarihonda83-jpg`** を選択
   - **「Connect」** をクリック

### ステップ 3: サービス設定

以下の設定を入力してください：

```
Name: shift-management-api
（好きな名前に変更可能）

Region: Singapore (推奨)
（日本に最も近いリージョン）

Branch: genspark_ai_developer
（またはmain）

Root Directory: shift-management-app
（重要！必ず指定）

Runtime: Node

Build Command: npm install

Start Command: node server/app.js

Instance Type: Free
（無料プランでOK、後でアップグレード可能）
```

### ステップ 4: 環境変数を設定

**「Environment」** タブで以下を追加：

```
NODE_ENV = production
PORT = 3000
CORS_ORIGIN = https://あなたのvercelドメイン.vercel.app
```

**重要**: `CORS_ORIGIN` には先ほどVercelで発行されたURLを入力してください。

### ステップ 5: デプロイ実行

1. **「Create Web Service」** をクリック
2. デプロイが開始されます（初回は5-10分かかる場合があります）
3. ログを確認して「Shift Management API Server Started」が表示されることを確認

### ステップ 6: バックエンドURLを取得

デプロイ完了後、Renderから以下のようなURLが発行されます：
```
https://shift-management-api.onrender.com
```

---

## 🔗 フロントエンドとバックエンドを接続

### ステップ 1: Vercelの環境変数を更新

1. Vercel ダッシュボードに戻る
2. プロジェクトを選択
3. **「Settings」** タブ → **「Environment Variables」** を開く
4. `VITE_API_URL` を編集:
   ```
   古い値: https://3000-iqf0dj1wke1cog78fnr4y-cc2fbc16.sandbox.novita.ai
   新しい値: https://shift-management-api.onrender.com
   ```
5. **「Save」** をクリック

### ステップ 2: 再デプロイ

1. **「Deployments」** タブを開く
2. 最新のデプロイの右側にある **「...」** をクリック
3. **「Redeploy」** を選択
4. 数分待つ

### ステップ 3: 動作確認

1. Vercel URLにアクセス
2. ログイン → ダッシュボードが正常に表示されることを確認
3. すべての機能（シフト管理、勤怠管理など）が動作することを確認

---

## 🎯 トラブルシューティング

### Q1: ビルドが失敗する

**解決方法**:
1. Vercelの「Deployments」タブでエラーログを確認
2. Build Command が `npm run build` であることを確認
3. Output Directory が `shift-management-app/dist` であることを確認

### Q2: ページが真っ白

**解決方法**:
1. ブラウザの開発者ツール（F12）でコンソールエラーを確認
2. `VITE_API_URL` が正しく設定されているか確認
3. バックエンドが正常に動作しているか確認（RenderのURLに直接アクセス）

### Q3: ログインできない

**解決方法**:
1. バックエンドのCORS設定を確認
2. Renderの環境変数 `CORS_ORIGIN` がVercelのURLと一致しているか確認
3. Renderのログで「CORS error」が出ていないか確認

### Q4: データが表示されない

**解決方法**:
1. Renderのログを確認
2. データベースが正しく初期化されているか確認
3. 「Database already has data. Skipping seed.」が表示されているか確認

### Q5: Render Freeプランの制限

**注意事項**:
- Freeプランは15分間アクセスがないとスリープします
- 初回アクセス時に30秒ほど起動時間がかかります
- 本番運用では有料プラン（月$7～）を推奨します

---

## 📚 さらなる改善

### 1. カスタムドメインの設定

Vercelで独自ドメインを設定できます：
1. Vercel「Settings」→「Domains」
2. ドメインを追加してDNS設定を行う

### 2. データベースの移行（推奨）

本番環境ではPostgreSQLへの移行を推奨します：
- Render.comで無料のPostgreSQLを作成可能
- より安定したデータ永続化が可能

### 3. 環境別の設定

開発環境、ステージング環境、本番環境を分けて管理できます：
- Vercel: ブランチごとに自動デプロイ
- Render: 環境変数で切り替え

---

## ✅ チェックリスト

デプロイ完了前に以下を確認してください：

- [ ] Vercelでフロントエンドがデプロイされている
- [ ] Renderでバックエンドがデプロイされている
- [ ] 環境変数 `VITE_API_URL` が正しく設定されている
- [ ] 環境変数 `CORS_ORIGIN` が正しく設定されている
- [ ] ログイン画面が表示される
- [ ] ログインできる
- [ ] ダッシュボードが表示される
- [ ] シフト管理機能が動作する
- [ ] 勤怠管理機能が動作する
- [ ] 評価管理機能が動作する

すべてチェックできたら、デプロイ完了です！🎉

---

## 🆘 サポートが必要な場合

問題が発生した場合は、以下の情報を共有してください：
1. Vercelのデプロイログ（エラーが出ている場合）
2. Renderのログ（エラーが出ている場合）
3. ブラウザのコンソールエラー（F12で開く）
4. 具体的なエラーメッセージ

私が詳しく調査してサポートします！
