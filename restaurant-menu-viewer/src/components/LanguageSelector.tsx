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
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md">
      <Globe className="w-5 h-5 text-primary-600" />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="language-selector border-0 focus:outline-none focus:ring-0 bg-transparent cursor-pointer"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_NAMES[lang].native}
          </option>
        ))}
      </select>
    </div>
  );
}
