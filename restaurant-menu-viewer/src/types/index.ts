// 型定義ファイル

export type Language = 'ja' | 'en' | 'zh-CN' | 'zh-TW' | 'ko' | 'fr' | 'es' | 'th' | 'vi';

export interface Translation {
  [key: string]: string;
}

export interface AllergyInfo {
  egg: boolean;
  milk: boolean;
  wheat: boolean;
  shellfish: boolean;
  pork: boolean;
  beef: boolean;
  chicken: boolean;
  peanuts: boolean;
  soy: boolean;
}

export interface DietaryRestrictions {
  vegetarian: boolean;
  vegan: boolean;
  halal: boolean;
  glutenFree: boolean;
  kosher: boolean;
}

export type PortionSize = 'small' | 'medium' | 'large' | 'sharing';

export interface MenuItem {
  id: string;
  name: Translation;
  description: Translation;
  price: number;
  currency: string;
  category: string;
  imageUrl?: string;
  allergies: AllergyInfo;
  dietary: DietaryRestrictions;
  cookingMethod?: Translation;
  spicyLevel?: number; // 0-5 (0=not spicy, 5=very spicy)
  portionSize?: PortionSize; // Small/Medium/Large/Sharing
  popular?: boolean;
  seasonal?: boolean;
  // 在庫管理フィールド
  stock?: number; // 在庫数（undefined = 無制限）
  available?: boolean; // 提供可能かどうか（デフォルト: true）
  soldOut?: boolean; // 売り切れフラグ
}

export interface MenuCategory {
  id: string;
  name: Translation;
  description?: Translation;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  description: Translation;
  address: Translation;
  phone: string;
  email: string;
  categories: MenuCategory[];
  supportedLanguages: Language[];
}

export interface AnalyticsData {
  menuItemId: string;
  language: Language;
  viewCount: number;
  timestamp: number;
}

export interface CustomTranslation {
  original: string;
  language: Language;
  customTranslation: string;
  approved: boolean;
}

export const LANGUAGE_NAMES: Record<Language, { native: string; english: string }> = {
  'ja': { native: '日本語', english: 'Japanese' },
  'en': { native: 'English', english: 'English' },
  'zh-CN': { native: '简体中文', english: 'Simplified Chinese' },
  'zh-TW': { native: '繁體中文', english: 'Traditional Chinese' },
  'ko': { native: '한국어', english: 'Korean' },
  'fr': { native: 'Français', english: 'French' },
  'es': { native: 'Español', english: 'Spanish' },
  'th': { native: 'ไทย', english: 'Thai' },
  'vi': { native: 'Tiếng Việt', english: 'Vietnamese' },
};

export const ALLERGY_ICONS: Record<keyof AllergyInfo, string> = {
  egg: '🥚',
  milk: '🥛',
  wheat: '🌾',
  shellfish: '🦐',
  pork: '🐷',
  beef: '🐮',
  chicken: '🐔',
  peanuts: '🥜',
  soy: '🫘',
};

export const DIETARY_ICONS: Record<keyof DietaryRestrictions, string> = {
  vegetarian: '🥗',
  vegan: '🌱',
  halal: '☪️',
  glutenFree: '🚫🌾',
  kosher: '✡️',
};
