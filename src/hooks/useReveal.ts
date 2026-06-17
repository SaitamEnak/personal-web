import { useEffect, useRef, useState } from 'react';

type Options = {
  threshold?: number;
  rootMargin?: string;
};

export function useReveal<T extends HTMLElement>(options: Options = {}) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold ?? 0.2,
        rootMargin: options.rootMargin ?? '0px 0px -10% 0px',
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, options.threshold, options.rootMargin]);

  return { ref, revealed };
}
