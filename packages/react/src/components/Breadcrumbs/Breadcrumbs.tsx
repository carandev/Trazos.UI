import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import { TrazosLink } from '../Link/TrazosLinkProvider';
import './Breadcrumbs.css';

/** One step of a trail. Mirrors `Trazos.UI.Components.BreadcrumbItem`. */
export interface BreadcrumbItem {
  /** Visible text. */
  text: string;
  /** Link target. Ignored for the last item, which is the current page. */
  href?: string;
}

export interface BreadcrumbsProps extends ComponentPropsWithRef<'nav'> {
  /** The trail, from the root to the current page. */
  items: readonly BreadcrumbItem[];
  /** Accessible name of the navigation landmark. */
  label?: string;
}

export function Breadcrumbs({ items, label = 'Breadcrumb', className, ...rest }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} {...rest} className={cx('trazos-breadcrumbs', className)}>
      <ol className="trazos-breadcrumbs-list">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <li key={`${i}-${item.text}`} className="trazos-breadcrumbs-item">
              {isCurrent ? (
                <span className="trazos-breadcrumbs-current" aria-current="page">
                  {item.text}
                </span>
              ) : item.href ? (
                <TrazosLink className="trazos-breadcrumbs-link" href={item.href}>
                  {item.text}
                </TrazosLink>
              ) : (
                <span className="trazos-breadcrumbs-text">{item.text}</span>
              )}
              {!isCurrent && (
                <svg
                  className="trazos-breadcrumbs-separator"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
