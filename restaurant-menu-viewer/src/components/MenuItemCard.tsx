'use client';

import React, { useState } from 'react';
import { MenuItem, Language, ALLERGY_ICONS, DIETARY_ICONS, PortionSize } from '@/types';
import { Volume2, Star, Leaf, AlertCircle, XCircle, Users, Flame } from 'lucide-react';
import { convertToMultipleCurrencies } from '@/lib/currencyConverter';

interface MenuItemCardProps {
  item: MenuItem;
  language: Language;
}

export default function MenuItemCard({ item, language }: MenuItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${price.toLocaleString()}`;
    }
    return `${price} ${currency}`;
  };

  const getPortionSizeLabel = (size: PortionSize | undefined, lang: Language) => {
    if (!size) return null;
    
    const labels: Record<PortionSize, { ja: string; en: string }> = {
      small: { ja: '少量', en: 'Small' },
      medium: { ja: '普通', en: 'Medium' },
      large: { ja: '大盛り', en: 'Large' },
      sharing: { ja: 'シェア向け (2-3人)', en: 'Sharing (2-3 people)' },
    };
    
    return lang === 'ja' ? labels[size].ja : labels[size].en;
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
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(
        `${item.name[language]}. ${item.description[language]}`
      );
      utterance.lang = getVoiceLanguage(language);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
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
  const isSoldOut = item.soldOut || false;
  const isAvailable = item.available !== false && !isSoldOut;

  return (
    <div className={`menu-card overflow-hidden fade-in ${!isAvailable ? 'opacity-75' : ''}`}>
      {/* 画像 */}
      {item.imageUrl && !imageError && (
        <div className="relative h-56 w-full bg-gray-200">
          <img
            src={item.imageUrl}
            alt={item.name[language]}
            className={`w-full h-full object-cover ${!isAvailable ? 'grayscale' : ''}`}
            onError={() => setImageError(true)}
          />
          {/* 売り切れ・提供不可オーバーレイ */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-white mx-auto mb-2" />
                <span className="text-white text-xl font-bold">
                  {isSoldOut 
                    ? (language === 'ja' ? '売り切れ' : 'Sold Out')
                    : (language === 'ja' ? '提供不可' : 'Unavailable')}
                </span>
              </div>
            </div>
          )}
          {/* バッジ */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isSoldOut && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-500 text-white shadow-lg">
                <AlertCircle className="w-4 h-4 mr-1" />
                {language === 'ja' ? '売り切れ' : 'Sold Out'}
              </span>
            )}
            {!isAvailable && !isSoldOut && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-500 text-white shadow-lg">
                <XCircle className="w-4 h-4 mr-1" />
                {language === 'ja' ? '提供不可' : 'Unavailable'}
              </span>
            )}
            {isAvailable && item.popular && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-400 text-yellow-900 shadow-lg">
                <Star className="w-4 h-4 mr-1" fill="currentColor" />
                {language === 'ja' ? '人気' : 'Popular'}
              </span>
            )}
            {isAvailable && item.seasonal && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-400 text-green-900 shadow-lg">
                <Leaf className="w-4 h-4 mr-1" />
                {language === 'ja' ? '季節限定' : 'Seasonal'}
              </span>
            )}
            {item.stock !== undefined && item.stock <= 10 && item.stock > 0 && isAvailable && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-400 text-orange-900 shadow-lg">
                <AlertCircle className="w-4 h-4 mr-1" />
                {language === 'ja' ? `残り${item.stock}` : `${item.stock} left`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* コンテンツ */}
      <div className="p-5">
        {/* タイトルと音声ボタン */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-2xl font-bold text-gray-900 flex-1 leading-tight">
            {item.name[language] || item.name['ja']}
          </h3>
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`ml-3 p-3 rounded-full transition-all ${
              isSpeaking
                ? 'bg-primary-600 text-white'
                : 'text-primary-600 hover:bg-primary-50'
            }`}
            title={language === 'ja' ? '音声で聞く' : 'Listen'}
          >
            <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* 説明 */}
        <p className="text-gray-700 mb-5 text-base leading-relaxed">
          {item.description[language] || item.description['ja']}
        </p>

        {/* ポーション量 */}
        {item.portionSize && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg border border-purple-300">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {getPortionSizeLabel(item.portionSize, language)}
              </span>
            </div>
          </div>
        )}

        {/* 調理法と辛さレベル */}
        {(item.cookingMethod || (item.spicyLevel !== undefined && item.spicyLevel > 0)) && (
          <div className="mb-4 flex flex-wrap gap-3 items-center">
            {item.cookingMethod && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-medium">{item.cookingMethod[language] || item.cookingMethod['ja']}</span>
              </div>
            )}
            {item.spicyLevel !== undefined && item.spicyLevel > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-300">
                <Flame className="w-4 h-4" />
                <span className="text-lg font-bold">
                  {'🌶️'.repeat(item.spicyLevel)}
                </span>
                <span className="text-sm font-semibold">
                  {language === 'ja' ? `辛さ ${item.spicyLevel}` : `Spicy Lv.${item.spicyLevel}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* アレルギー情報 */}
        {allergyList.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {language === 'ja' ? 'アレルギー情報' : 'Allergens'}
            </p>
            <div className="flex flex-wrap gap-2">
              {allergyList.map((allergyKey) => (
                <span key={allergyKey} className="allergy-badge">
                  {ALLERGY_ICONS[allergyKey]} {allergyKey}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 食事制限対応 */}
        {dietaryList.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {language === 'ja' ? '食事制限対応' : 'Dietary Options'}
            </p>
            <div className="flex flex-wrap gap-2">
              {dietaryList.map((dietaryKey) => (
                <span key={dietaryKey} className="dietary-badge">
                  {DIETARY_ICONS[dietaryKey]} {dietaryKey}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 価格 */}
        <div className="pt-4 border-t-2 border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="price-tag">{formatPrice(item.price, item.currency)}</span>
          </div>
          
          {/* 通貨換算表示 */}
          {item.currency === 'JPY' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                {language === 'ja' ? '他の通貨で表示' : 'Other Currencies'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(() => {
                  const converted = convertToMultipleCurrencies(item.price);
                  return (
                    <>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-gray-600 font-medium">🇺🇸 USD</span>
                        <span className="text-gray-900 font-bold">{converted.USD}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-gray-600 font-medium">🇪🇺 EUR</span>
                        <span className="text-gray-900 font-bold">{converted.EUR}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-gray-600 font-medium">🇨🇳 CNY</span>
                        <span className="text-gray-900 font-bold">{converted.CNY}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-gray-600 font-medium">🇰🇷 KRW</span>
                        <span className="text-gray-900 font-bold">{converted.KRW}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded col-span-2">
                        <span className="text-gray-600 font-medium">🇹🇭 THB</span>
                        <span className="text-gray-900 font-bold">{converted.THB}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
