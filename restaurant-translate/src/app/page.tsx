'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { sampleMenu } from '@/data/sampleMenu';
import LanguageSelector from '@/components/LanguageSelector';
import MenuItemCard from '@/components/MenuItemCard';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { QrCode, Menu as MenuIcon, BarChart3, Settings, Home } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ja');
  const [showQRCode, setShowQRCode] = useState(false);
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    // クライアントサイドでのみURLを取得
    if (typeof window !== 'undefined') {
      setMenuUrl(`${window.location.origin}/menu/${sampleMenu.id}?lang=${currentLanguage}`);
    }
  }, [currentLanguage]);

  useEffect(() => {
    // ブラウザの言語設定から初期言語を検出
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      
      if (browserLang.startsWith('en')) {
        setCurrentLanguage('en');
      } else if (browserLang.startsWith('zh')) {
        setCurrentLanguage(browserLang.includes('tw') || browserLang.includes('hk') ? 'zh-TW' : 'zh-CN');
      } else if (browserLang.startsWith('ko')) {
        setCurrentLanguage('ko');
      } else if (browserLang.startsWith('fr')) {
        setCurrentLanguage('fr');
      } else if (browserLang.startsWith('es')) {
        setCurrentLanguage('es');
      } else if (browserLang.startsWith('th')) {
        setCurrentLanguage('th');
      } else if (browserLang.startsWith('vi')) {
        setCurrentLanguage('vi');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <MenuIcon className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                RestaurantTranslate
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                availableLanguages={sampleMenu.supportedLanguages}
              />
              
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* レストラン情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {sampleMenu.name}
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {sampleMenu.description[currentLanguage] || sampleMenu.description['ja']}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{sampleMenu.address[currentLanguage] || sampleMenu.address['ja']}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>{sampleMenu.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✉️</span>
              <span>{sampleMenu.email}</span>
            </div>
          </div>
        </div>

        {/* QRコード表示 */}
        {showQRCode && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <QRCodeGenerator
                url={menuUrl}
                title={currentLanguage === 'ja' ? 'メニューQRコード' : 'Menu QR Code'}
                description={
                  currentLanguage === 'ja'
                    ? 'スキャンしてメニューを表示'
                    : 'Scan to view the menu'
                }
              />
            </div>
          </div>
        )}

        {/* メニューカテゴリ */}
        {sampleMenu.categories.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {category.name[currentLanguage] || category.name['ja']}
              </h2>
              {category.description && (
                <p className="text-gray-600">
                  {category.description[currentLanguage] || category.description['ja']}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  language={currentLanguage}
                />
              ))}
            </div>
          </div>
        ))}

        {/* フッター情報 */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {currentLanguage === 'ja' ? '機能紹介' : 'Features'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🌍</div>
              <h4 className="font-semibold mb-1">
                {currentLanguage === 'ja' ? '多言語対応' : 'Multi-language'}
              </h4>
              <p className="text-sm text-gray-600">
                {currentLanguage === 'ja'
                  ? '8ヶ国語以上に対応'
                  : 'Supports 8+ languages'}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-semibold mb-1">
                {currentLanguage === 'ja' ? 'QRコード' : 'QR Code'}
              </h4>
              <p className="text-sm text-gray-600">
                {currentLanguage === 'ja'
                  ? '簡単にメニューにアクセス'
                  : 'Easy menu access'}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">🔊</div>
              <h4 className="font-semibold mb-1">
                {currentLanguage === 'ja' ? '音声読み上げ' : 'Voice'}
              </h4>
              <p className="text-sm text-gray-600">
                {currentLanguage === 'ja'
                  ? 'メニューを音声で確認'
                  : 'Hear menu items'}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl mb-2">🚫</div>
              <h4 className="font-semibold mb-1">
                {currentLanguage === 'ja' ? 'アレルギー表示' : 'Allergens'}
              </h4>
              <p className="text-sm text-gray-600">
                {currentLanguage === 'ja'
                  ? '詳細なアレルギー情報'
                  : 'Detailed allergen info'}
              </p>
            </div>
          </div>
        </div>

        {/* 管理者メニューへのリンク */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {currentLanguage === 'ja' ? '管理者向け機能' : 'Admin Features'}
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {currentLanguage === 'ja' ? '管理画面' : 'Admin Panel'}
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              {currentLanguage === 'ja' ? 'アクセス分析' : 'Analytics'}
            </Link>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2024 RestaurantTranslate. All rights reserved.
            </p>
            <p className="text-xs mt-2">
              {currentLanguage === 'ja'
                ? 'インバウンド対応・多言語メニュー翻訳システム'
                : 'Multi-language Restaurant Menu Translation System'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
