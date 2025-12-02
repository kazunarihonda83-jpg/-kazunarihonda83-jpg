'use client';

import React, { useState } from 'react';
import { sampleMenu } from '@/data/sampleMenu';
import {
  LayoutDashboard,
  Menu,
  QrCode,
  BarChart3,
  Settings,
  TrendingUp,
  Eye,
  Globe,
  Star,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { getSyncManager } from '@/lib/syncManager';

export default function AdminDashboard() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [menuUrl, setMenuUrl] = useState('');
  const [restaurant, setRestaurant] = useState(sampleMenu);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // 同じポートのメニュービューアURL
      setMenuUrl(`${window.location.protocol}//${window.location.host}`);
      
      // localStorageからデータ読み込み
      const syncManager = getSyncManager();
      const savedData = syncManager.loadData();
      if (savedData) {
        setRestaurant(savedData);
      }
    }
  }, []);

  // 統計データ
  const stats = {
    totalMenuItems: restaurant.categories.reduce((sum, cat) => sum + cat.items.length, 0),
    totalCategories: restaurant.categories.length,
    supportedLanguages: restaurant.supportedLanguages.length,
    popularItems: restaurant.categories.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.popular).length,
      0
    ),
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `menu-qr-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-md border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">管理者パネル</h1>
                <p className="text-sm text-gray-600">Restaurant Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">メニューを見る</span>
              </Link>
              <div className="text-right mr-3">
                <p className="text-sm font-medium text-gray-900">{restaurant.name}</p>
                <p className="text-xs text-gray-500">管理者</p>
              </div>
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* クイックアクションバー */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">クイックアクション</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="flex flex-col items-center gap-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <QrCode className="w-8 h-8" />
              <span className="text-sm font-medium">QRコード生成</span>
            </button>
            <Link
              href="/admin/menu"
              className="flex flex-col items-center gap-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Menu className="w-8 h-8" />
              <span className="text-sm font-medium">メニュー管理</span>
            </Link>
            <button
              disabled
              className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg opacity-50 cursor-not-allowed"
            >
              <BarChart3 className="w-8 h-8" />
              <span className="text-sm font-medium">アクセス分析</span>
            </button>
            <button
              disabled
              className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg opacity-50 cursor-not-allowed"
            >
              <Settings className="w-8 h-8" />
              <span className="text-sm font-medium">設定</span>
            </button>
          </div>
        </div>

        {/* QRコード表示エリア */}
        {showQRCode && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">レストランメニューQRコード</h3>
              <p className="text-gray-600 mb-6">お客様がスキャンしてメニューを閲覧します</p>
              
              <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="p-4 bg-white rounded-lg">
                  {/* QRコードはクライアント側で生成 */}
                  <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">QRコード</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600 break-all">{menuUrl}</p>
                <button
                  onClick={downloadQRCode}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  QRコードをダウンロード
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card border-primary-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">総メニュー数</div>
              <Menu className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalMenuItems}
            </div>
            <div className="text-xs text-gray-500">
              {stats.totalCategories} カテゴリ
            </div>
          </div>

          <div className="stat-card border-green-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">対応言語</div>
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.supportedLanguages}
            </div>
            <div className="text-xs text-gray-500">言語で提供中</div>
          </div>

          <div className="stat-card border-yellow-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">人気メニュー</div>
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.popularItems}
            </div>
            <div className="text-xs text-gray-500">人気バッジ付き</div>
          </div>

          <div className="stat-card border-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">統合版</div>
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-2">
              Port 3001
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>同じポートで動作中</span>
            </div>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* メニューカテゴリ一覧 */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Menu className="w-5 h-5 text-primary-600" />
              メニューカテゴリ
            </h3>
            <div className="space-y-3">
              {restaurant.categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{category.name['ja']}</p>
                    <p className="text-xs text-gray-500">{category.items.length} items</p>
                  </div>
                  <Link
                    href={`/admin/menu?category=${category.id}`}
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    編集
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 統合版の説明 */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              統合版の特徴
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">同じポートで動作</p>
                  <p className="text-xs text-gray-500">Port 3001で管理者とユーザーアプリが統合</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">リアルタイム同期</p>
                  <p className="text-xs text-gray-500">更新ボタンで確実にデータが反映されます</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">共有localStorage</p>
                  <p className="text-xs text-gray-500">管理者とユーザーが同じデータを使用</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ヘルプセクション */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 使い方のヒント</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span><strong>メニュー管理:</strong> メニュー項目の追加・編集・削除が簡単にできます</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span><strong>リアルタイム反映:</strong> 保存すると即座にユーザーアプリに反映されます</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span><strong>同じポート:</strong> 管理者画面（/admin）とユーザー画面（/）が同じアプリです</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
