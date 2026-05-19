import { useEffect, useState } from 'react';

export function useLocalStorage(
  key,
  initialValue
) {
  const [value, setValue] =
    useState(() => {
      try {
        const stored =
          window.localStorage.getItem(
            key
          );

        return stored
          ? JSON.parse(stored)
          : initialValue;
      } catch (error) {
        console.error(
          `Error reading localStorage key "${key}":`,
          error
        );

        return initialValue;
      }
    });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error(
        `Error saving localStorage key "${key}":`,
        error
      );
    }
  }, [key, value]);

  const removeValue = () => {
    try {
      window.localStorage.removeItem(
        key
      );

      setValue(initialValue);
    } catch (error) {
      console.error(
        `Error removing localStorage key "${key}":`,
        error
      );
    }
  };

  return [
    value,
    setValue,
    removeValue,
  ];
}