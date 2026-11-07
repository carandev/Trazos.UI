import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './VisuallyHidden.css';

/** Content for screen readers only, such as an `aria-live` announcement. */
export function VisuallyHidden({ className, ...rest }: ComponentPropsWithRef<'span'>) {
  return <span {...rest} className={cx('trazos-visually-hidden', className)} />;
}
