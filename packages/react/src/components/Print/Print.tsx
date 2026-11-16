import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';

/** Hidden when the page is printed: toolbars, buttons, navigation. Uses the `trazos-no-print` utility class. */
export function NoPrint({ className, ...rest }: ComponentPropsWithRef<'div'>) {
  return <div {...rest} className={cx('trazos-no-print', className)} />;
}

/** Shown only on paper: signatures, legal notes, a printed header. Uses the `trazos-print-only` utility class. */
export function PrintOnly({ className, ...rest }: ComponentPropsWithRef<'div'>) {
  return <div {...rest} className={cx('trazos-print-only', className)} />;
}
