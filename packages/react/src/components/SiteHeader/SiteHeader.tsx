import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { IconButton } from '../Button';
import './SiteHeader.css';

const SCROLLED_AFTER_PX = 12;

export interface SiteHeaderLink extends ComponentPropsWithoutRef<'a'> {
  href: string;
  label: ReactNode;
}

export interface SiteHeaderProps extends ComponentPropsWithRef<'header'> {
  links: SiteHeaderLink[];
  /** Accessible name of the navigation. */
  navLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  logo?: ReactNode;
  /** Rendered beside the menu button, such as a `ThemeToggle`. */
  actions?: ReactNode;
  /** The `href` of the current link. */
  activeHref?: string;
  /** The `aria-current` value of the active link: `location` suits a one-page site with `useScrollSpy`. */
  currentType?: 'page' | 'location';
}

function subscribeToScroll(notify: () => void) {
  window.addEventListener('scroll', notify, { passive: true });
  return () => {
    window.removeEventListener('scroll', notify);
  };
}

function isScrolled() {
  return window.scrollY > SCROLLED_AFTER_PX;
}

function isScrolledOnServer() {
  return false;
}

const menuIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const closeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** A top navigation bar for public websites. `AppShell` covers dashboards with a sidebar. */
export function SiteHeader({
  links,
  navLabel,
  openMenuLabel,
  closeMenuLabel,
  logo,
  actions,
  activeHref,
  currentType = 'page',
  className,
  ...rest
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const scrolled = useSyncExternalStore(subscribeToScroll, isScrolled, isScrolledOnServer);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header {...rest} className={cx('trazos-site-header', scrolled && 'trazos-site-header-scrolled', className)}>
      <div className="trazos-site-header-inner">
        {logo != null && <div className="trazos-site-header-logo">{logo}</div>}
        <nav
          id={navId}
          aria-label={navLabel}
          className={cx('trazos-site-header-nav', menuOpen && 'trazos-site-header-nav-open')}
        >
          {links.map(({ href, label, className: linkClassName, onClick, ...linkRest }) => (
            <a
              {...linkRest}
              key={href}
              href={href}
              aria-current={href === activeHref ? currentType : undefined}
              className={cx('trazos-site-header-link', linkClassName)}
              onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                onClick?.(event);
                setMenuOpen(false);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        {actions != null && <div className="trazos-site-header-actions">{actions}</div>}
        <IconButton
          ref={toggle}
          label={menuOpen ? closeMenuLabel : openMenuLabel}
          variant="outline"
          className="trazos-site-header-toggle"
          aria-expanded={menuOpen}
          aria-controls={navId}
          onClick={() => {
            setMenuOpen((open) => !open);
          }}
        >
          {menuOpen ? closeIcon : menuIcon}
        </IconButton>
      </div>
    </header>
  );
}
