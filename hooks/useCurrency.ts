import { Currency, CURRENCY_SYMBOLS } from '../types';

export const useCurrency = (currency: Currency = 'RUB') => {
  const formatPrice = (amount: number): string => {
    const symbol = CURRENCY_SYMBOLS[currency];
    const formatted = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${formatted} ${symbol}`;
  };

  return { formatPrice, symbol: CURRENCY_SYMBOLS[currency] };
};
