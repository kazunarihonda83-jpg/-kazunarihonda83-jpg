'use client';

import React, { useState } from 'react';
import { MenuItem, Language, ALLERGY_ICONS, DIETARY_ICONS } from '@/types';
import { Volume2, Star, Leaf } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  language: Language;
  onSpeakClick?: (text: string, language: Language) => void;
}

export default function MenuItemCard({ item, language, onSpeakClick }: MenuItemCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${price.toLocaleString()}`;
    }
    return `${price} ${currency}`;
  };

  const getAllergyList = () => {
    return Object.entries(item.allergies)
      .filter(([_, hasAllergy]) => hasAllergy)
      .map(([allergyKey]) => allergyKey as keyof typeof ALLERGY_ICONS);
  };

  const getDietaryList = () => {
    return Object.entries(item.dietary)
      .filter(([_, isDietary]) => isDietary)
      .map(([dietaryKey]) => dietaryKey as keyof typeof DIETARY_ICONS);
  };

  const handleSpeak = () => {
    if (onSpeakClick) {
      const textToSpeak = `${item.name[language]}. ${item.description[language]}`;
      onSpeakClick(textToSpeak, language);
    } else {
      // Web Speech API を直接使用
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `${item.name[language]}. ${item.description[language]}`
        );
        utterance.lang = getVoiceLanguage(language);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const getVoiceLanguage = (lang: Language): string => {
    const voiceLangMap: Record<Language, string> = {
      'ja': 'ja-JP',
      'en': 'en-US',
      'zh-CN': 'zh-CN',
      'zh-TW': 'zh-TW',
      'ko': 'ko-KR',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'th': 'th-TH',
      'vi': 'vi-VN',
    };
    return voiceLangMap[lang];
  };

  const allergyList = getAllergyList();
  const dietaryList = getDietaryList();

  return (
    <div className="menu-card overflow-hidden">
      {/* 画像 */}
      {item.imageUrl && !imageError && (
        <div className="relative h-48 w-full bg-gray-200">
          <img
            src={item.imageUrl}
            alt={item.name[language]}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {/* バッジ */}
          <div className="absolute top-2 left-2 flex gap-2">
            {item.popular && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
                <Star className="w-3 h-3 mr-1" fill="currentColor" />
                Popular
              </span>
            )}
            {item.seasonal && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-400 text-green-900">
                <Leaf className="w-3 h-3 mr-1" />
                Seasonal
              </span>
            )}
          </div>
        </div>
      )}

      {/* コンテンツ */}
      <div className="p-4">
        {/* タイトルと音声ボタン */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 flex-1">
            {item.name[language] || item.name['ja']}
          </h3>
          <button
            onClick={handleSpeak}
            className="ml-2 p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
            title="音声で聞く / Listen"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* 説明 */}
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {item.description[language] || item.description['ja']}
        </p>

        {/* 調理法と辛さレベル */}
        {(item.cookingMethod || item.spicyLevel !== undefined) && (
          <div className="mb-4 text-sm text-gray-500 flex gap-4">
            {item.cookingMethod && (
              <span>🔥 {item.cookingMethod[language] || item.cookingMethod['ja']}</span>
            )}
            {item.spicyLevel !== undefined && item.spicyLevel > 0 && (
              <span>
                🌶️ {'🌶️'.repeat(item.spicyLevel)}
              </span>
            )}
          </div>
        )}

        {/* アレルギー情報 */}
        {allergyList.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">
              {language === 'ja' ? 'アレルギー情報:' : 'Allergens:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {allergyList.map((allergyKey) => (
                <span key={allergyKey} className="allergy-badge" title={allergyKey}>
                  {ALLERGY_ICONS[allergyKey]} {allergyKey}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 食事制限対応 */}
        {dietaryList.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">
              {language === 'ja' ? '食事制限対応:' : 'Dietary:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {dietaryList.map((dietaryKey) => (
                <span key={dietaryKey} className="dietary-badge" title={dietaryKey}>
                  {DIETARY_ICONS[dietaryKey]} {dietaryKey}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 価格 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="price-tag">{formatPrice(item.price, item.currency)}</span>
        </div>
      </div>
    </div>
  );
}
