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

/* Theme ------------------------------------------------------------------- */

const systemDark = '(prefers-color-scheme: dark)';
let stopWatchingTheme = null;

function isTheme(value) {
    return value === 'light' || value === 'dark';
}

function readStoredTheme(key) {
    try {
        const value = localStorage.getItem(key);
        return isTheme(value) ? value : null;
    } catch {
        return null;
    }
}

function systemTheme() {
    return window.matchMedia(systemDark).matches ? 'dark' : 'light';
}

function applyTheme(theme, colors) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[theme]);
}

function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Reports the theme to .NET whenever it changes. The data-theme attribute on <html> is
 * the source of truth, which keeps it in sync with trazos-theme.js and other tabs.
 * Returns the current theme.
 */
export function watchTheme(dotnet, key, colors) {
    stopWatchingTheme?.();
    const root = document.documentElement;
    if (!root.hasAttribute('data-theme')) applyTheme(readStoredTheme(key) ?? systemTheme(), colors);

    const observer = new MutationObserver(() => dotnet.invokeMethodAsync('OnThemeChanged', currentTheme()));
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    const media = window.matchMedia(systemDark);
    const onSystemChange = (event) => {
        if (readStoredTheme(key) === null) applyTheme(event.matches ? 'dark' : 'light', colors);
    };
    media.addEventListener('change', onSystemChange);

    const onStorage = (event) => {
        if (event.key === key) applyTheme(isTheme(event.newValue) ? event.newValue : systemTheme(), colors);
    };
    window.addEventListener('storage', onStorage);

    stopWatchingTheme = () => {
        observer.disconnect();
        media.removeEventListener('change', onSystemChange);
        window.removeEventListener('storage', onStorage);
        stopWatchingTheme = null;
    };
    return currentTheme();
}

export function unwatchTheme() {
    stopWatchingTheme?.();
}

/** Applies a theme and remembers it, so the system no longer decides. */
export function setTheme(theme, key, colors) {
    applyTheme(theme, colors);
    try {
        localStorage.setItem(key, theme);
    } catch {
        // Storage is unavailable, so the choice only lasts for this visit.
    }
}

/* Site header ------------------------------------------------------------- */

const scrolledAfterPx = 12;
const siteHeaders = new Map();

/**
 * Marks the header once the page scrolled, without a .NET call per scroll event, and
 * closes the open menu on Escape, returning focus to the menu button.
 */
export function watchSiteHeader(header, dotnet) {
    const onScroll = () => header.toggleAttribute('data-trazos-scrolled', window.scrollY > scrolledAfterPx);
    const onKeyDown = (event) => {
        if (event.key !== 'Escape' || header.querySelector('.trazos-site-header-nav-open') === null) return;
        dotnet.invokeMethodAsync('CloseMenu');
        header.querySelector('.trazos-site-header-toggle')?.focus();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    siteHeaders.set(header, () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('keydown', onKeyDown);
    });
}

export function unwatchSiteHeader(header) {
    siteHeaders.get(header)?.();
    siteHeaders.delete(header);
}

/* Scroll spy -------------------------------------------------------------- */

const scrollSpies = new Map();
let nextScrollSpy = 1;

/** Reports the id of the section that crosses the middle of the viewport. Returns a handle. */
export function watchScrollSpy(dotnet, ids) {
    if (typeof IntersectionObserver === 'undefined') return 0;
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) dotnet.invokeMethodAsync('OnActiveChanged', entry.target.id);
        }
    }, { rootMargin: '-45% 0px -50% 0px' });
    for (const id of ids) {
        const section = document.getElementById(id);
        if (section !== null) observer.observe(section);
    }
    const handle = nextScrollSpy++;
    scrollSpies.set(handle, observer);
    return handle;
}

export function unwatchScrollSpy(handle) {
    scrollSpies.get(handle)?.disconnect();
    scrollSpies.delete(handle);
}
