'use client';

import React, { useState } from 'react';
import { sampleMenu } from '@/data/sampleMenu';
import { Language, LANGUAGE_NAMES } from '@/types';
import {
  ArrowLeft,
  Save,
  Upload,
  Download,
  Globe,
  Building2,
  Phone,
  Mail,
  MapPin,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState(sampleMenu);
  const [activeTab, setActiveTab] = useState<'general' | 'languages' | 'data'>('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('設定を保存しました！');
    }, 1000);
  };

  const handleExport = () => {
    const data = JSON.stringify(restaurant, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `restaurant-menu-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('メニューデータをエクスポートしました！');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const toggleLanguage = (lang: Language) => {
    setRestaurant(prev => ({
      ...prev,
      supportedLanguages: prev.supportedLanguages.includes(lang)
        ? prev.supportedLanguages.filter(l => l !== lang)
        : [...prev.supportedLanguages, lang],
    }));
  };

  const allLanguages: Language[] = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko', 'fr', 'es', 'th', 'vi'];

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
              <h1 className="text-xl font-bold text-gray-900">設定</h1>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary flex items-center gap-2 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  変更を保存
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブ */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-5 h-5 mx-auto mb-1" />
              基本情報
            </button>
            <button
              onClick={() => setActiveTab('languages')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'languages'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-5 h-5 mx-auto mb-1" />
              対応言語
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'data'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Download className="w-5 h-5 mx-auto mb-1" />
              データ管理
            </button>
          </div>
        </div>

        {/* 基本情報タブ */}
        {activeTab === 'general' && (
          <div className="admin-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">レストラン基本情報</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  レストラン名
                </label>
                <input
                  type="text"
                  value={restaurant.name}
                  onChange={(e) => setRestaurant(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="例：和食レストラン「桜」"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明（日本語）
                </label>
                <textarea
                  value={restaurant.description['ja']}
                  onChange={(e) =>
                    setRestaurant(prev => ({
                      ...prev,
                      description: { ...prev.description, ja: e.target.value },
                    }))
                  }
                  rows={3}
                  className="input-field"
                  placeholder="レストランの説明を入力してください"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={restaurant.phone}
                    onChange={(e) => setRestaurant(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-field"
                    placeholder="例：03-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={restaurant.email}
                    onChange={(e) => setRestaurant(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    placeholder="例：info@restaurant.jp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  住所（日本語）
                </label>
                <input
                  type="text"
                  value={restaurant.address['ja']}
                  onChange={(e) =>
                    setRestaurant(prev => ({
                      ...prev,
                      address: { ...prev.address, ja: e.target.value },
                    }))
                  }
                  className="input-field"
                  placeholder="例：東京都渋谷区桜丘町1-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* 対応言語タブ */}
        {activeTab === 'languages' && (
          <div className="admin-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">対応言語の選択</h2>
            <p className="text-sm text-gray-600 mb-6">
              メニューで表示する言語を選択してください。選択した言語は、顧客向けアプリの言語セレクターに表示されます。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allLanguages.map((lang) => {
                const isSelected = restaurant.supportedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">
                        {lang === 'ja' && '🇯🇵'}
                        {lang === 'en' && '🇬🇧'}
                        {lang === 'zh-CN' && '🇨🇳'}
                        {lang === 'zh-TW' && '🇹🇼'}
                        {lang === 'ko' && '🇰🇷'}
                        {lang === 'fr' && '🇫🇷'}
                        {lang === 'es' && '🇪🇸'}
                        {lang === 'th' && '🇹🇭'}
                        {lang === 'vi' && '🇻🇳'}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {LANGUAGE_NAMES[lang].native}
                      </div>
                      <div className="text-xs text-gray-500">
                        {LANGUAGE_NAMES[lang].english}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>選択中:</strong> {restaurant.supportedLanguages.length}言語
              </p>
              <p className="text-xs text-blue-700 mt-1">
                少なくとも1つの言語を選択してください
              </p>
            </div>
          </div>
        )}

        {/* データ管理タブ */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* エクスポート */}
            <div className="admin-card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary-600" />
                データエクスポート
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                現在のメニューデータをJSON形式でエクスポートします。バックアップや他の店舗への移行に使用できます。
              </p>
              <button
                onClick={handleExport}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                メニューデータをエクスポート
              </button>
            </div>

            {/* インポート */}
            <div className="admin-card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary-600" />
                データインポート
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                JSON形式のメニューデータをインポートします。既存のデータは上書きされます。
              </p>
              <div className="space-y-3">
                <label className="btn-secondary flex items-center gap-2 cursor-pointer w-fit">
                  <Upload className="w-4 h-4" />
                  <span>ファイルを選択</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-red-600">
                  ⚠️ 注意: インポートすると現在のデータは失われます。事前にエクスポートしてバックアップを取ることをお勧めします。
                </p>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="admin-card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">現在のデータ統計</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {restaurant.categories.length}
                  </div>
                  <div className="text-sm text-gray-600">カテゴリ</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {restaurant.categories.reduce((sum, cat) => sum + cat.items.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">メニュー項目</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {restaurant.supportedLanguages.length}
                  </div>
                  <div className="text-sm text-gray-600">対応言語</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {restaurant.categories.reduce(
                      (sum, cat) => sum + cat.items.filter(item => item.popular).length,
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">人気メニュー</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
