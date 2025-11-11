# リアルタイム同期実装（簡易版）
## Simple Real-time Synchronization Implementation

---

## ✅ 実装完了

管理者パネル（Port 3003）とユーザーアプリ（Port 3001）の間で、**3秒以内**にデータが自動同期されるようになりました。

---

## 🔧 実装方法

### 技術的な仕組み

#### 1. **APIエンドポイント** （新規作成）
`restaurant-menu-viewer/src/app/api/menu/route.ts`

```typescript
// GET: メニューデータを取得
export async function GET() {
  // menu-data.json ファイルから読み込み
}

// POST: メニューデータを保存
export async function POST(request: Request) {
  // menu-data.json ファイルに書き込み
}
```

**役割**: 
- 管理者パネルからのデータを受け取って保存
- ユーザーアプリからの取得リクエストに応答

---

#### 2. **管理者パネル側** （更新）
`restaurant-admin-panel/src/lib/syncManager.ts`

```typescript
saveData(data: Restaurant): void {
  // 1. localStorageに保存（管理者パネル内）
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  // 2. ユーザーアプリのAPIにPOST
  this.syncToCustomerApp(data);
}

private async syncToCustomerApp(data: Restaurant): Promise<void> {
  const CUSTOMER_APP_URL = 'https://3001-...';
  await fetch(`${CUSTOMER_APP_URL}/api/menu`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

**動作**:
1. メニューを保存するとき
2. 自動的にユーザーアプリのAPIにデータを送信
3. 成功したらログに「✅ Data synced to customer app via API」表示

---

#### 3. **ユーザーアプリ側** （更新）
`restaurant-menu-viewer/src/lib/syncManager.ts`

```typescript
constructor() {
  // ポーリング開始（3秒ごと）
  this.startPolling();
}

private startPolling(): void {
  this.pollingInterval = setInterval(() => {
    this.checkForUpdates();
  }, 3000);
}

private async checkForUpdates(): Promise<void> {
  // APIからデータを取得
  const response = await fetch('/api/menu');
  const data = await response.json();
  
  // 変更があれば全リスナーに通知
  if (this.lastDataHash !== currentHash) {
    this.listeners.forEach(listener => listener(data));
  }
}
```

**動作**:
1. 3秒ごとにAPIをチェック
2. データが変更されていたら自動更新
3. ユーザーアプリの画面が自動的にリフレッシュ

---

## 📊 データフロー

```
┌─────────────────────┐
│  管理者パネル        │
│  (Port 3003)        │
│                     │
│  1. メニュー編集     │
│  2. 保存ボタン押下   │
└──────────┬──────────┘
           │
           │ POST /api/menu
           ▼
┌─────────────────────┐
│  APIエンドポイント   │
│  menu-data.json     │
│  (Port 3001)        │
└──────────┬──────────┘
           │
           │ 3秒ごとにGET /api/menu
           ▼
┌─────────────────────┐
│  ユーザーアプリ      │
│  (Port 3001)        │
│                     │
│  3. データ自動更新   │
│  4. 画面リフレッシュ │
└─────────────────────┘
```

---

## 🧪 動作確認手順

### 1. 両方のアプリを開く

**管理者パネル**:
```
https://3003-im8wlpwehyh3f0rsaxz0b-c07dda5e.sandbox.novita.ai
```

**ユーザーアプリ**:
```
https://3001-im8wlpwehyh3f0rsaxz0b-c07dda5e.sandbox.novita.ai
```

### 2. テスト実行

#### テスト1: 新規メニュー追加
1. 管理者パネルで「新しいメニュー項目を追加」をクリック
2. メニュー情報を入力：
   ```
   名前: 同期テスト ${Date.now()}
   価格: 1500
   ```
3. 「保存」をクリック
4. ⏱️ **3秒以内**にユーザーアプリに新しいメニューが表示される

#### テスト2: メニュー編集
1. 管理者パネルで任意のメニューを編集
2. 価格を変更（例: 1000円 → 2000円）
3. 「保存」をクリック
4. ⏱️ **3秒以内**にユーザーアプリの価格が更新される

#### テスト3: 売り切れフラグ
1. 管理者パネルでメニューを編集
2. 「売り切れ」チェックボックスをON
3. 「保存」をクリック
4. ⏱️ **3秒以内**にユーザーアプリで売り切れ表示になる

#### テスト4: 画像アップロード
1. 管理者パネルでメニューを編集
2. 画像をアップロード
3. 「保存」をクリック
4. ⏱️ **3秒以内**にユーザーアプリに画像が表示される

---

## 🐛 デバッグ方法

### ブラウザの開発者コンソールで確認

#### 管理者パネル側のログ
```
[SyncManager] Saving data: レストラン名 Categories: 5
[SyncManager] Data saved to localStorage
[SyncManager] ✅ Data synced to customer app via API
```

#### ユーザーアプリ側のログ
```
[SyncManager] Starting polling (every 3 seconds)
[SyncManager] Data changed detected via API polling
[Viewer Page] Received update from syncManager
```

### トラブルシューティング

#### 問題: 同期されない
**確認1**: 管理者パネルのコンソールに「✅ Data synced」が表示されているか
- ❌ 表示されない → APIリクエストが失敗している
- ✅ 表示される → API成功、ユーザーアプリ側を確認

**確認2**: ユーザーアプリのコンソールに「Data changed detected」が表示されているか
- ❌ 表示されない → ポーリングが動作していない
- ✅ 表示される → 同期成功

**確認3**: 両方のサーバーが起動しているか
```bash
netstat -tlnp | grep -E ":(3001|3003)"
```

#### 問題: 同期が遅い
**現状**: 最大3秒の遅延
**原因**: ポーリング間隔が3秒に設定されている

**高速化したい場合**:
```typescript
// restaurant-menu-viewer/src/lib/syncManager.ts
this.pollingInterval = setInterval(() => {
  this.checkForUpdates();
}, 1000); // 3000 → 1000 に変更（1秒ごと）
```

⚠️ **注意**: 頻繁すぎるとサーバー負荷が増加

---

## 📁 変更されたファイル

### 新規作成
1. `restaurant-menu-viewer/src/app/api/menu/route.ts` - APIエンドポイント
2. `restaurant-admin-panel/src/lib/crossPortSync.ts` - クロスポート同期ヘルパー（予備）
3. `shared-data-server.js` - 独立サーバー版（未使用）

### 更新
1. `restaurant-menu-viewer/src/lib/syncManager.ts` - ポーリング機能追加
2. `restaurant-admin-panel/src/lib/syncManager.ts` - API POST機能追加

---

## ⚙️ 技術的な制約と解決策

### 問題: 異なるポート間でlocalStorageを共有できない

#### 制約
- `localhost:3001` と `localhost:3003` は異なるオリジン
- localStorageは各オリジンで独立
- BroadcastChannelは同一オリジンでのみ動作
- Storage Eventは異なるポート間で発火しない

#### 解決策（実装済み）
**APIエンドポイント + ポーリング**

メリット:
- ✅ 確実に動作する
- ✅ シンプルで理解しやすい
- ✅ デバッグが簡単
- ✅ サーバー再起動後もデータが保持される（ファイルに保存）

デメリット:
- ⚠️ 最大3秒の遅延
- ⚠️ 定期的なAPIリクエストが発生

---

## 🚀 将来の改善案

### 1. WebSocket実装（完全リアルタイム）
```
遅延: 100ms以下
実装難易度: 高
コスト: 高（WebSocketサーバー必要）
```

### 2. Server-Sent Events (SSE)
```
遅延: 1秒以下
実装難易度: 中
コスト: 中
```

### 3. Firebase Realtime Database
```
遅延: 100ms以下
実装難易度: 低
コスト: 従量課金
```

### 4. 現在の実装をそのまま使用
```
遅延: 最大3秒
実装難易度: 完了済み
コスト: 無料
推奨度: ✅ 簡易版としては十分
```

---

## ✅ まとめ

### 実装状況
- ✅ APIエンドポイント作成完了
- ✅ ポーリング機能実装完了
- ✅ クロスポート同期実装完了
- ✅ 両サーバー起動中
- ✅ テスト可能

### 動作確認
1. 管理者パネルでメニューを編集
2. 保存ボタンをクリック
3. **3秒以内**にユーザーアプリに反映される

### 次のステップ
1. 実際にテストして動作確認
2. 問題があれば報告
3. 必要に応じて改善

---

**作成日**: 2025-11-07  
**実装方式**: API + Polling（簡易版）  
**同期遅延**: 最大3秒  
**ステータス**: ✅ 実装完了・テスト可能
