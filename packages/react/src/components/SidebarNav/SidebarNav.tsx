import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './SidebarNav.css';

export interface SidebarNavProps extends ComponentPropsWithRef<'nav'> {
  /**
   * A bottom-pinned area rendered after the scrollable item list, such as a
   * user menu or a "collapse" button.
   */
  footer?: ReactNode;
}

/**
 * List container for the AppShell sidebar's navigation: a scrollable list of
 * `SidebarNavSection`s and `SidebarNavItem`s, with an optional bottom-pinned
 * `footer` area.
 */
export function SidebarNav({ footer, className, children, ...rest }: SidebarNavProps) {
  return (
    <nav {...rest} className={cx('trazos-sidebar-nav', className)}>
      <div className="trazos-sidebar-nav-items">{children}</div>
      {footer}
    </nav>
  );
}
