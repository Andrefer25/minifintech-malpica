import { useState } from 'react';

export function usePageSize(
  key: string,
  options: number[],
  defaultValue: number,
): [number, (size: number) => void] {
  const [size, setSize] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = Number(stored);
        if (options.includes(parsed)) return parsed;
      }
    } catch {
    }
    return defaultValue;
  });

  function updateSize(newSize: number) {
    setSize(newSize);
    try {
      localStorage.setItem(key, String(newSize));
    } catch {
    }
  }

  return [size, updateSize];
}
