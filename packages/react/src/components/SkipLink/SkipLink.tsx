import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './SkipLink.css';

/** Lets keyboard users jump past the navigation. It stays out of view until focused. */
export function SkipLink({ href = '#main', className, children, ...rest }: ComponentPropsWithRef<'a'>) {
  return (
    <a {...rest} href={href} className={cx('trazos-skip-link', className)}>
      {children}
    </a>
  );
}
