'use client';

import React, { useState, useEffect } from 'react';
import { sampleMenu } from '@/data/sampleMenu';
import { MenuItem, MenuCategory } from '@/types';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Star,
  Leaf,
  Package,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader';
import { getSyncManager } from '@/lib/syncManager';

export default function MenuManagementPage() {
  const [restaurant, setRestaurant] = useState(sampleMenu);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // データ同期の初期化
  useEffect(() => {
    const syncManager = getSyncManager();
    
    // localStorageから既存のデータを読み込み
    const savedData = syncManager.loadData();
    if (savedData) {
      setRestaurant(savedData);
    } else {
      // 初回ロード時：sampleMenuをlocalStorageに保存
      console.log('[Menu Page] First load - saving sampleMenu to localStorage');
      syncManager.saveData(sampleMenu);
    }

    // データ変更のリスナーを登録
    const unsubscribe = syncManager.subscribe((updatedData) => {
      console.log('[Menu Page] Received update from syncManager');
      setRestaurant(updatedData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSaveItem = (item: MenuItem) => {
    console.log('[Menu Page] ========== SAVE OPERATION START ==========');
    console.log('[Menu Page] Item to save:', {
      id: item.id,
      name: item.name.ja,
      price: item.price,
      imageUrl: item.imageUrl ? 'HAS IMAGE' : 'NO IMAGE',
      category: item.category,
    });
    console.log('[Menu Page] Selected category:', selectedCategory);
    console.log('[Menu Page] Is adding new:', isAddingItem);
    console.log('[Menu Page] Is editing existing:', !!editingItem && !isAddingItem);
    
    if (!selectedCategory) {
      console.error('[Menu Page] ERROR: No category selected!');
      alert('エラー：カテゴリが選択されていません');
      return;
    }
    
    // カテゴリを更新
    const updatedCategories = restaurant.categories.map(cat => {
      if (cat.id !== selectedCategory) {
        return cat; // 別のカテゴリはそのまま
      }
      
      // 選択されたカテゴリを更新
      if (isAddingItem) {
        // 新規追加
        console.log('[Menu Page] Adding new item to category:', cat.name.ja);
        return {
          ...cat,
          items: [...cat.items, item],
        };
      } else {
        // 既存アイテムを更新
        console.log('[Menu Page] Updating existing item in category:', cat.name.ja);
        return {
          ...cat,
          items: cat.items.map(i => i.id === item.id ? item : i),
        };
      }
    });
    
    const updatedRestaurant = {
      ...restaurant,
      categories: updatedCategories,
    };
    
    console.log('[Menu Page] Restaurant updated. Total items:', 
      updatedRestaurant.categories.reduce((sum, cat) => sum + cat.items.length, 0));
    
    // localStorageとBroadcastChannelで同期
    const syncManager = getSyncManager();
    syncManager.saveData(updatedRestaurant);
    
    // ステートを更新
    setRestaurant(updatedRestaurant);
    setEditingItem(null);
    setIsAddingItem(false);
    
    console.log('[Menu Page] ========== SAVE OPERATION END ==========');
    alert('✅ メニュー項目を保存しました！');
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    if (!confirm('このメニュー項目を削除しますか？')) return;

    const updatedRestaurant = {
      ...restaurant,
      categories: restaurant.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      ),
    };
    
    // syncManagerを使用してデータを保存・同期
    const syncManager = getSyncManager();
    syncManager.saveData(updatedRestaurant);
    
    setRestaurant(updatedRestaurant);
    alert('メニュー項目を削除しました！');
  };

  const handleAddNewItem = () => {
    if (!selectedCategory) {
      alert('カテゴリを選択してください');
      return;
    }
    
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: { ja: '新しいメニュー' },
      description: { ja: '説明を入力してください' },
      price: 1000,
      currency: 'JPY',
      category: selectedCategory,
      allergies: {
        egg: false,
        milk: false,
        wheat: false,
        shellfish: false,
        pork: false,
        beef: false,
        chicken: false,
        peanuts: false,
        soy: false,
      },
      dietary: {
        vegetarian: false,
        vegan: false,
        halal: false,
        glutenFree: false,
        kosher: false,
      },
      available: true,
      soldOut: false,
    };
    
    setEditingItem(newItem);
    setIsAddingItem(true);
  };

  const selectedCategoryData = restaurant.categories.find(
    cat => cat.id === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-md border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>ダッシュボードに戻る</span>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">メニュー管理</h1>
            </div>

            <button
              onClick={() => {
                const data = JSON.stringify(restaurant, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `menu-${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              メニューを保存
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* カテゴリ一覧 */}
          <div className="lg:col-span-1">
            <div className="admin-card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                メニューカテゴリ
              </h2>
              <div className="space-y-2">
                {restaurant.categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 border-2 border-primary-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      {category.name['ja']}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {category.items.length} 項目
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* メニュー項目一覧 */}
          <div className="lg:col-span-2">
            {selectedCategory ? (
              <div className="admin-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedCategoryData?.name['ja']} のメニュー項目
                  </h2>
                  <button
                    onClick={handleAddNewItem}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    新規追加
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedCategoryData?.items.map(item => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {item.name['ja']}
                            </h3>
                            {item.popular && (
                              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                <Star className="w-3 h-3 mr-1" fill="currentColor" />
                                人気
                              </span>
                            )}
                            {item.seasonal && (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                <Leaf className="w-3 h-3 mr-1" />
                                季節限定
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description['ja']}
                          </p>
                          <div className="text-lg font-bold text-primary-600">
                            ¥{item.price.toLocaleString()}
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
                            onClick={() =>
                              handleDeleteItem(selectedCategory, item.id)
                            }
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
            ) : (
              <div className="admin-card p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Upload className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-600">
                  左側からカテゴリを選択してメニュー項目を表示
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 編集モーダル */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {isAddingItem ? 'メニュー項目を追加' : 'メニュー項目を編集'}
                </h2>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsAddingItem(false);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メニュー名（日本語）
                  </label>
                  <input
                    type="text"
                    value={editingItem.name['ja'] || ''}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        name: { ...editingItem.name, ja: e.target.value },
                      })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明（日本語）
                  </label>
                  <textarea
                    value={editingItem.description['ja'] || ''}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        description: {
                          ...editingItem.description,
                          ja: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    価格（円）
                  </label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                  />
                </div>

                <ImageUploader
                  currentImageUrl={editingItem.imageUrl}
                  onImageChange={(imageUrl) =>
                    setEditingItem({
                      ...editingItem,
                      imageUrl: imageUrl,
                    })
                  }
                  label="メニュー画像"
                />

                {/* 在庫管理セクション */}
                <div className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-900">在庫管理</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={editingItem.available !== false}
                          onChange={e =>
                            setEditingItem({
                              ...editingItem,
                              available: e.target.checked,
                              soldOut: e.target.checked ? false : editingItem.soldOut,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          提供可能
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={editingItem.soldOut || false}
                          onChange={e =>
                            setEditingItem({
                              ...editingItem,
                              soldOut: e.target.checked,
                              available: e.target.checked ? false : editingItem.available,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          売り切れ
                        </span>
                      </label>
                      {editingItem.soldOut && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>ユーザーアプリに売り切れとして表示されます</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        在庫数（オプション）
                      </label>
                      <input
                        type="number"
                        value={editingItem.stock || ''}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            stock: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="未入力 = 無制限"
                        className="input-field"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        在庫数を入力すると、残り数が表示されます
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingItem.popular || false}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            popular: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        人気メニュー
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingItem.seasonal || false}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            seasonal: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        季節限定
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      if (editingItem) {
                        console.log('[Menu Page] Save button clicked, item:', editingItem.name.ja);
                        handleSaveItem(editingItem);
                      } else {
                        console.error('[Menu Page] Cannot save: editingItem is null');
                      }
                    }}
                    className="flex-1 btn-primary"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsAddingItem(false);
                    }}
                    className="flex-1 btn-secondary"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
