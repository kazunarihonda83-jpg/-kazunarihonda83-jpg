'use client';

import React, { useState, useEffect } from 'react';
import { Language, LANGUAGE_NAMES } from '@/types';
import { sampleMenu } from '@/data/sampleMenu';
import { ArrowLeft, TrendingUp, Globe, Eye, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ViewData {
  language: Language;
  menuItemId: string;
  menuItemName: string;
  viewCount: number;
  lastViewed: string;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<ViewData[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // デモ用のアナリティクスデータを生成
    generateDemoAnalytics();
    setIsLoading(false);
  }, [timeRange]);

  const generateDemoAnalytics = () => {
    const demoData: ViewData[] = [];
    const languages: Language[] = ['en', 'zh-CN', 'zh-TW', 'ko', 'fr'];
    
    // 時間範囲に応じて係数を調整
    const multiplier = timeRange === 'day' ? 0.3 : timeRange === 'week' ? 1 : 3;
    
    sampleMenu.categories.forEach(category => {
      category.items.forEach(item => {
        languages.forEach(lang => {
          const baseCount = Math.floor(Math.random() * 300) + 10;
          const viewCount = Math.floor(baseCount * multiplier);
          demoData.push({
            language: lang,
            menuItemId: item.id,
            menuItemName: item.name['ja'],
            viewCount,
            lastViewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        });
      });
    });

    setAnalyticsData(demoData);
  };

  const getTotalViews = () => {
    return analyticsData.reduce((sum, item) => sum + item.viewCount, 0);
  };

  const getViewsByLanguage = () => {
    const languageViews: Record<string, number> = {};
    analyticsData.forEach(item => {
      if (!languageViews[item.language]) {
        languageViews[item.language] = 0;
      }
      languageViews[item.language] += item.viewCount;
    });
    return Object.entries(languageViews)
      .map(([lang, count]) => ({ language: lang as Language, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getTopMenuItems = () => {
    const itemViews: Record<string, { name: string; count: number }> = {};
    analyticsData.forEach(item => {
      if (!itemViews[item.menuItemId]) {
        itemViews[item.menuItemId] = { name: item.menuItemName, count: 0 };
      }
      itemViews[item.menuItemId].count += item.viewCount;
    });
    return Object.entries(itemViews)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getLanguagePercentage = (count: number) => {
    const total = getTotalViews();
    return ((count / total) * 100).toFixed(1);
  };

  const getLanguageFlag = (lang: Language) => {
    const flags: Record<Language, string> = {
      'ja': '🇯🇵',
      'en': '🇬🇧',
      'zh-CN': '🇨🇳',
      'zh-TW': '🇹🇼',
      'ko': '🇰🇷',
      'fr': '🇫🇷',
      'es': '🇪🇸',
      'th': '🇹🇭',
      'vi': '🇻🇳',
    };
    return flags[lang];
  };

  const totalViews = getTotalViews();
  const viewsByLanguage = getViewsByLanguage();
  const topMenuItems = getTopMenuItems();
  const uniqueLanguages = new Set(analyticsData.map(item => item.language)).size;
  const foreignViewsPercentage = ((viewsByLanguage.filter(v => v.language !== 'ja').reduce((sum, v) => sum + v.count, 0) / totalViews) * 100).toFixed(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">アクセス分析</h1>
            </div>

            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    timeRange === range
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {range === 'day' && '今日'}
                  {range === 'week' && '今週'}
                  {range === 'month' && '今月'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">総閲覧数</div>
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {totalViews.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% vs 前期間</span>
            </div>
          </div>

          <div className="stat-card border-green-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">対応言語数</div>
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {uniqueLanguages}
            </div>
            <div className="text-xs text-gray-600">言語で閲覧されています</div>
          </div>

          <div className="stat-card border-yellow-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">人気メニュー</div>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {topMenuItems.length}
            </div>
            <div className="text-xs text-gray-600">上位メニュー項目</div>
          </div>

          <div className="stat-card border-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">外国人客</div>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {foreignViewsPercentage}%
            </div>
            <div className="text-xs text-gray-600">外国語での閲覧率</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 言語別閲覧数 */}
          <div className="admin-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary-600" />
              言語別閲覧数
            </h2>
            <div className="space-y-4">
              {viewsByLanguage.map(({ language, count }) => (
                <div key={language} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getLanguageFlag(language)}</span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {LANGUAGE_NAMES[language].native}
                        </div>
                        <div className="text-xs text-gray-500">
                          {LANGUAGE_NAMES[language].english}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-lg">
                        {count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getLanguagePercentage(count)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getLanguagePercentage(count)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 人気メニュー TOP10 */}
          <div className="admin-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              人気メニュー TOP10
            </h2>
            <div className="space-y-3">
              {topMenuItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                      index === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-300 text-gray-700'
                        : index === 2
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.count.toLocaleString()} views
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary-600">
                      {((item.count / totalViews) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* インサイト */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            📊 インサイト
          </h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <span className="text-green-600 font-bold">✓</span>
              <p>
                <strong>{viewsByLanguage[0]?.language && LANGUAGE_NAMES[viewsByLanguage[0].language].native}</strong>
                での閲覧が最も多く、全体の{' '}
                {viewsByLanguage[0] && getLanguagePercentage(viewsByLanguage[0].count)}%を占めています。
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <span className="text-green-600 font-bold">✓</span>
              <p>
                <strong>{topMenuItems[0]?.name}</strong>が最も人気のメニューで、{' '}
                {topMenuItems[0]?.count.toLocaleString()}回閲覧されています。
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <span className="text-yellow-600 font-bold">⚠</span>
              <p>
                外国語（日本語以外）からのアクセスが{foreignViewsPercentage}%を占めています。
                多言語対応の重要性が高まっています。
              </p>
            </div>
          </div>
        </div>

        {/* 時系列グラフのプレースホルダー */}
        <div className="mt-8 admin-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            閲覧数の推移
          </h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">時系列グラフ</p>
              <p className="text-sm mt-1">Chart.jsやRechartsで実装可能</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
