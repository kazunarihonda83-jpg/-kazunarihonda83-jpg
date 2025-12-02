# Vercelデプロイ手順書

## 📋 事前準備

### 1. Vercelアカウントの作成
- https://vercel.com にアクセス
- 「Sign Up」をクリック
- GitHubアカウントでログイン（推奨）

### 2. GitHubリポジトリの確認
このプロジェクトは以下のGitHubリポジトリにあります：
- **リポジトリURL**: https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg
- **ブランチ**: main
- **プロジェクトフォルダ**: `business-plan-generator`

## 🚀 デプロイ方法

### 方法1: Vercel Dashboard（推奨）

#### Step 1: 新規プロジェクトのインポート
1. https://vercel.com/dashboard にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを接続（初回のみ）
   - 「Import Git Repository」
   - GitHubを選択
   - リポジトリへのアクセスを許可

#### Step 2: リポジトリの選択
1. リポジトリ一覧から `-kazunarihonda83-jpg` を検索
2. 「Import」ボタンをクリック

#### Step 3: プロジェクト設定
以下の設定を入力：

```
Framework Preset: Vite
Root Directory: business-plan-generator
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**重要な設定項目**:
- ✅ **Root Directory**: `business-plan-generator` （必須）
- ✅ **Framework**: Vite を選択
- ✅ **Output Directory**: `dist`

#### Step 4: 環境変数（オプション）
現在のプロジェクトでは環境変数は不要です。

#### Step 5: デプロイ実行
1. 「Deploy」ボタンをクリック
2. ビルドログを確認（約2-3分）
3. デプロイ完了後、URLが表示されます

### 方法2: Vercel CLI

#### インストール
```bash
npm install -g vercel
```

#### ログイン
```bash
vercel login
```

#### デプロイ実行
```bash
cd business-plan-generator
vercel
```

プロンプトに従って設定：
- Set up and deploy: `Y`
- Which scope: 自分のアカウントを選択
- Link to existing project: `N`
- What's your project's name: `business-plan-generator`
- In which directory is your code located: `./`
- Want to override the settings: `N`

#### 本番デプロイ
```bash
vercel --prod
```

## 📝 デプロイ後の設定

### カスタムドメインの設定（オプション）
1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Domains」をクリック
3. カスタムドメインを追加

### 自動デプロイの設定
以下の設定が自動的に有効になります：
- ✅ `main` ブランチへのpush → 本番環境へ自動デプロイ
- ✅ Pull Requestの作成 → プレビュー環境を自動生成

## 🔍 デプロイの確認

### ビルドログの確認
1. Vercelダッシュボードでプロジェクトを開く
2. 「Deployments」タブをクリック
3. 最新のデプロイをクリック
4. 「Building」→「Build Logs」を確認

### 動作確認
デプロイされたURLにアクセスして以下を確認：
- ✅ ログイン画面が表示される
- ✅ デモアカウント情報が表示される
- ✅ admin/admin123 でログインできる
- ✅ 経費プランナーが正常に動作する
- ✅ PDF出力機能が動作する
- ✅ 下書き保存機能が動作する

## ⚠️ トラブルシューティング

### 問題1: ビルドエラー
**エラー**: `Build failed`

**解決方法**:
1. ローカルで `npm run build` を実行して確認
2. package.json の依存関係を確認
3. Node.jsバージョンを確認（推奨: 18.x以上）

### 問題2: 404エラー
**エラー**: ページ遷移で404が表示される

**解決方法**:
- `vercel.json` の rewrites 設定を確認
- すでに設定済みのため、通常は発生しません

### 問題3: Root Directory エラー
**エラー**: `No package.json found`

**解決方法**:
1. Vercelダッシュボードで「Settings」→「General」
2. 「Root Directory」を `business-plan-generator` に設定
3. 「Save」をクリック

### 問題4: LocalStorage が動作しない
**原因**: HTTPSでは正常に動作します

**確認方法**:
- Vercelは自動的にHTTPSを提供するため問題なし

## 📊 プロジェクト情報

- **Framework**: React 19 + Vite 7
- **Language**: TypeScript
- **Build Tool**: Vite
- **Output**: Static Site (SPA)
- **Node Version**: 18.x以上推奨

## 🔗 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Viteデプロイガイド](https://vitejs.dev/guide/static-deploy.html)
- [プロジェクトリポジトリ](https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg)

## 📞 サポート

問題が発生した場合：
1. ビルドログを確認
2. GitHub Issuesで報告
3. Vercel サポートに問い合わせ

---

**最終更新**: 2024年12月2日
**バージョン**: 1.0.0
