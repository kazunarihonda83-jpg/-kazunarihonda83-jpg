# 🚀 レストランメニューシステム - 本番デプロイ手順

## 📋 目次
1. [Vercelでのデプロイ（推奨・無料）](#vercelでのデプロイ推奨無料)
2. [Netlifyでのデプロイ](#netlifyでのデプロイ)
3. [自社サーバーでのデプロイ](#自社サーバーでのデプロイ)
4. [カスタムドメイン設定](#カスタムドメイン設定)
5. [環境変数の設定](#環境変数の設定)
6. [トラブルシューティング](#トラブルシューティング)

---

## Vercelでのデプロイ（推奨・無料）

### 🎯 Vercelの特徴
- ✅ **完全無料**（個人利用・商用利用OK）
- ✅ **超簡単**（3ステップで完了）
- ✅ **Next.js最適化**（開発元が提供）
- ✅ **自動SSL**（HTTPS対応）
- ✅ **自動デプロイ**（Git Push → 自動更新）
- ✅ **高速CDN**（世界中で高速アクセス）
- ✅ **日本リージョン対応**（東京サーバー）

---

### 📝 デプロイ手順（所要時間: 5分）

#### Step 1: Vercelアカウント作成

1. **Vercel公式サイトにアクセス**
   ```
   https://vercel.com
   ```

2. **「Sign Up」をクリック**

3. **GitHubアカウントで登録**
   - 「Continue with GitHub」を選択
   - GitHubにログイン
   - Vercelアプリを承認

#### Step 2: リポジトリをインポート

1. **Vercelダッシュボードを開く**
   - ログイン後、自動的にダッシュボードに移動

2. **「Add New...」→「Project」をクリック**

3. **GitHubリポジトリを選択**
   - 「Import Git Repository」セクション
   - `kazunarihonda83-jpg/-kazunarihonda83-jpg` を検索
   - 「Import」をクリック

4. **プロジェクト設定**
   
   **Configure Project画面で以下を設定:**
   
   ```
   Project Name: restaurant-menu-viewer
   Framework Preset: Next.js
   Root Directory: restaurant-menu-viewer
   ```
   
   **Build and Output Settings（自動検出されるのでそのまま）:**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Development Command: npm run dev
   ```
   
   **Environment Variables:**
   ```
   今回は環境変数不要（スキップ可）
   ```

5. **ブランチを選択**
   - `genspark_ai_developer` を選択
   - または `main` ブランチを選択

6. **「Deploy」ボタンをクリック**
   - ビルドが開始されます
   - 進捗状況がリアルタイムで表示されます
   - 完了まで約2-3分

#### Step 3: デプロイ完了！

✅ **ビルドが完了すると、以下の画面が表示されます:**

```
🎉 Congratulations!

Your project has been successfully deployed.

URL: https://restaurant-menu-viewer-xxx.vercel.app
```

**この URLが本番環境です！**

---

### 🌐 デプロイ後のURL

#### 自動生成されるURL
```
本番環境: https://restaurant-menu-viewer-xxx.vercel.app
管理画面: https://restaurant-menu-viewer-xxx.vercel.app/admin/menu
```

#### プレビューURL（プルリクエスト用）
各プルリクエストごとに自動生成:
```
https://restaurant-menu-viewer-xxx-git-branch-name.vercel.app
```

---

### 🔄 自動デプロイ設定

**Vercelは自動的に以下を監視します:**

#### 1. mainブランチへのPush → 本番環境更新
```bash
git checkout main
git merge genspark_ai_developer
git push origin main
```
→ **自動的に本番環境がデプロイされます**

#### 2. その他ブランチへのPush → プレビュー環境作成
```bash
git checkout feature/new-menu
git push origin feature/new-menu
```
→ **自動的にプレビューURLが作成されます**

#### 3. プルリクエスト → 自動プレビュー
- PRを作成すると自動でプレビュー環境
- コメントにプレビューURLが自動投稿
- 本番に影響なくテスト可能

---

### 🎨 カスタムドメインの設定

独自ドメイン（例: `menu.your-restaurant.com`）を使う場合:

#### 方法1: Vercelでドメイン購入（最も簡単）

1. **Vercelダッシュボード → プロジェクトを選択**
2. **「Settings」→「Domains」**
3. **「Buy」ボタンをクリック**
4. **希望のドメイン名を入力**
   - 例: `sakura-restaurant.com`
   - 料金: 約$15/年
5. **購入完了 → 自動設定**
   - DNS設定は自動
   - SSL証明書も自動

#### 方法2: 既存ドメインを使用

**お名前.comやムームードメイン等で購入済みの場合:**

1. **Vercelダッシュボードでドメインを追加**
   - 「Settings」→「Domains」
   - 「Add Domain」をクリック
   - ドメイン名を入力: `menu.your-restaurant.com`

2. **DNS設定をコピー**
   Vercelが以下のDNS設定を表示:
   ```
   Type: CNAME
   Name: menu
   Value: cname.vercel-dns.com
   ```

3. **ドメイン管理画面でDNS設定**
   - お名前.comやムームードメインにログイン
   - DNS設定画面を開く
   - CNAMEレコードを追加:
     ```
     ホスト名: menu
     TYPE: CNAME
     VALUE: cname.vercel-dns.com
     ```

4. **DNS反映を待つ**
   - 通常1-24時間で反映
   - Vercelが自動的にSSL証明書を発行

5. **完了！**
   - `https://menu.your-restaurant.com` でアクセス可能

---

### 📊 Vercel無料プランの制限

| 項目 | 無料プラン | 制限内容 |
|------|----------|---------|
| **デプロイ回数** | 無制限 | 制限なし |
| **帯域幅** | 100GB/月 | 十分な量 |
| **ビルド時間** | 6,000分/月 | 1日あたり200分 |
| **プロジェクト数** | 無制限 | 制限なし |
| **カスタムドメイン** | 無制限 | 制限なし |
| **チームメンバー** | 1人 | 有料プランで追加可能 |

**💡 一般的なレストランの使用では、無料プランで十分です！**

---

## Netlifyでのデプロイ

Vercelの代替として、Netlifyも優秀です。

### 手順（簡略版）

1. **Netlifyアカウント作成**
   ```
   https://netlify.com
   ```

2. **「New site from Git」をクリック**

3. **GitHubを選択してリポジトリをインポート**

4. **ビルド設定**
   ```
   Base directory: restaurant-menu-viewer
   Build command: npm run build
   Publish directory: .next
   ```

5. **「Deploy site」をクリック**

---

## 自社サーバーでのデプロイ

### 前提条件
- Node.js 18.x以上
- PM2（プロセス管理）
- Nginx（リバースプロキシ）

### 手順

#### 1. サーバーにSSH接続

```bash
ssh user@your-server.com
```

#### 2. リポジトリをクローン

```bash
cd /var/www
git clone https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg.git
cd -kazunarihonda83-jpg
git checkout genspark_ai_developer
```

#### 3. 依存関係をインストール

```bash
cd restaurant-menu-viewer
npm install
```

#### 4. 本番用ビルド

```bash
npm run build
```

#### 5. PM2で起動

```bash
# PM2をグローバルインストール（初回のみ）
npm install -g pm2

# アプリを起動
pm2 start npm --name "restaurant-menu" -- start

# 自動起動設定
pm2 startup
pm2 save
```

#### 6. Nginx設定

`/etc/nginx/sites-available/restaurant-menu` ファイルを作成:

```nginx
server {
    listen 80;
    server_name menu.your-restaurant.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

シンボリックリンク作成とNginx再起動:

```bash
sudo ln -s /etc/nginx/sites-available/restaurant-menu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL証明書の設定（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d menu.your-restaurant.com
```

---

## 環境変数の設定

現在のシステムでは環境変数は不要ですが、将来的にAPIキー等が必要になった場合:

### Vercelの場合

1. **Vercelダッシュボード → プロジェクト**
2. **「Settings」→「Environment Variables」**
3. **変数を追加**
   ```
   Name: NEXT_PUBLIC_API_KEY
   Value: your-api-key-here
   ```

### 自社サーバーの場合

`.env.local` ファイルを作成:

```bash
# /var/www/-kazunarihonda83-jpg/restaurant-menu-viewer/.env.local
NEXT_PUBLIC_API_KEY=your-api-key-here
```

---

## トラブルシューティング

### ❌ ビルドエラー: "Module not found"

**原因:** 依存関係がインストールされていない

**解決策:**
```bash
cd restaurant-menu-viewer
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ "404 Not Found" エラー

**原因:** ルーティング設定の問題

**解決策:**
`next.config.js` に以下を追加:
```javascript
module.exports = {
  trailingSlash: true,
}
```

### ❌ 画像が表示されない

**原因:** 画像パスの問題

**解決策:**
- 画像はBase64エンコードで保存されているため問題なし
- それでも表示されない場合は、Next.js Imageコンポーネントを確認

### ❌ 管理画面にアクセスできない

**確認事項:**
- URLが正しいか: `https://your-domain.com/admin/menu`
- ルーティングファイルが存在するか: `src/app/admin/menu/page.tsx`

---

## 📱 デプロイ後の確認チェックリスト

デプロイ完了後、以下を確認してください:

### ✅ 顧客向けアプリ
- [ ] トップページが表示される
- [ ] 言語切替が動作する
- [ ] メニューカードが表示される
- [ ] 音声読み上げが動作する
- [ ] 辛さレベルが表示される
- [ ] ポーション量が表示される
- [ ] 多通貨換算が表示される
- [ ] 検索機能が動作する
- [ ] フィルター機能が動作する
- [ ] レスポンシブデザインが正常

### ✅ 管理画面
- [ ] `/admin/menu` にアクセスできる
- [ ] メニュー一覧が表示される
- [ ] 新規追加ができる
- [ ] 編集ができる
- [ ] 削除ができる
- [ ] 画像アップロードができる
- [ ] 各設定項目が保存される
- [ ] リアルタイム同期が動作する

---

## 🚀 デプロイ後のメンテナンス

### メニュー更新の流れ

1. **管理画面でメニューを編集**
2. **JSONエクスポートでバックアップ**（推奨）
3. **変更内容をGitにコミット**（オプション）

### 定期メンテナンス

**月次:**
- [ ] 依存関係のアップデート: `npm update`
- [ ] セキュリティ監査: `npm audit`
- [ ] バックアップの確認

**年次:**
- [ ] Next.jsのメジャーバージョンアップ
- [ ] ドメイン更新（独自ドメイン使用時）
- [ ] SSL証明書の更新（自動のはず）

---

## 💰 コスト比較

| 項目 | Vercel（無料） | Netlify（無料） | 自社サーバー |
|------|---------------|----------------|-------------|
| **初期費用** | ¥0 | ¥0 | ¥50,000~ |
| **月額費用** | ¥0 | ¥0 | ¥3,000~ |
| **ドメイン** | ¥1,500/年 | ¥1,500/年 | ¥1,500/年 |
| **SSL証明書** | 無料（自動） | 無料（自動） | 無料（Let's Encrypt） |
| **保守費用** | ¥0 | ¥0 | ¥10,000~/月 |
| **合計（年間）** | **¥1,500** | **¥1,500** | **¥170,000+** |

**💡 結論: Vercelが圧倒的にコスパ最強！**

---

## 📞 サポート・お問い合わせ

### Vercelのサポート
- ドキュメント: https://vercel.com/docs
- コミュニティ: https://github.com/vercel/next.js/discussions
- サポート: support@vercel.com

### 本システムのサポート
- GitHub Issues: https://github.com/kazunarihonda83-jpg/-kazunarihonda83-jpg/issues

---

## 🎉 デプロイ完了後

おめでとうございます！🎊

あなたのレストランメニューシステムが世界中からアクセス可能になりました！

**次のステップ:**
1. QRコードを生成して店舗に設置
2. スタッフ向けマニュアルの作成
3. 顧客フィードバックの収集
4. メニューの継続的更新

---

**作成日:** 2025年11月28日  
**対象:** restaurant-menu-viewer システム  
**推奨デプロイ先:** Vercel（無料・簡単・高性能）
