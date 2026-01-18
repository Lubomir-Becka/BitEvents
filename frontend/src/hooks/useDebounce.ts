import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Nastav timeout pre zmenu hodnoty
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup funkcia - zruš predchádzajúci timeout
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
