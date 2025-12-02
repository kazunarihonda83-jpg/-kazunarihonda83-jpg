'use client';

import React, { useState } from 'react';
import { MenuItem, Language, MenuCategory } from '@/types';
import { sampleMenu } from '@/data/sampleMenu';
import { Plus, Edit2, Trash2, Save, Upload, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [restaurant, setRestaurant] = useState(sampleMenu);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleSaveMenu = () => {
    // 実際の実装ではAPIエンドポイントに送信
    const menuData = JSON.stringify(restaurant, null, 2);
    const blob = new Blob([menuData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'menu-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    alert('メニューデータを保存しました！');
  };

  const handleExportMenu = () => {
    const menuData = JSON.stringify(restaurant, null, 2);
    const blob = new Blob([menuData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `menu-export-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMenu = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setRestaurant(imported);
        alert('メニューデータをインポートしました！');
      } catch (error) {
        alert('エラー: 無効なJSONファイルです');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    if (!confirm('このメニュー項目を削除しますか？')) return;

    setRestaurant(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      ),
    }));
  };

  const getCategoryItemCount = (categoryId: string) => {
    const category = restaurant.categories.find(cat => cat.id === categoryId);
    return category?.items.length || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>メニューに戻る</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 ml-4">
                管理画面
              </h1>
            </div>

            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>インポート</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportMenu}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleExportMenu}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                エクスポート
              </button>

              <button
                onClick={handleSaveMenu}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* レストラン基本情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">レストラン基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レストラン名
              </label>
              <input
                type="text"
                value={restaurant.name}
                onChange={(e) => setRestaurant(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号
              </label>
              <input
                type="text"
                value={restaurant.phone}
                onChange={(e) => setRestaurant(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={restaurant.email}
                onChange={(e) => setRestaurant(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* メニューカテゴリ一覧 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">メニューカテゴリ</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="w-4 h-4" />
              カテゴリ追加
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurant.categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {category.name['ja']}
                  </h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {getCategoryItemCount(category.id)} items
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description['ja']}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 編集処理
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    編集
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 選択されたカテゴリのメニュー項目 */}
        {selectedCategory && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {restaurant.categories.find(cat => cat.id === selectedCategory)?.name['ja']}
                のメニュー項目
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" />
                メニュー追加
              </button>
            </div>

            <div className="space-y-4">
              {restaurant.categories
                .find(cat => cat.id === selectedCategory)
                ?.items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.name['ja']}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description['ja']}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-primary-600">
                            ¥{item.price.toLocaleString()}
                          </span>
                          {item.popular && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              人気
                            </span>
                          )}
                          {item.seasonal && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              季節限定
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(selectedCategory, item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">総カテゴリ数</div>
            <div className="text-3xl font-bold text-gray-900">
              {restaurant.categories.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">総メニュー数</div>
            <div className="text-3xl font-bold text-gray-900">
              {restaurant.categories.reduce((sum, cat) => sum + cat.items.length, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">対応言語数</div>
            <div className="text-3xl font-bold text-gray-900">
              {restaurant.supportedLanguages.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">人気メニュー</div>
            <div className="text-3xl font-bold text-gray-900">
              {restaurant.categories.reduce(
                (sum, cat) => sum + cat.items.filter(item => item.popular).length,
                0
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
