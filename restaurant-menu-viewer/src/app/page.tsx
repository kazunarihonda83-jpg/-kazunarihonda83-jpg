'use client';

import React, { useState, useEffect } from 'react';
import { Language, MenuItem } from '@/types';
import { sampleMenu } from '@/data/sampleMenu';
import LanguageSelector from '@/components/LanguageSelector';
import MenuItemCard from '@/components/MenuItemCard';
import SearchAndFilter, { FilterOptions } from '@/components/SearchAndFilter';
import { UtensilsCrossed, MapPin, Phone, Mail, Info } from 'lucide-react';
import { getSyncManager } from '@/lib/syncManager';

export default function MenuViewerPage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ja');
  const [showInfo, setShowInfo] = useState(false);
  const [restaurant, setRestaurant] = useState(sampleMenu);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    priceRange: [0, 10000],
    hideAllergens: [],
    dietaryFilters: [],
    showAvailableOnly: false,
  });

  // リアルタイムデータ同期
  useEffect(() => {
    const syncManager = getSyncManager();
    
    // localStorageから既存のデータを読み込み
    const savedData = syncManager.loadData();
    if (savedData) {
      setRestaurant(savedData);
    } else {
      // 初回ロード時：sampleMenuをlocalStorageに保存
      syncManager.saveData(sampleMenu);
    }

    // データ変更のリスナーを登録
    const unsubscribe = syncManager.subscribe((updatedData) => {
      setRestaurant(updatedData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

  // フィルタリングロジック
  const filterItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // 検索クエリフィルター
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const nameMatch = (item.name[currentLanguage] || item.name['ja']).toLowerCase().includes(query);
        const descMatch = (item.description[currentLanguage] || item.description['ja']).toLowerCase().includes(query);
        if (!nameMatch && !descMatch) return false;
      }

      // 価格帯フィルター
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
        return false;
      }

      // アレルゲン除外フィルター
      if (filters.hideAllergens.length > 0) {
        const hasExcludedAllergen = filters.hideAllergens.some(
          allergen => item.allergies[allergen as keyof typeof item.allergies]
        );
        if (hasExcludedAllergen) return false;
      }

      // 食事制限フィルター
      if (filters.dietaryFilters.length > 0) {
        const matchesDietary = filters.dietaryFilters.every(
          dietary => item.dietary[dietary as keyof typeof item.dietary]
        );
        if (!matchesDietary) return false;
      }

      // 提供可能なメニューのみ表示
      if (filters.showAvailableOnly) {
        if (item.available === false || item.soldOut) return false;
      }

      return true;
    });
  };

  const welcomeMessage = {
    'ja': 'ようこそ',
    'en': 'Welcome',
    'zh-CN': '欢迎',
    'zh-TW': '歡迎',
    'ko': '환영합니다',
    'fr': 'Bienvenue',
    'es': 'Bienvenido',
    'th': 'ยินดีต้อนรับ',
    'vi': 'Chào mừng',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <UtensilsCrossed className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {restaurant.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {welcomeMessage[currentLanguage]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
              >
                <Info className="w-5 h-5" />
              </button>
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                availableLanguages={restaurant.supportedLanguages}
              />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* レストラン情報 */}
        <div className={`bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-100 ${showInfo || 'lg:block'} ${showInfo ? 'block' : 'hidden lg:block'}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary-600" />
            {currentLanguage === 'ja' ? 'レストラン情報' : 'Restaurant Information'}
          </h2>
          <p className="text-gray-700 mb-5 leading-relaxed text-lg">
            {restaurant.description[currentLanguage] || restaurant.description['ja']}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <span className="text-gray-700">{restaurant.address[currentLanguage] || restaurant.address['ja']}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <span className="text-gray-700">{restaurant.phone}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <span className="text-gray-700">{restaurant.email}</span>
            </div>
          </div>
        </div>

        {/* 検索・フィルター */}
        <SearchAndFilter
          filters={filters}
          onFilterChange={setFilters}
          language={currentLanguage}
        />

        {/* メニューカテゴリ */}
        {restaurant.categories.map((category, index) => (
          <div key={category.id} className="mb-12" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span className="w-2 h-8 bg-primary-600 rounded-full"></span>
                {category.name[currentLanguage] || category.name['ja']}
              </h2>
              {category.description && (
                <p className="text-gray-600 text-lg ml-5">
                  {category.description[currentLanguage] || category.description['ja']}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterItems(category.items).map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  language={currentLanguage}
                />
              ))}
            </div>
            {filterItems(category.items).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {currentLanguage === 'ja' 
                  ? 'このカテゴリに表示するメニューがありません'
                  : 'No items to display in this category'}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t-2 border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              {currentLanguage === 'ja' 
                ? 'お食事をお楽しみください' 
                : 'Enjoy your meal'}
            </p>
            <p className="text-sm text-gray-500">
              © 2024 {restaurant.name}. Powered by RestaurantTranslate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
