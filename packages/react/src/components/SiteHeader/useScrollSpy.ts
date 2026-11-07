import { useEffect, useState } from 'react';

/** Returns the id of the section that crosses the middle of the viewport, for one-page sites. */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  // Hosts often pass a new array on each render, so the effect depends on its contents.
  const key = JSON.stringify(ids);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of JSON.parse(key) as string[]) {
      const section = document.getElementById(id);
      if (section !== null) observer.observe(section);
    }
    return () => {
      observer.disconnect();
    };
  }, [key]);

  return active;
}
