import { useEffect } from 'react';

/** How many active locks hold each body class, so nested owners do not clear each other's class. */
const holders = new Map<string, number>();

/**
 * Adds `className` to `document.body` while `active` and removes it when the
 * last active owner deactivates or unmounts. The class is a styling hook for
 * consumers (for example `body.trazos-drawer-open { overflow: hidden; }`).
 */
export function useBodyScrollLock(active: boolean, className: string): void {
  useEffect(() => {
    if (!active) return;
    holders.set(className, (holders.get(className) ?? 0) + 1);
    document.body.classList.add(className);
    return () => {
      const remaining = (holders.get(className) ?? 1) - 1;
      if (remaining > 0) {
        holders.set(className, remaining);
      } else {
        holders.delete(className);
        document.body.classList.remove(className);
      }
    };
  }, [active, className]);
}
