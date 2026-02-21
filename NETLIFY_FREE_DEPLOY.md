# 🆓 Netlify 完全無料デプロイ手順（2分で完了）

## ✅ 費用: ¥0（永久無料）

---

## 手順1: ビルド済みファイルを準備

すでに準備完了しています：
- ✅ `shift-management-frontend-deploy.tar.gz`（128KB）

---

## 手順2: Netlifyにデプロイ

### A. ドラッグ&ドロップ（最も簡単）

1. **Netlifyにアクセス**: https://app.netlify.com
2. **GitHubでログイン**
3. **「Sites」** タブを開く
4. **「Add new site」** → **「Deploy manually」** をクリック
5. GitHubから `shift-management-frontend-deploy.tar.gz` をダウンロード
6. 解凍して **`dist`** フォルダをドラッグ&ドロップ
7. 完了！🎉

### B. Git連携（自動デプロイ）

1. **Netlifyにアクセス**: https://app.netlify.com
2. **「Import from Git」** をクリック
3. **GitHub** を選択
4. リポジトリ: **`kazunarihonda83-jpg/-kazunarihonda83-jpg`** を選択
5. ブランチ: **`genspark_ai_developer`**
6. **設定**:
   ```
   Base directory: shift-management-app
   Build command: npm run build
   Publish directory: shift-management-app/dist
   ```
7. **環境変数を追加**:
   ```
   Key: VITE_API_URL
   Value: https://3000-iqf0dj1wke1cog78fnr4y-cc2fbc16.sandbox.novita.ai
   ```
8. **「Deploy site」** をクリック

---

## 手順3: 動作確認

1. Netlifyから発行されたURL（例: `https://your-app.netlify.app`）にアクセス
2. ログイン画面が表示される
3. テストアカウントでログイン:
   - Email: `admin@test.com`
   - Password: `password123`

---

## 💰 料金について

### 無料プランの内容:
- ✅ 帯域幅: 100GB/月
- ✅ ビルド時間: 300分/月
- ✅ デプロイ回数: 無制限
- ✅ カスタムドメイン: 対応
- ✅ SSL証明書: 自動発行
- ✅ **スリープなし**: 常時アクセス可能

### このアプリの場合:
- ファイルサイズ: 約500KB（圧縮後125KB）
- 月1000アクセス想定: 約0.5GB
- **完全に無料プラン内で運用可能**

---

## 🔄 バックエンドについて

### 現在の構成:
```
フロントエンド: Netlify（無料）
バックエンド: 開発環境（既存Sandbox）
```

### 本番運用に移行する場合:

**オプションA: Render.com 無料プラン**
- 費用: ¥0/月
- 15分でスリープ（初回アクセスが遅い）

**オプションB: Render.com 有料プラン**
- 費用: 約¥1,000/月
- スリープなし、常時高速

**オプションC: Railway**
- $5分の無料クレジット付与
- その後従量課金（約¥1,000～2,000/月）

---

## 📊 デプロイ後のURL例

```
https://shift-management-12345.netlify.app
```

このURLで以下が動作します：
- ✅ ログイン
- ✅ ダッシュボード
- ✅ シフト管理
- ✅ 勤怠管理
- ✅ 評価管理
- ✅ レポート

---

## 🎯 次のステップ

1. ✅ Netlifyでフロントエンドをデプロイ
2. ⏸️ バックエンドは現在の開発環境を使用
3. 🔄 後で必要に応じてバックエンドを本番環境に移行

---

## 🆘 トラブルシューティング

### Q: ビルドが失敗する
**A**: Base directoryが `shift-management-app` になっているか確認

### Q: ログインできない
**A**: 環境変数 `VITE_API_URL` が正しく設定されているか確認

### Q: データが表示されない
**A**: バックエンドURLが動作しているか確認（ブラウザで直接アクセス）

---

## 📝 まとめ

- **費用**: 完全無料（¥0/月）
- **所要時間**: 2-5分
- **難易度**: ⭐ 簡単
- **スリープ**: なし（常時アクセス可能）

**今すぐNetlifyでデプロイしてみてください！**
