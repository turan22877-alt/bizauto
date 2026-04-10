import { CURRENCY_SYMBOLS } from '../types';

export const useCurrency = (currency = 'RUB') => {
  const formatPrice = (amount) => {
    const symbol = CURRENCY_SYMBOLS[currency];
    const formatted = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${formatted} ${symbol}`;
  };

  return { formatPrice, symbol: CURRENCY_SYMBOLS[currency] };
};