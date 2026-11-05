import { useState } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ConfirmDialogProvider } from '../ConfirmDialog';
import { Drawer } from '../Drawer';
import { ToastProvider } from '../Toast';
import './AppShell.css';

/**
 * Layout shell (Razor `Trazos.UI.Layout.AppShell`). The Razor `TrazosUIOptions`
 * injected through DI are plain props here (`isDevelopment`,
 * `environmentName`, `showEnvironmentBadge`) with the same defaults.
 */
export interface AppShellProps extends ComponentPropsWithRef<'div'> {
  brand?: ReactNode;
  sidebar?: ReactNode;
  topBar?: ReactNode;
  /** Mobile drawer header; defaults to `brand`. */
  drawerHeader?: ReactNode;
  /** Mobile drawer content; defaults to `sidebar`. */
  drawerContent?: ReactNode;
  /** Extra classes for the content container. */
  containerClass?: string;
  /** Razor `TrazosUIOptions.IsDevelopment`. Defaults to false. */
  isDevelopment?: boolean;
  /** Razor `TrazosUIOptions.EnvironmentName` (e.g. "DEV", "STAGING"). */
  environmentName?: string;
  /** Razor `TrazosUIOptions.ShowEnvironmentBadge`. Defaults to true. */
  showEnvironmentBadge?: boolean;
  sidebarAriaLabel?: string;
  hamburgerAriaLabel?: string;
}

export function AppShell({
  brand,
  sidebar,
  topBar,
  drawerHeader,
  drawerContent,
  containerClass = '',
  isDevelopment = false,
  environmentName,
  showEnvironmentBadge = true,
  sidebarAriaLabel = 'Navegación principal',
  hamburgerAriaLabel = 'Abrir menú de navegación',
  className,
  children,
  ...rest
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const brandBlock = brand != null && <div className="trazos-shell-brand">{brand}</div>;

  return (
    <div {...rest} className={cx('trazos-app-shell', className)}>
      {/* Global confirm dialog and toast slots render after the drawer, as in Razor. */}
      <ConfirmDialogProvider>
        <ToastProvider>
          <aside className="trazos-shell-sidebar" aria-label={sidebarAriaLabel}>
            {sidebar}
          </aside>

          <div className="trazos-shell-main-wrapper">
            <header className="trazos-shell-topbar">
              <div className="trazos-shell-topbar-left">
                <button
                  type="button"
                  className="trazos-hamburger-btn"
                  onClick={() => {
                    setDrawerOpen((value) => !value);
                  }}
                  aria-label={hamburgerAriaLabel}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </button>

                {brandBlock}

                {isDevelopment && showEnvironmentBadge && (
                  <span className="trazos-env-badge" title={`Running in ${environmentName ?? 'Development'} mode`}>
                    {environmentName ?? 'DEV'}
                  </span>
                )}
              </div>

              <div className="trazos-shell-topbar-right">{topBar}</div>
            </header>

            <main className="trazos-shell-content">
              <div className={cx('trazos-shell-container', containerClass)}>{children}</div>
            </main>
          </div>

          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} header={drawerHeader ?? (brandBlock || undefined)}>
            {drawerContent ?? sidebar}
          </Drawer>
        </ToastProvider>
      </ConfirmDialogProvider>
    </div>
  );
}
