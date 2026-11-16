import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Breadcrumbs, type BreadcrumbItem } from '../Breadcrumbs';
import { TrazosLink } from '../Link/TrazosLinkProvider';
import './PageHeader.css';

export interface PageHeaderProps extends Omit<ComponentPropsWithRef<'header'>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Heading level of the title, 1 to 6. Defaults to 1. */
  level?: number;
  /** Breadcrumb trail shown above the title. Takes precedence over the back link. */
  breadcrumbs?: readonly BreadcrumbItem[];
  /** Accessible name of the breadcrumb landmark. */
  breadcrumbsLabel?: string;
  /** Target of a back link shown above the title. */
  backHref?: string;
  backLabel?: string;
  /** Small content under the subtitle, such as badges or dates. */
  meta?: ReactNode;
  /** Buttons aligned to the right of the title. They take the full width on phones. */
  actions?: ReactNode;
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Top of an application page: breadcrumbs or a back link, the title, an
 * optional subtitle and metadata, and an action area. `children` render
 * below the header row, such as tabs.
 */
export function PageHeader({
  title,
  subtitle,
  level = 1,
  breadcrumbs,
  breadcrumbsLabel = 'Breadcrumb',
  backHref,
  backLabel = 'Back',
  meta,
  actions,
  className,
  children,
  ...rest
}: PageHeaderProps) {
  const Heading = `h${Math.min(6, Math.max(1, Math.trunc(level)))}` as HeadingTag;

  return (
    <header {...rest} className={cx('trazos-page-header', className)}>
      {breadcrumbs != null && breadcrumbs.length > 0 ? (
        <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} className="trazos-page-header-breadcrumbs" />
      ) : (
        backHref && (
          <TrazosLink className="trazos-page-header-back" href={backHref}>
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {backLabel}
          </TrazosLink>
        )
      )}

      <div className="trazos-page-header-row">
        <div className="trazos-page-header-text">
          <Heading className="trazos-heading trazos-page-header-title">{title}</Heading>
          {subtitle != null && subtitle !== '' && <p className="trazos-page-header-subtitle">{subtitle}</p>}
          {meta != null && <div className="trazos-page-header-meta">{meta}</div>}
        </div>
        {actions != null && <div className="trazos-page-header-actions">{actions}</div>}
      </div>

      {children}
    </header>
  );
}
