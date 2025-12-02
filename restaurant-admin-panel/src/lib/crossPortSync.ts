'use client';

import { Restaurant } from '@/types';

const STORAGE_KEY = 'restaurant_menu_data';
const CUSTOMER_APP_URL = 'https://3001-im8wlpwehyh3f0rsaxz0b-c07dda5e.sandbox.novita.ai';

/**
 * クロスポート同期ヘルパー
 * 管理者パネル（port 3003）からユーザーアプリ（port 3001）にデータを送信
 */
export class CrossPortSync {
  private static iframe: HTMLIFrameElement | null = null;

  /**
   * ユーザーアプリ用の隠しiframeを作成
   */
  private static ensureIframe(): void {
    if (this.iframe) return;

    this.iframe = document.createElement('iframe');
    this.iframe.style.display = 'none';
    this.iframe.src = `${CUSTOMER_APP_URL}/sync-receiver`;
    document.body.appendChild(this.iframe);
  }

  /**
   * データをユーザーアプリに送信
   */
  static async syncToCustomerApp(data: Restaurant): Promise<void> {
    try {
      // 方法1: localStorageに保存（管理者パネル側）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // 方法2: POSTリクエストでユーザーアプリに送信
      const response = await fetch(`${CUSTOMER_APP_URL}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'cors',
      });

      if (!response.ok) {
        console.warn('[CrossPortSync] API sync failed, using localStorage fallback');
      } else {
        console.log('[CrossPortSync] Data synced to customer app via API');
      }
    } catch (error) {
      console.error('[CrossPortSync] Sync error:', error);
      // フォールバック: localStorageのみ使用
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
}
