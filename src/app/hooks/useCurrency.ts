import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, fetchExchangeRates, convertCurrency, ExchangeRates, getCurrencySymbol } from '../utils/currency';

export function useCurrency() {
  const { user } = useAuth();
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const currencyCode = user?.currency || 'USD';

  useEffect(() => {
    const loadRates = async () => {
      const data = await fetchExchangeRates();
      setRates(data);
    };
    loadRates();
  }, []);

  const convertAmount = (amount: number) => {
    if (!rates) return amount;
    return convertCurrency(amount, currencyCode, rates);
  };

  const convertToBase = (amount: number) => {
    if (!rates || currencyCode === 'USD') return amount;
    const rate = rates[currencyCode] || 1;
    return amount / rate;
  };

  const format = (amount: number, shouldConvert: boolean = true) => {
    const value = shouldConvert ? convertAmount(amount) : amount;
    return formatCurrency(value, currencyCode);
  };

  return {
    formatCurrency: format,
    convertAmount,
    convertToBase,
    currencySymbol: getCurrencySymbol(currencyCode),
    currencyCode,
    isLoadingRates: !rates
  };
}
