# Vercelデプロイ手順

## 現在の問題
Vercelの自動デプロイが機能していません。GitHubにプッシュしても自動的にデプロイされません。

## 手動デプロイ手順（必須）

### 1. Vercel Dashboardにアクセス
https://vercel.com/hozyopanda/kyuuyomeisai

### 2. 「Settings」タブをクリック

### 3. 左メニューから「Git」を選択

### 4. 「Connected Git Repository」セクションを確認
- リポジトリ: `kazunarihonda83-jpg/-kazunarihonda83-jpg`
- ブランチ: `main`

### 5. 「Deploymentsタブに移動

### 6. 最新のデプロイを探す

### 7. 「...」メニューをクリック → 「Redeploy」を選択

### 8. 確認ダイアログで「Redeploy」をクリック

### 9. 約1～2分待つ

### 10. https://kyuuyomeisai.vercel.app にアクセスして確認

---

## 自動デプロイを有効にする方法

### GitHubのWebhook設定を確認
1. https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg/settings/hooks
2. Vercel Webhookが存在するか確認
3. なければVercelとGitHubを再接続

---

## 現在の最新版の特徴

✅ **LocalStorageベースのユーザー別ログイン機能**
- ユーザー名入力でログイン
- ユーザーごとにデータ分離
- ログアウト機能
- データ保存・読み込み・削除・編集・複製

✅ **実装済み機能**
- 30種類の給与明細フォーマット
- 16色のカラーテーマ
- 6ヶ月分のデータ入力
- ユーザー別データ管理
- リアルタイムプレビュー
- A4横向きPDF出力

---

## トラブルシューティング

### 問題: デプロイしても古いバージョンが表示される
**解決策**: ブラウザのキャッシュをクリア
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- または、シークレットモードで開く

### 問題: 「ゲストモード」と表示される
**原因**: Vercelに古いバージョンがデプロイされている
**解決策**: 上記の手動デプロイ手順を実行
