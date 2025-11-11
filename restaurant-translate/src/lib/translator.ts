// 翻訳エンジン - 飲食業専用辞書 + フォールバック翻訳
import { Language } from '@/types';
import { translateWithDictionary, getFoodTermTranslation } from './foodDictionary';

/**
 * シンプルな翻訳マップ（デモ用）
 * 実際の実装では Google Translate API や DeepL API を使用
 */
const BASIC_TRANSLATIONS: Record<string, Partial<Record<Language, string>>> = {
  // 基本フレーズ
  'こんにちは': {
    'en': 'Hello',
    'zh-CN': '你好',
    'zh-TW': '你好',
    'ko': '안녕하세요',
    'fr': 'Bonjour',
  },
  'ありがとうございます': {
    'en': 'Thank you',
    'zh-CN': '谢谢',
    'zh-TW': '謝謝',
    'ko': '감사합니다',
    'fr': 'Merci',
  },
  'いらっしゃいませ': {
    'en': 'Welcome',
    'zh-CN': '欢迎光临',
    'zh-TW': '歡迎光臨',
    'ko': '어서오세요',
    'fr': 'Bienvenue',
  },
  
  // メニュー関連
  '前菜': {
    'en': 'Appetizer',
    'zh-CN': '前菜',
    'zh-TW': '前菜',
    'ko': '애피타이저',
    'fr': 'Entrée',
  },
  'メイン': {
    'en': 'Main Course',
    'zh-CN': '主菜',
    'zh-TW': '主菜',
    'ko': '메인 요리',
    'fr': 'Plat principal',
  },
  'デザート': {
    'en': 'Dessert',
    'zh-CN': '甜点',
    'zh-TW': '甜點',
    'ko': '디저트',
    'fr': 'Dessert',
  },
  '飲み物': {
    'en': 'Drinks',
    'zh-CN': '饮料',
    'zh-TW': '飲料',
    'ko': '음료',
    'fr': 'Boissons',
  },
  
  // アレルギー関連
  '卵': {
    'en': 'Egg',
    'zh-CN': '鸡蛋',
    'zh-TW': '雞蛋',
    'ko': '계란',
    'fr': 'Œuf',
  },
  '乳': {
    'en': 'Dairy',
    'zh-CN': '乳制品',
    'zh-TW': '乳製品',
    'ko': '유제품',
    'fr': 'Produits laitiers',
  },
  '小麦': {
    'en': 'Wheat',
    'zh-CN': '小麦',
    'zh-TW': '小麥',
    'ko': '밀',
    'fr': 'Blé',
  },
  '甲殻類': {
    'en': 'Shellfish',
    'zh-CN': '贝类',
    'zh-TW': '貝類',
    'ko': '갑각류',
    'fr': 'Fruits de mer',
  },
  '豚肉': {
    'en': 'Pork',
    'zh-CN': '猪肉',
    'zh-TW': '豬肉',
    'ko': '돼지고기',
    'fr': 'Porc',
  },
  '牛肉': {
    'en': 'Beef',
    'zh-CN': '牛肉',
    'zh-TW': '牛肉',
    'ko': '소고기',
    'fr': 'Bœuf',
  },
  '鶏肉': {
    'en': 'Chicken',
    'zh-CN': '鸡肉',
    'zh-TW': '雞肉',
    'ko': '닭고기',
    'fr': 'Poulet',
  },
  
  // 食事制限
  'ベジタリアン': {
    'en': 'Vegetarian',
    'zh-CN': '素食',
    'zh-TW': '素食',
    'ko': '채식주의자',
    'fr': 'Végétarien',
  },
  'ビーガン': {
    'en': 'Vegan',
    'zh-CN': '纯素',
    'zh-TW': '純素',
    'ko': '비건',
    'fr': 'Végétalien',
  },
  'ハラール': {
    'en': 'Halal',
    'zh-CN': '清真',
    'zh-TW': '清真',
    'ko': '할랄',
    'fr': 'Halal',
  },
  'グルテンフリー': {
    'en': 'Gluten-free',
    'zh-CN': '无麸质',
    'zh-TW': '無麩質',
    'ko': '글루텐 프리',
    'fr': 'Sans gluten',
  },
};

/**
 * メインの翻訳関数
 * 1. 飲食業専用辞書を優先
 * 2. 基本翻訳マップを使用
 * 3. 見つからない場合は元のテキストを返す
 */
export async function translate(text: string, targetLang: Language, sourceLang: Language = 'ja'): Promise<string> {
  // ソース言語とターゲット言語が同じ場合はそのまま返す
  if (sourceLang === targetLang) {
    return text;
  }
  
  // 空文字列チェック
  if (!text || text.trim() === '') {
    return text;
  }
  
  // 1. 飲食業専用辞書をチェック
  const dictionaryTranslation = translateWithDictionary(text, targetLang);
  if (dictionaryTranslation !== text) {
    return dictionaryTranslation;
  }
  
  // 2. 基本翻訳マップをチェック
  const basicTranslation = BASIC_TRANSLATIONS[text];
  if (basicTranslation && basicTranslation[targetLang]) {
    return basicTranslation[targetLang];
  }
  
  // 3. 実際の実装ではここで Google Translate API を呼び出す
  // デモでは簡易的な翻訳を返す
  return simulateTranslation(text, targetLang);
}

/**
 * バッチ翻訳（複数テキストを一度に翻訳）
 */
export async function translateBatch(
  texts: string[],
  targetLang: Language,
  sourceLang: Language = 'ja'
): Promise<string[]> {
  return Promise.all(texts.map(text => translate(text, targetLang, sourceLang)));
}

/**
 * 翻訳のシミュレーション（デモ用）
 */
function simulateTranslation(text: string, targetLang: Language): string {
  // 実際のAPIでは、ここでGoogle Translate APIなどを呼び出す
  const simpleTranslations: Partial<Record<Language, string>> = {
    'en': `[EN] ${text}`,
    'zh-CN': `[简] ${text}`,
    'zh-TW': `[繁] ${text}`,
    'ko': `[한] ${text}`,
    'fr': `[FR] ${text}`,
    'es': `[ES] ${text}`,
    'th': `[TH] ${text}`,
    'vi': `[VI] ${text}`,
  };
  
  return simpleTranslations[targetLang] || text;
}

/**
 * 言語検出（簡易版）
 */
export function detectLanguage(text: string): Language {
  // 簡易的な言語検出
  // 実際の実装では言語検出APIを使用
  
  // 日本語文字の検出
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
    return 'ja';
  }
  
  // 韓国語文字の検出
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) {
    return 'ko';
  }
  
  // 中国語文字の検出
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return 'zh-CN';
  }
  
  // タイ語文字の検出
  if (/[\u0E00-\u0E7F]/.test(text)) {
    return 'th';
  }
  
  // ベトナム語特有の文字
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(text)) {
    return 'vi';
  }
  
  // デフォルトは英語
  return 'en';
}

/**
 * カスタム翻訳の保存（ローカルストレージ）
 */
export function saveCustomTranslation(original: string, language: Language, translation: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `custom_translation_${language}`;
  const stored = localStorage.getItem(key);
  const customTranslations = stored ? JSON.parse(stored) : {};
  
  customTranslations[original] = translation;
  localStorage.setItem(key, JSON.stringify(customTranslations));
}

/**
 * カスタム翻訳の取得
 */
export function getCustomTranslation(original: string, language: Language): string | null {
  if (typeof window === 'undefined') return null;
  
  const key = `custom_translation_${language}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) return null;
  
  const customTranslations = JSON.parse(stored);
  return customTranslations[original] || null;
}
