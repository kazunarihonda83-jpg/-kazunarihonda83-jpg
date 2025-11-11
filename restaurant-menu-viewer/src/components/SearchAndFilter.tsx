'use client';

import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Language } from '@/types';

export interface FilterOptions {
  searchQuery: string;
  priceRange: [number, number];
  hideAllergens: string[];
  dietaryFilters: string[];
  showAvailableOnly: boolean;
}

interface SearchAndFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  language: Language;
}

export default function SearchAndFilter({
  filters,
  onFilterChange,
  language,
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const allergenOptions = [
    { key: 'egg', label: language === 'ja' ? '卵' : 'Egg', icon: '🥚' },
    { key: 'milk', label: language === 'ja' ? '乳製品' : 'Milk', icon: '🥛' },
    { key: 'wheat', label: language === 'ja' ? '小麦' : 'Wheat', icon: '🌾' },
    { key: 'shellfish', label: language === 'ja' ? '甲殻類' : 'Shellfish', icon: '🦐' },
    { key: 'pork', label: language === 'ja' ? '豚肉' : 'Pork', icon: '🐷' },
    { key: 'beef', label: language === 'ja' ? '牛肉' : 'Beef', icon: '🐮' },
    { key: 'chicken', label: language === 'ja' ? '鶏肉' : 'Chicken', icon: '🐔' },
    { key: 'peanuts', label: language === 'ja' ? 'ピーナッツ' : 'Peanuts', icon: '🥜' },
    { key: 'soy', label: language === 'ja' ? '大豆' : 'Soy', icon: '🫘' },
  ];

  const dietaryOptions = [
    { key: 'vegetarian', label: language === 'ja' ? 'ベジタリアン' : 'Vegetarian', icon: '🥗' },
    { key: 'vegan', label: language === 'ja' ? 'ヴィーガン' : 'Vegan', icon: '🌱' },
    { key: 'halal', label: language === 'ja' ? 'ハラール' : 'Halal', icon: '☪️' },
    { key: 'glutenFree', label: language === 'ja' ? 'グルテンフリー' : 'Gluten-Free', icon: '🚫🌾' },
    { key: 'kosher', label: language === 'ja' ? 'コーシャー' : 'Kosher', icon: '✡️' },
  ];

  const toggleAllergen = (allergen: string) => {
    const newAllergens = filters.hideAllergens.includes(allergen)
      ? filters.hideAllergens.filter(a => a !== allergen)
      : [...filters.hideAllergens, allergen];
    
    onFilterChange({ ...filters, hideAllergens: newAllergens });
  };

  const toggleDietary = (dietary: string) => {
    const newDietary = filters.dietaryFilters.includes(dietary)
      ? filters.dietaryFilters.filter(d => d !== dietary)
      : [...filters.dietaryFilters, dietary];
    
    onFilterChange({ ...filters, dietaryFilters: newDietary });
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      priceRange: [0, 10000],
      hideAllergens: [],
      dietaryFilters: [],
      showAvailableOnly: false,
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.hideAllergens.length > 0 ||
    filters.dietaryFilters.length > 0 ||
    filters.showAvailableOnly ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 10000;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* 検索バー */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={language === 'ja' ? 'メニューを検索...' : 'Search menu...'}
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            showFilters || hasActiveFilters
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-5 h-5" />
          {language === 'ja' ? 'フィルター' : 'Filters'}
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-white text-primary-600 rounded-full text-xs font-bold">
              {filters.hideAllergens.length + filters.dietaryFilters.length + (filters.showAvailableOnly ? 1 : 0)}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-6">
          {/* 価格帯フィルター */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              {language === 'ja' ? '価格帯' : 'Price Range'}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => onFilterChange({
                  ...filters,
                  priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]
                })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="¥0"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => onFilterChange({
                  ...filters,
                  priceRange: [filters.priceRange[0], parseInt(e.target.value) || 10000]
                })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="¥10000"
              />
            </div>
          </div>

          {/* アレルゲン除外フィルター */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              {language === 'ja' ? '除外するアレルゲン' : 'Hide Allergens'}
            </label>
            <div className="flex flex-wrap gap-2">
              {allergenOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => toggleAllergen(option.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.hideAllergens.includes(option.key)
                      ? 'bg-red-100 text-red-800 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 食事制限フィルター */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              {language === 'ja' ? '食事制限' : 'Dietary Preferences'}
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => toggleDietary(option.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.dietaryFilters.includes(option.key)
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 提供可能なメニューのみ表示 */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showAvailableOnly}
                onChange={(e) => onFilterChange({ ...filters, showAvailableOnly: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {language === 'ja' ? '提供可能なメニューのみ表示' : 'Show available items only'}
              </span>
            </label>
          </div>

          {/* フィルタークリアボタン */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <X className="w-4 h-4" />
                {language === 'ja' ? 'フィルターをクリア' : 'Clear Filters'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
