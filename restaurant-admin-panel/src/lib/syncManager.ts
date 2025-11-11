'use client';

import { Restaurant } from '@/types';

// ローカルストレージのキー
const STORAGE_KEY = 'restaurant_menu_data';
const SYNC_CHANNEL_NAME = 'menu_sync_channel';
const SYNC_EVENT_KEY = 'restaurant_menu_sync_event';

/**
 * リアルタイムデータ同期マネージャー
 * localStorage storage event を使用してタブ・ポート間でデータを同期
 * BroadcastChannelは同じオリジンでのみ動作するため、異なるポート間の同期には使用できない
 */
export class SyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(data: Restaurant) => void> = new Set();
  private storageHandler: ((e: StorageEvent) => void) | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    // BroadcastChannel（同一オリジン内のタブ間同期用）
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      this.setupBroadcastListener();
    }

    // Storage event（異なるポート間の同期用）
    this.setupStorageListener();
  }

  /**
   * BroadcastChannelメッセージリスナーのセットアップ
   */
  private setupBroadcastListener() {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      if (event.data.type === 'DATA_UPDATE') {
        const data = event.data.payload as Restaurant;
        // すべての登録されたリスナーに通知
        this.listeners.forEach(listener => listener(data));
      }
    };
  }

  /**
   * Storage eventリスナーのセットアップ（異なるポート間の同期用）
   */
  private setupStorageListener() {
    console.log('[SyncManager] Setting up storage event listener');
    this.storageHandler = (e: StorageEvent) => {
      console.log('[SyncManager] Storage event received:', e.key, e.newValue ? 'has value' : 'no value');
      // SYNC_EVENT_KEYの変更を監視
      if (e.key === SYNC_EVENT_KEY && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          if (syncData.type === 'DATA_UPDATE') {
            const data = JSON.parse(syncData.payload) as Restaurant;
            console.log('[SyncManager] Storage event - updating data:', data.name);
            // すべての登録されたリスナーに通知
            this.listeners.forEach(listener => listener(data));
          }
        } catch (error) {
          console.error('[SyncManager] Failed to parse storage event:', error);
        }
      }
    };

    window.addEventListener('storage', this.storageHandler);
  }

  /**
   * データをlocalStorageに保存し、他のタブ・ポートに通知
   */
  saveData(data: Restaurant): void {
    try {
      console.log('[SyncManager] Saving data:', data.name, 'Categories:', data.categories.length);
      
      // localStorageに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('[SyncManager] Data saved to localStorage');

      // 同一オリジン内のタブに通知（BroadcastChannel）
      if (this.channel) {
        this.channel.postMessage({
          type: 'DATA_UPDATE',
          payload: data,
          timestamp: Date.now(),
        });
        console.log('[SyncManager] Broadcast message sent');
      }

      // 異なるポート間での同期用: ユーザーアプリのAPIにPOST
      this.syncToCustomerApp(data);
      
    } catch (error) {
      console.error('[SyncManager] Failed to save data:', error);
    }
  }

  /**
   * ユーザーアプリのAPIにデータを送信（クロスポート同期）
   */
  private async syncToCustomerApp(data: Restaurant): Promise<void> {
    try {
      const CUSTOMER_APP_URL = 'https://3001-im8wlpwehyh3f0rsaxz0b-c07dda5e.sandbox.novita.ai';
      const response = await fetch(`${CUSTOMER_APP_URL}/api/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'cors',
      });

      if (response.ok) {
        console.log('[SyncManager] ✅ Data synced to customer app via API');
      } else {
        console.warn('[SyncManager] ⚠️ API sync failed, customer app will poll for updates');
      }
    } catch (error) {
      console.error('[SyncManager] ❌ API sync error:', error);
      console.log('[SyncManager] Customer app will poll for updates');
    }
  }

  /**
   * localStorageからデータを読み込み
   */
  loadData(): Restaurant | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Restaurant;
        console.log('[SyncManager] Loaded data from localStorage:', parsed.name);
        return parsed;
      }
      console.log('[SyncManager] No data in localStorage');
      return null;
    } catch (error) {
      console.error('[SyncManager] Failed to load data:', error);
      return null;
    }
  }

  /**
   * データ変更のリスナーを登録
   */
  subscribe(listener: (data: Restaurant) => void): () => void {
    this.listeners.add(listener);
    
    // クリーンアップ関数を返す
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close();
    }
    if (this.storageHandler) {
      window.removeEventListener('storage', this.storageHandler);
    }
    this.listeners.clear();
  }
}

// シングルトンインスタンス
let syncManagerInstance: SyncManager | null = null;

/**
 * SyncManagerのシングルトンインスタンスを取得
 */
export function getSyncManager(): SyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager();
  }
  return syncManagerInstance;
}
