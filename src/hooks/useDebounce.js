import { useEffect, useState } from 'react';

export function useDebounce(
  value,
  delay = 400
) {
  const [debouncedValue, setDebouncedValue] =
    useState(value);

  const [isDebouncing, setIsDebouncing] =
    useState(false);

  useEffect(() => {
    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return {
    debouncedValue,
    isDebouncing,
  };
}