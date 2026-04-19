import { CapacitorHttp } from '@capacitor/core';
export const CURRENCY_MAP: Record<string, { symbol: string; label: string; locale: string }> = {
  USD: { symbol: '$', label: 'USD ($)', locale: 'en-US' },
  EUR: { symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  GBP: { symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  INR: { symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  JPY: { symbol: '¥', label: 'JPY (¥)', locale: 'ja-JP' },
};

export interface ExchangeRates {
    [key: string]: number;
}

const FALLBACK_RATES: ExchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.3,
    JPY: 155.5,
};

const CACHE_KEY = 'expenzo_exchange_rates';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
    try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { rates, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_EXPIRY) {
                return rates;
            }
        }

        const url = import.meta.env.DEV 
            ? `${window.location.origin}/frankfurter-api/latest?from=USD&symbols=EUR,GBP,INR,JPY` 
            : 'https://api.frankfurter.app/latest?from=USD&symbols=EUR,GBP,INR,JPY';

        const response = await CapacitorHttp.get({ url });
        
        if (response.status < 200 || response.status >= 300) {
            throw new Error('Failed to fetch rates');
        }
        
        const data = response.data;
        const rates = { USD: 1, ...data.rates };
        
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            rates,
            timestamp: Date.now()
        }));

        return rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return FALLBACK_RATES;
    }
};

export const getExchangeRatesSync = (): ExchangeRates => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        return JSON.parse(cached).rates;
    }
    return FALLBACK_RATES;
};

export const convertCurrency = (amount: number, targetCurrency: string, rates: ExchangeRates): number => {
    const rate = rates[targetCurrency] || 1;
    return amount * rate;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const currencyInfo = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.USD;
  
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getCurrencySymbol = (currencyCode: string = 'USD'): string => {
  return CURRENCY_MAP[currencyCode]?.symbol || '$';
};
