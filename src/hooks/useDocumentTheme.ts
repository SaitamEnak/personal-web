import { useEffect, useState } from 'react';
import type { Theme } from './useTheme';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Mirrors the `data-theme` attribute on <html> — the one the pre-paint script
 * in index.html writes and `useTheme` keeps updated. Components that need the
 * active theme as a value (rather than as a CSS selector) read it from here
 * instead of `prefers-color-scheme`, so a manual override still wins.
 */
export function useDocumentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    setTheme(readTheme());

    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
