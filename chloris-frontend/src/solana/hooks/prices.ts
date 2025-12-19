import { useState, useEffect } from 'react';

export function useNCTPriceInSOL() {
  const [priceInSOL, setPriceInSOL] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=toucan-protocol-nature-carbon-tonne,solana&vs_currencies=usd'
      );
      const data = await res.json();

      const nctUsd = data['toucan-protocol-nature-carbon-tonne']?.usd;
      const solUsd = data['solana']?.usd;

      if (nctUsd && solUsd && solUsd > 0) {
        setPriceInSOL(nctUsd / solUsd);
      } else {
        setError('Invalid price data');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch prices');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return { priceInSOL, loading, error };
}