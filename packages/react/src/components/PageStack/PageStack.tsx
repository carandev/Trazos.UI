import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './PageStack.css';

export type PageStackProps = ComponentPropsWithRef<'div'>;

/**
 * Vertical container for a page's sections (`PageHeader`, cards, tables...) with
 * consistent spacing between them, so pages do not each define their own margins.
 */
export function PageStack({ className, ...rest }: PageStackProps) {
  return <div {...rest} className={cx('trazos-page-stack', className)} />;
}
