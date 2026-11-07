const callbacks = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;

function unwatch(element: Element): void {
  if (!callbacks.delete(element)) return;
  observer?.unobserve(element);
  if (callbacks.size === 0) {
    observer?.disconnect();
    observer = null;
  }
}

/**
 * Calls `onEnter` once, when the element enters the viewport. Every caller
 * shares one IntersectionObserver, which only exists while something is waiting.
 * Returns a function that stops watching.
 */
export function watchEntry(element: Element, onEnter: () => void): () => void {
  // No threshold: an element taller than the viewport might never reach one.
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callback = callbacks.get(entry.target);
        unwatch(entry.target);
        callback?.();
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  callbacks.set(element, onEnter);
  observer.observe(element);
  return () => { unwatch(element); };
}
