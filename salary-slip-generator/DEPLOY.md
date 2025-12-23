# Vercelデプロイ手順

## 🚀 クイックデプロイ（推奨）

### 方法1: ワンクリックデプロイ

1. 以下のボタンをクリック

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg)

2. Vercelアカウントでログイン（GitHubアカウント連携推奨）

3. リポジトリ名を設定（デフォルト: `-kazunarihonda83-jpg`）

4. **「Deploy」** ボタンをクリック

5. 約1分でデプロイ完了！

6. 発行されたURLをクリックしてアクセス

### 方法2: GitHub連携で自動デプロイ

#### Step 1: Vercelアカウント作成

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで連携

#### Step 2: 新規プロジェクト作成

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」から該当リポジトリを選択
3. リポジトリ: `kazunarihonda83-jpg/-kazunarihonda83-jpg`

#### Step 3: プロジェクト設定

**Root Directory:**
```
salary-slip-generator
```

**Framework Preset:**
```
Other
```

**Build Settings:**
- Build Command: (空欄でOK)
- Output Directory: (空欄でOK)
- Install Command: (空欄でOK)

#### Step 4: デプロイ

1. 「Deploy」ボタンをクリック
2. ビルド完了を待つ（約30秒〜1分）
3. 完了後、URLが表示されます

例: `https://your-project.vercel.app`

## 📦 デプロイされる内容

デプロイされるファイル:
- ✅ `index.html` - メインアプリケーション（6ヶ月対応）
- ✅ `login.html` - ログイン画面（現在は静的）
- ✅ その他のHTMLファイル

## 🔧 動作モード

### 静的モード（Vercel標準）

- ✅ すべての基本機能が利用可能
- ✅ 30種類のフォーマット選択
- ✅ 16色のカラーテーマ
- ✅ 6ヶ月分のデータ入力
- ✅ PDF出力
- ✅ localStorageによるデータ保存
- ❌ サーバー側データベース保存（未実装）
- ❌ ユーザーログイン機能（未実装）

## 🌐 カスタムドメイン設定（オプション）

### Step 1: ドメイン追加

1. Vercelプロジェクトの「Settings」→「Domains」
2. 所有しているドメインを入力
3. 表示されるDNS設定をドメインレジストラで設定

### Step 2: SSL証明書（自動）

- Vercelが自動的にSSL証明書を発行
- HTTPSが自動的に有効化

## 🔄 自動デプロイ設定

GitHub連携により、以下のタイミングで自動デプロイ:

- ✅ `main`ブランチへのpush
- ✅ プルリクエストのマージ
- ✅ 手動トリガー

## 📊 デプロイ後の確認事項

### ✅ チェックリスト

1. **アクセス確認**
   - デプロイURLにアクセス
   - メインページが正常に表示されるか

2. **機能確認**
   - フォーマット選択が動作するか
   - カラーテーマ変更が動作するか
   - データ入力が可能か
   - プレビューが表示されるか
   - PDF出力が可能か

3. **データ保存確認**
   - localStorage保存が動作するか
   - ページリロード後もデータが残っているか

4. **レスポンシブ確認**
   - PCでの表示
   - タブレットでの表示
   - スマートフォンでの表示

## 🐛 トラブルシューティング

### デプロイが失敗する場合

**原因1: Root Directoryの設定ミス**
```
解決策: Root Directoryを "salary-slip-generator" に設定
```

**原因2: ビルドコマンドエラー**
```
解決策: Build Commandを空欄にする（静的サイト）
```

### ページが表示されない場合

**原因: ルートパスの設定**
```
解決策: vercel.jsonでルートパスを確認
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" }
  ]
}
```

### localStorageが動作しない場合

**原因: ブラウザの設定**
```
解決策:
1. ブラウザのCookieとサイトデータを確認
2. プライベートモード/シークレットモードではlocalStorage制限あり
3. ブラウザのlocalStorageを有効化
```

## 🔐 今後の拡張（オプション）

### バックエンドAPI追加

将来的に以下を追加可能:

1. **Vercel Serverless Functions**
   - Python/Node.jsでAPI実装
   - `/api/*` エンドポイント

2. **データベース連携**
   - Vercel Postgres
   - Supabase（無料）
   - MongoDB Atlas（無料）
   - PlanetScale（無料）

3. **認証機能**
   - Auth0
   - Firebase Auth
   - NextAuth.js

## 📞 サポート

問題が発生した場合:

1. [GitHubリポジトリ](https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg)でIssueを作成
2. Vercelの[ドキュメント](https://vercel.com/docs)を参照
3. [Vercel Discord](https://discord.gg/vercel)でコミュニティに質問

## 🎉 完了！

デプロイが完了したら、発行されたURLを共有して使い始めましょう！

**例:**
```
https://your-salary-slip-generator.vercel.app
```

---

**作成者**: kazunarihonda83-jpg  
**バージョン**: 3.0  
**最終更新**: 2024年12月
