import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './LinkList.css';

export function LinkList({ className, ...rest }: ComponentPropsWithRef<'ul'>) {
  return <ul {...rest} className={cx('trazos-link-list', className)} />;
}

export interface LinkListItemProps extends ComponentPropsWithRef<'a'> {
  href: string;
  /** Muted text beside the name, such as a language or a year. */
  meta?: ReactNode;
  /** Replaces the default arrow. */
  icon?: ReactNode;
}

const arrow = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** One row of a `LinkList`. `className` and native attributes go to the link. */
export function LinkListItem({ meta, icon = arrow, className, children, ...rest }: LinkListItemProps) {
  return (
    <li className="trazos-link-list-item">
      <a {...rest} className={cx('trazos-link-list-link', className)}>
        <span className="trazos-link-list-name">{children}</span>
        {meta != null && <span className="trazos-link-list-meta">{meta}</span>}
        <span className="trazos-link-list-icon">{icon}</span>
      </a>
    </li>
  );
}
