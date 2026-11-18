import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { TrazosLink } from '../Link/TrazosLinkProvider';

export interface SidebarNavItemProps {
  href: string;
  /**
   * Whether this item matches the app's current route. React has no
   * built-in router, so the consuming app sets this from its own router
   * (e.g. `react-router`'s `useLocation`).
   */
  active?: boolean;
  icon?: ReactNode;
  /** The link's label. */
  children?: ReactNode;
  className?: string;
}

/** One link of a `SidebarNav`. */
export function SidebarNavItem({ href, active = false, icon, children, className }: SidebarNavItemProps) {
  return (
    <TrazosLink
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cx('trazos-sidebar-nav-item', active && 'is-active', className)}
    >
      {icon != null && (
        <span className="trazos-sidebar-nav-item-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="trazos-sidebar-nav-item-label">{children}</span>
    </TrazosLink>
  );
}
