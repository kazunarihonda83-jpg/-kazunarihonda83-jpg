# Vercelデプロイ完全ガイド

## 🎯 現在の状況

- ✅ GitHubリポジトリ: https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg
- ✅ プロジェクトディレクトリ: `salary-slip-generator/`
- ✅ 全ファイルがpush済み
- ❌ Vercelへのデプロイ: 未完了（これが404エラーの原因）

## 🚀 Vercelデプロイ方法

### 方法A: ワンクリックデプロイ（最も簡単）

1. 以下のURLをブラウザで開く:
   ```
   https://vercel.com/new/clone?repository-url=https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg&project-name=salary-slip-generator&repository-name=salary-slip-generator
   ```

2. Vercelアカウントにログイン（GitHubでログイン推奨）

3. プロジェクト設定:
   - **Root Directory**: `salary-slip-generator` と入力
   - **Framework Preset**: `Other` を選択
   - **Build Command**: 空欄のまま
   - **Output Directory**: `.` (ドット一つ)

4. 「Deploy」ボタンをクリック

5. デプロイ完了後、表示されるURLにアクセス
   例: `https://salary-slip-generator.vercel.app`

### 方法B: Vercel Dashboard から手動デプロイ

1. https://vercel.com にアクセスしてログイン

2. 「Add New...」→「Project」をクリック

3. 「Import Git Repository」から
   `kazunarihonda83-jpg/-kazunarihonda83-jpg` を選択

4. プロジェクト設定:
   - **Project Name**: `salary-slip-generator`
   - **Root Directory**: `salary-slip-generator` （「Edit」をクリックして設定）
   - **Framework Preset**: `Other`
   - **Build Command**: 空欄
   - **Output Directory**: `.`

5. 「Deploy」をクリック

## 📋 デプロイ後の確認事項

デプロイが完了したら、以下を確認してください：

1. **トップページ（`index.html`）が表示される**
   - 30種類のフォーマット選択
   - 16色のカラーテーマ選択
   - 6ヶ月分の入力フォーム

2. **ログインページ（`login.html`）にアクセスできる**
   - URL: `https://あなたのサイト.vercel.app/login.html`
   - ただし、サーバーレス機能は未実装のため、ゲストモードで使用

3. **PDF出力が正常に動作する**
   - ブラウザの印刷機能でA4横向きPDFが生成される

## ⚠️ 重要な注意事項

### 現在の実装状況

✅ **実装済み機能:**
- 30種類の給与明細フォーマット（うち10種類が完全実装）
- 16色のカラーテーマ
- 6ヶ月分のデータ入力
- リアルタイムプレビュー
- LocalStorageによるデータ保存
- A4横向きPDF出力
- 3桁カンマ区切り
- 全控除項目の表示

❌ **未実装機能（サーバー側が必要）:**
- ユーザー登録・ログイン機能
- サーバー側データベースへの保存
- 複数ユーザー間でのデータ共有

### データ保存について

現在のバージョンでは、以下の方法でデータが保存されます：

1. **ブラウザのLocalStorage**
   - 同じブラウザ・同じデバイスでのみアクセス可能
   - ブラウザのキャッシュクリアでデータが消える可能性あり

2. **PDF出力**
   - データを永続的に保存したい場合は、PDF出力を推奨
   - 印刷またはPDF保存でデータを保管

## 🔄 今後の拡張

サーバー側機能を追加する場合は、以下のオプションがあります：

1. **Vercel Serverless Functions + Vercel KV**
   - Vercelの無料枠でデータベース機能を追加

2. **Supabase連携**
   - 無料のPostgreSQLデータベース
   - ユーザー認証機能

3. **Firebase連携**
   - Firestoreでデータ保存
   - Firebase Authenticationで認証

## 📞 サポート

デプロイで問題が発生した場合は、以下を確認してください：

1. GitHubリポジトリが公開（Public）になっているか
2. Vercelアカウントが正しく連携されているか
3. Root Directoryが正しく設定されているか（`salary-slip-generator`）

---

📅 作成日: 2025-12-23
🔗 GitHubリポジトリ: https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg
📂 プロジェクトディレクトリ: salary-slip-generator/
