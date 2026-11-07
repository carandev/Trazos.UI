// JavaScript behind the Trazos.UI components, loaded on demand as an ES module.

/* Reveal ------------------------------------------------------------------ */

const revealState = 'data-trazos-reveal';
const revealCallbacks = new Map();
let revealObserver = null;

function canAnimate() {
    if (typeof IntersectionObserver === 'undefined') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isInViewport(element) {
    const { top, bottom } = element.getBoundingClientRect();
    return top < window.innerHeight && bottom > 0;
}

export function unwatchReveal(element) {
    if (!revealCallbacks.delete(element)) return;
    revealObserver?.unobserve(element);
    if (revealCallbacks.size === 0) {
        revealObserver?.disconnect();
        revealObserver = null;
    }
}

/**
 * Hides content below the fold until it scrolls into view. Only this function hides
 * anything, so content is visible without JavaScript and content already on screen
 * does not flash. Every element shares one observer, which only exists while
 * something is waiting. Blazor does not manage the attribute, so re-renders keep it.
 */
export function watchReveal(element) {
    if (!canAnimate()) return;
    const state = element.getAttribute(revealState);
    if (state === 'visible' || (state === null && isInViewport(element))) return;
    element.setAttribute(revealState, 'pending');

    // No threshold: an element taller than the viewport might never reach one.
    revealObserver ??= new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const reveal = revealCallbacks.get(entry.target);
            unwatchReveal(entry.target);
            reveal?.();
        }
    }, { rootMargin: '0px 0px -10% 0px' });
    revealCallbacks.set(element, () => element.setAttribute(revealState, 'visible'));
    revealObserver.observe(element);
}

/* Clipboard --------------------------------------------------------------- */

/** Rejects when the clipboard API is missing, as on insecure origins, or refuses. */
export async function copyText(value) {
    if (navigator.clipboard === undefined) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(value);
}

/* Focus ------------------------------------------------------------------- */

/** Moves focus to an element, which a link intercepted by the Blazor router does not do. */
export function focusById(id) {
    const element = document.getElementById(id);
    if (element === null) return;
    if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
    element.focus();
}
