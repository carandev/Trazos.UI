import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { createThemeScript, DEFAULT_THEME_COLORS } from './theme';
import { useTheme } from './useTheme';
import { expectNoA11yViolations } from '../../../test/a11y';

type ChangeListener = (event: { matches: boolean }) => void;

let systemDark = false;
const mediaListeners = new Set<ChangeListener>();

function stubSystem() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return systemDark;
    },
    media: query,
    addEventListener: (_type: string, listener: ChangeListener) => mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: ChangeListener) => mediaListeners.delete(listener),
  }));
}

function setSystem(dark: boolean) {
  systemDark = dark;
  for (const listener of mediaListeners) listener({ matches: dark });
}

function themeColorMeta(): HTMLMetaElement {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  document.head.append(meta);
  return meta;
}

function runScript(script: string) {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- it runs the exact text a host inlines in <head>.
  (new Function(script) as () => void)();
}

const root = document.documentElement;

beforeEach(() => {
  systemDark = false;
  mediaListeners.clear();
  localStorage.clear();
  delete root.dataset.theme;
  stubSystem();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.remove();
  });
});

describe('useTheme', () => {
  it('follows the system before the user chooses', async () => {
    systemDark = true;
    const { result } = renderHook(() => useTheme());
    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
    });
    expect(root.dataset.theme).toBe('dark');
    expect(localStorage.getItem('trazos-theme')).toBeNull();
  });

  it('tracks system changes until the user chooses, then stops', async () => {
    const { result } = renderHook(() => useTheme());
    await waitFor(() => {
      expect(result.current.theme).toBe('light');
    });
    act(() => {
      setSystem(true);
    });
    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
    });
    act(() => {
      result.current.setTheme('light');
    });
    await waitFor(() => {
      expect(result.current.theme).toBe('light');
    });
    act(() => {
      setSystem(true);
    });
    expect(root.dataset.theme).toBe('light');
  });

  it('persists the choice and restores it on the next mount', () => {
    const first = renderHook(() => useTheme());
    act(() => {
      first.result.current.setTheme('dark');
    });
    expect(localStorage.getItem('trazos-theme')).toBe('dark');
    first.unmount();
    delete root.dataset.theme;
    renderHook(() => useTheme());
    expect(root.dataset.theme).toBe('dark');
  });

  it('ignores an invalid stored value', () => {
    localStorage.setItem('trazos-theme', 'sepia');
    renderHook(() => useTheme());
    expect(root.dataset.theme).toBe('light');
  });

  it('keeps a theme the host or the inline script already applied', () => {
    root.dataset.theme = 'dark';
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('updates the theme-color meta tag', () => {
    const meta = themeColorMeta();
    const { result } = renderHook(() => useTheme({ colors: { light: '#fff', dark: '#000' } }));
    act(() => {
      result.current.setTheme('dark');
    });
    expect(meta.content).toBe('#000');
  });

  it('honors a custom storage key', () => {
    const { result } = renderHook(() => useTheme({ storageKey: 'theme' }));
    act(() => {
      result.current.setTheme('dark');
    });
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.getItem('trazos-theme')).toBeNull();
  });

  it('follows a choice made in another tab', async () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'trazos-theme', newValue: 'dark' }));
    });
    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
    });
  });

  it('still changes the theme when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(root.dataset.theme).toBe('dark');
  });

  it('stops listening after unmounting', () => {
    const { unmount } = renderHook(() => useTheme());
    expect(mediaListeners.size).toBe(1);
    unmount();
    expect(mediaListeners.size).toBe(0);
  });
});

describe('ThemeToggle', () => {
  it('uses the label as its accessible name and renders both icons', () => {
    const { container } = render(<ThemeToggle label="Toggle theme" />);
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toHaveClass('trazos-icon-btn');
    expect(container.querySelector('.trazos-theme-toggle-moon')).not.toBeNull();
    expect(container.querySelector('.trazos-theme-toggle-sun')).not.toBeNull();
  });

  it('toggles between both themes and calls the host onClick', async () => {
    const onClick = vi.fn();
    render(<ThemeToggle label="Toggle theme" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(root.dataset.theme).toBe('dark');
    await userEvent.click(screen.getByRole('button'));
    expect(root.dataset.theme).toBe('light');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('lets CSS pick the icon for the active theme', () => {
    const { container } = render(<ThemeToggle label="Toggle theme" />);
    const moon = container.querySelector('.trazos-theme-toggle-moon') as Element;
    const sun = container.querySelector('.trazos-theme-toggle-sun') as Element;
    root.dataset.theme = 'light';
    expect(getComputedStyle(moon).display).toBe('inline-flex');
    expect(getComputedStyle(sun).display).toBe('none');
    root.dataset.theme = 'dark';
    expect(getComputedStyle(moon).display).toBe('none');
    expect(getComputedStyle(sun).display).toBe('inline-flex');
  });

  it('hydrates without a mismatch when the page is already dark', async () => {
    const html = renderToString(<ThemeToggle label="Toggle theme" />);
    root.dataset.theme = 'dark';
    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = html;
    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const hydrated = await act(async () => {
      const created = hydrateRoot(container, <ThemeToggle label="Toggle theme" />, { onRecoverableError });
      await Promise.resolve();
      return created;
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    act(() => {
      hydrated.unmount();
    });
    container.remove();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ThemeToggle label="Toggle theme" />);
    await expectNoA11yViolations(container);
  });
});

describe('createThemeScript', () => {
  it('applies the stored theme and its color before first paint', () => {
    const meta = themeColorMeta();
    localStorage.setItem('trazos-theme', 'dark');
    runScript(createThemeScript());
    expect(root.dataset.theme).toBe('dark');
    expect(meta.content).toBe(DEFAULT_THEME_COLORS.dark);
  });

  it('follows the system without a stored choice, also after it changes', () => {
    systemDark = true;
    runScript(createThemeScript());
    expect(root.dataset.theme).toBe('dark');
    setSystem(false);
    expect(root.dataset.theme).toBe('light');
  });

  it('ignores system changes after the user chose', () => {
    localStorage.setItem('trazos-theme', 'light');
    runScript(createThemeScript());
    setSystem(true);
    expect(root.dataset.theme).toBe('light');
  });

  it('honors the same options as useTheme', () => {
    const meta = themeColorMeta();
    localStorage.setItem('theme', 'dark');
    runScript(createThemeScript({ storageKey: 'theme', colors: { light: '#fff', dark: '#000' } }));
    expect(root.dataset.theme).toBe('dark');
    expect(meta.content).toBe('#000');
  });

  it('cannot close its own script tag', () => {
    const script = createThemeScript({ storageKey: '</script><img src=x onerror=alert(1)>' });
    expect(script.toLowerCase()).not.toContain('</script');
  });

  it('survives unavailable storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    systemDark = true;
    runScript(createThemeScript());
    expect(root.dataset.theme).toBe('dark');
  });
});
