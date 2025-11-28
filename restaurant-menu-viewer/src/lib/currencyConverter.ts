// 通貨換算ユーティリティ
// 為替レートは2024年の平均的なレートを使用（実際のアプリケーションではAPIから取得することを推奨）

export type SupportedCurrency = 'JPY' | 'USD' | 'EUR' | 'CNY' | 'KRW' | 'THB';

// 基準通貨: JPY（日本円）
// 2024年平均レート（概算）
const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  JPY: 1,           // 日本円（基準）
  USD: 0.0070,      // アメリカドル（1 JPY = 0.007 USD）
  EUR: 0.0065,      // ユーロ（1 JPY = 0.0065 EUR）
  CNY: 0.050,       // 中国元（1 JPY = 0.05 CNY）
  KRW: 9.3,         // 韓国ウォン（1 JPY = 9.3 KRW）
  THB: 0.25,        // タイバーツ（1 JPY = 0.25 THB）
};

// 通貨記号マッピング
const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  JPY: '¥',
  USD: '$',
  EUR: '€',
  CNY: '¥',
  KRW: '₩',
  THB: '฿',
};

/**
 * JPYから他の通貨に換算
 * @param amountInJPY - 日本円での金額
 * @param targetCurrency - 換算先の通貨
 * @returns 換算後の金額（小数点以下2桁まで）
 */
export function convertFromJPY(
  amountInJPY: number,
  targetCurrency: SupportedCurrency
): number {
  const rate = EXCHANGE_RATES[targetCurrency];
  const convertedAmount = amountInJPY * rate;
  
  // 通貨によって丸め方を調整
  if (targetCurrency === 'JPY' || targetCurrency === 'KRW') {
    // 円とウォンは整数
    return Math.round(convertedAmount);
  } else {
    // その他の通貨は小数点2桁
    return Math.round(convertedAmount * 100) / 100;
  }
}

/**
 * 通貨記号を取得
 * @param currency - 通貨コード
 * @returns 通貨記号
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  return CURRENCY_SYMBOLS[currency];
}

/**
 * 通貨付きでフォーマット
 * @param amount - 金額
 * @param currency - 通貨コード
 * @returns フォーマットされた文字列（例: "$10.50", "¥1,500"）
 */
export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const symbol = getCurrencySymbol(currency);
  
  if (currency === 'JPY' || currency === 'KRW') {
    // 日本円と韓国ウォンはカンマ区切りの整数
    return `${symbol}${amount.toLocaleString()}`;
  } else {
    // その他の通貨は小数点2桁
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * JPYから複数の通貨に一括換算
 * @param amountInJPY - 日本円での金額
 * @param currencies - 換算対象の通貨リスト（デフォルト: USD, EUR, CNY, KRW, THB）
 * @returns { currency: formattedAmount } のマップ
 */
export function convertToMultipleCurrencies(
  amountInJPY: number,
  currencies: SupportedCurrency[] = ['USD', 'EUR', 'CNY', 'KRW', 'THB']
): Record<SupportedCurrency, string> {
  const result: Partial<Record<SupportedCurrency, string>> = {};
  
  currencies.forEach(currency => {
    const convertedAmount = convertFromJPY(amountInJPY, currency);
    result[currency] = formatCurrency(convertedAmount, currency);
  });
  
  return result as Record<SupportedCurrency, string>;
}

/**
 * 通貨名を取得（多言語対応）
 * @param currency - 通貨コード
 * @param language - 言語（'ja' or 'en'）
 * @returns 通貨名
 */
export function getCurrencyName(
  currency: SupportedCurrency,
  language: 'ja' | 'en' = 'ja'
): string {
  const names: Record<SupportedCurrency, { ja: string; en: string }> = {
    JPY: { ja: '日本円', en: 'Japanese Yen' },
    USD: { ja: '米ドル', en: 'US Dollar' },
    EUR: { ja: 'ユーロ', en: 'Euro' },
    CNY: { ja: '中国元', en: 'Chinese Yuan' },
    KRW: { ja: '韓国ウォン', en: 'Korean Won' },
    THB: { ja: 'タイバーツ', en: 'Thai Baht' },
  };
  
  return names[currency][language];
}
