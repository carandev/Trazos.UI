import type { MouseEvent, ReactNode } from 'react';
import { IconButton, type IconButtonProps } from '../Button';
import type { ThemeOptions } from './theme';
import { useTheme } from './useTheme';
import './ThemeToggle.css';

export interface ThemeToggleProps extends Omit<IconButtonProps, 'children'>, ThemeOptions {
  /** Shown in the light theme. */
  moonIcon?: ReactNode;
  /** Shown in the dark theme. */
  sunIcon?: ReactNode;
}

const moon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const sun = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

/**
 * Switches between the light and dark themes. Both icons are always rendered and
 * CSS shows the right one, so the server's HTML cannot mismatch the client's.
 */
export function ThemeToggle({ storageKey, colors, moonIcon = moon, sunIcon = sun, onClick, ...rest }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme({ storageKey, colors });

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <IconButton {...rest} onClick={handleClick}>
      <span className="trazos-theme-toggle-moon">{moonIcon}</span>
      <span className="trazos-theme-toggle-sun">{sunIcon}</span>
    </IconButton>
  );
}
