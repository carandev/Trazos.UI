import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';

export interface SidebarNavSectionProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** The section's heading; also used as its accessible name. */
  title: string;
  /** The section's `SidebarNavItem`s. */
  children?: ReactNode;
}

/** An optional heading above a group of `SidebarNavItem`s. */
export function SidebarNavSection({ title, className, children, ...rest }: SidebarNavSectionProps) {
  return (
    <div {...rest} className={cx('trazos-sidebar-nav-section', className)} aria-label={title}>
      <p className="trazos-sidebar-nav-section-title" aria-hidden="true">
        {title}
      </p>
      {children}
    </div>
  );
}
