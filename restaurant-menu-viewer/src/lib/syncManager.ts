'use client';

import { Restaurant } from '@/types';

// ローカルストレージのキー
const STORAGE_KEY = 'restaurant_menu_data';
const SYNC_CHANNEL_NAME = 'menu_sync_channel';
const SYNC_EVENT_KEY = 'restaurant_menu_sync_event';

/**
 * リアルタイムデータ同期マネージャー（簡易版）
 * 定期的なポーリングでlocalStorageをチェックして変更を検知
 * 異なるポート間でも動作する疑似リアルタイム同期
 */
export class SyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(data: Restaurant) => void> = new Set();
  private storageHandler: ((e: StorageEvent) => void) | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastDataHash: string | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    // BroadcastChannel（同一オリジン内のタブ間同期用）
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      this.setupBroadcastListener();
    }

    // Storage event（異なるポート間の同期用）
    this.setupStorageListener();
    
    // ポーリング開始（3秒ごとにチェック）
    this.startPolling();
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

      // 異なるポート間での同期用（Storage event）
      // storage eventは同じタブでは発火しないため、別のキーを使用
      const syncEvent = {
        type: 'DATA_UPDATE',
        payload: JSON.stringify(data),
        timestamp: Date.now(),
      };
      localStorage.setItem(SYNC_EVENT_KEY, JSON.stringify(syncEvent));
      console.log('[SyncManager] Storage sync event triggered');
      
      // すぐに削除して次回の更新を検知できるようにする
      setTimeout(() => {
        localStorage.removeItem(SYNC_EVENT_KEY);
      }, 100);
    } catch (error) {
      console.error('[SyncManager] Failed to save data:', error);
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
   * データのハッシュを計算（変更検知用）
   */
  private calculateHash(data: Restaurant): string {
    return JSON.stringify(data);
  }

  /**
   * ポーリングを開始（3秒ごとにlocalStorageをチェック）
   */
  private startPolling(): void {
    console.log('[SyncManager] Starting polling (every 3 seconds)');
    
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates();
    }, 3000);
  }

  /**
   * APIとlocalStorageをチェックして変更があれば通知
   */
  private async checkForUpdates(): Promise<void> {
    try {
      // APIからデータを取得
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        const currentHash = JSON.stringify(data);
        
        // 前回と異なる場合のみ更新
        if (this.lastDataHash !== currentHash) {
          console.log('[SyncManager] Data changed detected via API polling');
          this.lastDataHash = currentHash;
          
          // localStorageにも保存（オフライン対応）
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          
          // すべての登録されたリスナーに通知
          this.listeners.forEach(listener => listener(data));
        }
      } else {
        // APIが失敗した場合はlocalStorageにフォールバック
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          const currentHash = localData;
          if (this.lastDataHash !== currentHash) {
            console.log('[SyncManager] Data changed detected via localStorage fallback');
            this.lastDataHash = currentHash;
            const parsedData = JSON.parse(localData) as Restaurant;
            this.listeners.forEach(listener => listener(parsedData));
          }
        }
      }
    } catch (error) {
      console.error('[SyncManager] Polling check error:', error);
      // エラー時はlocalStorageにフォールバック
      try {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          const currentHash = localData;
          if (this.lastDataHash !== currentHash) {
            this.lastDataHash = currentHash;
            const parsedData = JSON.parse(localData) as Restaurant;
            this.listeners.forEach(listener => listener(parsedData));
          }
        }
      } catch (fallbackError) {
        console.error('[SyncManager] Fallback error:', fallbackError);
      }
    }
  }

  /**
   * ポーリングを停止
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[SyncManager] Polling stopped');
    }
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    this.stopPolling();
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
