// 飲食業専用辞書 - 一般翻訳では正確に訳されない専門用語
import { Language } from '@/types';

export const FOOD_DICTIONARY: Record<string, Partial<Record<Language, string>>> = {
  // 出汁・調味料
  '出汁': {
    'en': 'Dashi broth',
    'zh-CN': '高汤',
    'zh-TW': '高湯',
    'ko': '다시 육수',
    'fr': 'Bouillon dashi',
  },
  '味噌': {
    'en': 'Miso (fermented soybean paste)',
    'zh-CN': '味噌',
    'zh-TW': '味噌',
    'ko': '된장',
    'fr': 'Pâte miso',
  },
  '醤油': {
    'en': 'Soy sauce',
    'zh-CN': '酱油',
    'zh-TW': '醬油',
    'ko': '간장',
    'fr': 'Sauce soja',
  },
  'わさび': {
    'en': 'Wasabi (Japanese horseradish)',
    'zh-CN': '芥末',
    'zh-TW': '山葵',
    'ko': '와사비',
    'fr': 'Wasabi',
  },
  
  // 調理法
  '照り焼き': {
    'en': 'Teriyaki (glazed with sweet soy sauce)',
    'zh-CN': '照烧',
    'zh-TW': '照燒',
    'ko': '데리야키',
    'fr': 'Teriyaki',
  },
  '天ぷら': {
    'en': 'Tempura (lightly battered and deep-fried)',
    'zh-CN': '天妇罗',
    'zh-TW': '天婦羅',
    'ko': '튀김',
    'fr': 'Tempura',
  },
  '唐揚げ': {
    'en': 'Karaage (Japanese fried chicken)',
    'zh-CN': '炸鸡',
    'zh-TW': '炸雞',
    'ko': '가라아게',
    'fr': 'Poulet frit japonais',
  },
  '煮物': {
    'en': 'Simmered dish',
    'zh-CN': '炖菜',
    'zh-TW': '燉菜',
    'ko': '조림',
    'fr': 'Plat mijoté',
  },
  '焼き物': {
    'en': 'Grilled dish',
    'zh-CN': '烧烤',
    'zh-TW': '燒烤',
    'ko': '구이',
    'fr': 'Plat grillé',
  },
  
  // 料理名
  '寿司': {
    'en': 'Sushi (vinegared rice with raw fish)',
    'zh-CN': '寿司',
    'zh-TW': '壽司',
    'ko': '스시',
    'fr': 'Sushi',
  },
  '刺身': {
    'en': 'Sashimi (sliced raw fish)',
    'zh-CN': '生鱼片',
    'zh-TW': '生魚片',
    'ko': '사시미',
    'fr': 'Sashimi',
  },
  'ラーメン': {
    'en': 'Ramen (Japanese noodle soup)',
    'zh-CN': '拉面',
    'zh-TW': '拉麵',
    'ko': '라멘',
    'fr': 'Ramen',
  },
  'うどん': {
    'en': 'Udon (thick wheat noodles)',
    'zh-CN': '乌冬面',
    'zh-TW': '烏龍麵',
    'ko': '우동',
    'fr': 'Udon',
  },
  '蕎麦': {
    'en': 'Soba (buckwheat noodles)',
    'zh-CN': '荞麦面',
    'zh-TW': '蕎麥麵',
    'ko': '소바',
    'fr': 'Nouilles soba',
  },
  '丼': {
    'en': 'Donburi (rice bowl)',
    'zh-CN': '盖饭',
    'zh-TW': '蓋飯',
    'ko': '덮밥',
    'fr': 'Bol de riz garni',
  },
  '親子丼': {
    'en': 'Oyakodon (chicken and egg rice bowl)',
    'zh-CN': '亲子盖饭',
    'zh-TW': '親子蓋飯',
    'ko': '오야코동',
    'fr': 'Bol de riz au poulet et œuf',
  },
  '天丼': {
    'en': 'Tendon (tempura rice bowl)',
    'zh-CN': '天妇罗盖饭',
    'zh-TW': '天婦羅蓋飯',
    'ko': '텐동',
    'fr': 'Bol de riz au tempura',
  },
  'カツ丼': {
    'en': 'Katsudon (pork cutlet rice bowl)',
    'zh-CN': '炸猪排盖饭',
    'zh-TW': '炸豬排蓋飯',
    'ko': '카츠동',
    'fr': 'Bol de riz à la côtelette de porc panée',
  },
  '牛丼': {
    'en': 'Gyudon (beef rice bowl)',
    'zh-CN': '牛肉盖饭',
    'zh-TW': '牛肉蓋飯',
    'ko': '규동',
    'fr': 'Bol de riz au bœuf',
  },
  'お好み焼き': {
    'en': 'Okonomiyaki (savory Japanese pancake)',
    'zh-CN': '大阪烧',
    'zh-TW': '大阪燒',
    'ko': '오코노미야키',
    'fr': 'Okonomiyaki',
  },
  'たこ焼き': {
    'en': 'Takoyaki (octopus balls)',
    'zh-CN': '章鱼烧',
    'zh-TW': '章魚燒',
    'ko': '타코야키',
    'fr': 'Takoyaki',
  },
  '焼き鳥': {
    'en': 'Yakitori (grilled chicken skewers)',
    'zh-CN': '烤鸡串',
    'zh-TW': '烤雞串',
    'ko': '야키토리',
    'fr': 'Brochettes de poulet grillé',
  },
  '串焼き': {
    'en': 'Kushiyaki (skewered and grilled)',
    'zh-CN': '烤串',
    'zh-TW': '烤串',
    'ko': '꼬치구이',
    'fr': 'Brochettes grillées',
  },
  'すき焼き': {
    'en': 'Sukiyaki (beef hot pot with sweet soy sauce)',
    'zh-CN': '寿喜烧',
    'zh-TW': '壽喜燒',
    'ko': '스키야키',
    'fr': 'Sukiyaki',
  },
  'しゃぶしゃぶ': {
    'en': 'Shabu-shabu (Japanese hot pot)',
    'zh-CN': '涮涮锅',
    'zh-TW': '涮涮鍋',
    'ko': '샤브샤브',
    'fr': 'Shabu-shabu',
  },
  
  // 食材
  '鰹節': {
    'en': 'Bonito flakes (dried fish flakes)',
    'zh-CN': '鲣鱼片',
    'zh-TW': '柴魚片',
    'ko': '가쓰오부시',
    'fr': 'Flocons de bonite',
  },
  '海苔': {
    'en': 'Nori (dried seaweed)',
    'zh-CN': '海苔',
    'zh-TW': '海苔',
    'ko': '김',
    'fr': 'Algue nori',
  },
  '豆腐': {
    'en': 'Tofu (soybean curd)',
    'zh-CN': '豆腐',
    'zh-TW': '豆腐',
    'ko': '두부',
    'fr': 'Tofu',
  },
  '納豆': {
    'en': 'Natto (fermented soybeans)',
    'zh-CN': '纳豆',
    'zh-TW': '納豆',
    'ko': '낫토',
    'fr': 'Natto',
  },
  '梅干し': {
    'en': 'Umeboshi (pickled plum)',
    'zh-CN': '梅干',
    'zh-TW': '梅乾',
    'ko': '우메보시',
    'fr': 'Prune umeboshi',
  },
  '生姜': {
    'en': 'Ginger',
    'zh-CN': '生姜',
    'zh-TW': '薑',
    'ko': '생강',
    'fr': 'Gingembre',
  },
  'ネギ': {
    'en': 'Green onion / Scallion',
    'zh-CN': '葱',
    'zh-TW': '蔥',
    'ko': '파',
    'fr': 'Oignon vert',
  },
  
  // その他
  '定食': {
    'en': 'Set meal / Combo',
    'zh-CN': '套餐',
    'zh-TW': '套餐',
    'ko': '정식',
    'fr': 'Menu déjeuner',
  },
  'ご飯': {
    'en': 'Steamed rice',
    'zh-CN': '米饭',
    'zh-TW': '米飯',
    'ko': '밥',
    'fr': 'Riz cuit',
  },
  '味噌汁': {
    'en': 'Miso soup',
    'zh-CN': '味噌汤',
    'zh-TW': '味噌湯',
    'ko': '된장국',
    'fr': 'Soupe miso',
  },
  '漬物': {
    'en': 'Pickled vegetables',
    'zh-CN': '腌菜',
    'zh-TW': '醃菜',
    'ko': '절임',
    'fr': 'Légumes marinés',
  },
};

/**
 * 飲食業専用辞書を使用して翻訳を取得
 */
export function getFoodTermTranslation(term: string, targetLang: Language): string | null {
  const translation = FOOD_DICTIONARY[term];
  if (translation && translation[targetLang]) {
    return translation[targetLang];
  }
  return null;
}

/**
 * テキスト内の専門用語を辞書ベースで翻訳
 */
export function translateWithDictionary(text: string, targetLang: Language): string {
  let translatedText = text;
  
  // 辞書内のすべての用語をチェック
  Object.keys(FOOD_DICTIONARY).forEach(term => {
    if (text.includes(term)) {
      const translation = getFoodTermTranslation(term, targetLang);
      if (translation) {
        translatedText = translatedText.replace(new RegExp(term, 'g'), translation);
      }
    }
  });
  
  return translatedText;
}
