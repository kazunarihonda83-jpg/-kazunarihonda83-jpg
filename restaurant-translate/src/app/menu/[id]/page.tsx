'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Language } from '@/types';
import { sampleMenu } from '@/data/sampleMenu';
import LanguageSelector from '@/components/LanguageSelector';
import MenuItemCard from '@/components/MenuItemCard';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function MenuViewPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const initialLang = (searchParams.get('lang') as Language) || 'ja';
  const [currentLanguage, setCurrentLanguage] = useState<Language>(initialLang);

  useEffect(() => {
    // ページビューのトラッキング（デモ用）
    console.log(`Menu viewed: ${params.id}, Language: ${currentLanguage}`);
    
    // 実際の実装ではアナリティクスAPIを呼び出す
    // trackMenuView(params.id, currentLanguage);
  }, [params.id, currentLanguage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {sampleMenu.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                availableLanguages={sampleMenu.supportedLanguages}
              />
              
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* レストラン情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
          </div>
        </div>

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
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>Powered by RestaurantTranslate</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
