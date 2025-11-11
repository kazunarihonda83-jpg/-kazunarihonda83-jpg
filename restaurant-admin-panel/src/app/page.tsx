'use client';

import React, { useState } from 'react';
import { sampleMenu } from '@/data/sampleMenu';
import {
  LayoutDashboard,
  Menu,
  QrCode,
  BarChart3,
  Settings,
  Users,
  TrendingUp,
  Eye,
  Globe,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import QRCodeGenerator from '@/components/QRCodeGenerator';

export default function AdminDashboard() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [menuUrl, setMenuUrl] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // ユーザー向けアプリのURL（ポート3001）
      setMenuUrl(`${window.location.protocol}//${window.location.hostname}:3001`);
    }
  }, []);

  // 統計データ（デモ用）
  const stats = {
    totalMenuItems: sampleMenu.categories.reduce((sum, cat) => sum + cat.items.length, 0),
    totalCategories: sampleMenu.categories.length,
    supportedLanguages: sampleMenu.supportedLanguages.length,
    popularItems: sampleMenu.categories.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.popular).length,
      0
    ),
    totalViews: 12485,
    uniqueVisitors: 3241,
    avgViewTime: '2:34',
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
              <div className="text-right mr-3">
                <p className="text-sm font-medium text-gray-900">{sampleMenu.name}</p>
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
              href="/menu"
              className="flex flex-col items-center gap-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Menu className="w-8 h-8" />
              <span className="text-sm font-medium">メニュー管理</span>
            </Link>
            <Link
              href="/analytics"
              className="flex flex-col items-center gap-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <BarChart3 className="w-8 h-8" />
              <span className="text-sm font-medium">アクセス分析</span>
            </Link>
            <Link
              href="/settings"
              className="flex flex-col items-center gap-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Settings className="w-8 h-8" />
              <span className="text-sm font-medium">設定</span>
            </Link>
          </div>
        </div>

        {/* QRコード表示エリア */}
        {showQRCode && (
          <div className="mb-8 animate-fadeIn">
            <QRCodeGenerator
              url={menuUrl}
              title="レストランメニューQRコード"
              description="お客様がスキャンしてメニューを閲覧します"
              size={300}
            />
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
              <div className="text-sm font-medium text-gray-600">総閲覧数</div>
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalViews.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% vs 先週</span>
            </div>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近の活動 */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              最近の活動
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">新しいメニュー項目が追加されました</p>
                  <p className="text-xs text-gray-500">2時間前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">英語メニューが更新されました</p>
                  <p className="text-xs text-gray-500">5時間前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">QRコードがダウンロードされました</p>
                  <p className="text-xs text-gray-500">1日前</p>
                </div>
              </div>
            </div>
          </div>

          {/* メニューカテゴリ一覧 */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Menu className="w-5 h-5 text-primary-600" />
              メニューカテゴリ
            </h3>
            <div className="space-y-3">
              {sampleMenu.categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{category.name['ja']}</p>
                    <p className="text-xs text-gray-500">{category.items.length} items</p>
                  </div>
                  <Link
                    href={`/menu?category=${category.id}`}
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    編集
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ヘルプセクション */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 使い方のヒント</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span><strong>QRコード生成:</strong> お客様がスキャンできるQRコードを作成し、テーブルに設置します</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span><strong>メニュー管理:</strong> メニュー項目の追加・編集・削除が簡単にできます</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span><strong>アクセス分析:</strong> どの言語・メニューが人気かを確認できます</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
