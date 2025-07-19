import { useState, useEffect } from 'react';
import { apiEndpoints } from '@/config/api';

interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  symbols: Record<string, string>;
}

export function useCurrencyConversion() {
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`${apiEndpoints.currencies || (apiEndpoints.health.replace('/', '/currencies'))}`);
        if (!response.ok) throw new Error('Failed to fetch currency rates');
        const data = await response.json();
        setRates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load currency rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convert = (amount: number, from: string, to: string): number => {
    if (!rates || from === to) return amount;
    
    // Convert to base currency (USD) first
    const usdAmount = from === 'USD' ? amount : amount / (rates.rates[from] || 1);
    
    // Then convert to target currency
    return to === 'USD' ? usdAmount : usdAmount * (rates.rates[to] || 1);
  };

  const getSymbol = (currency: string): string => {
    return rates?.symbols[currency] || '$';
  };

  return { rates, loading, error, convert, getSymbol };
}
