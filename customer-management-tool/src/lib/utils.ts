import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy年MM月dd日', { locale: ja });
};

export const formatDatetime = (date: Date): string => {
  return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
};

export const formatRelativeTime = (date: Date): string => {
  return formatDistanceToNow(date, { addSuffix: true, locale: ja });
};

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'bronze':
      return 'bg-amber-600';
    case 'silver':
      return 'bg-gray-400';
    case 'gold':
      return 'bg-yellow-500';
    case 'platinum':
      return 'bg-purple-600';
    default:
      return 'bg-gray-400';
  }
};

export const getTierLabel = (tier: string): string => {
  switch (tier) {
    case 'bronze':
      return 'ブロンズ';
    case 'silver':
      return 'シルバー';
    case 'gold':
      return 'ゴールド';
    case 'platinum':
      return 'プラチナ';
    default:
      return tier;
  }
};

export const getTotalOrderValue = (orderAmount: number, discount: number): number => {
  return orderAmount * (1 - discount / 100);
};
