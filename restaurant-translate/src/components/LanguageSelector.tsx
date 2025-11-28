'use client';

import React from 'react';
import { Language, LANGUAGE_NAMES } from '@/types';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  availableLanguages?: Language[];
}

export default function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  availableLanguages = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko', 'fr'],
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <Globe className="w-5 h-5 text-gray-600" />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="language-selector focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_NAMES[lang].native} ({LANGUAGE_NAMES[lang].english})
          </option>
        ))}
      </select>
    </div>
  );
}
