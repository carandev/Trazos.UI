import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { cx } from '../../internal/cx';
import './Skeleton.css';

/** Mirrors `Trazos.UI.Components.SkeletonVariant`. */
export type SkeletonVariant = 'text' | 'circular' | 'card' | 'rounded';

/**
 * Native `div` attributes are applied to every rendered skeleton, so avoid
 * unique attributes such as `id` when `count` is greater than 1.
 */
export interface SkeletonProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  variant?: SkeletonVariant;
  /** Any CSS length, e.g. `"60%"` or `"8rem"`. */
  width?: string;
  /** Any CSS length, e.g. `"1.25rem"`. */
  height?: string;
  /** Number of skeleton blocks to render. */
  count?: number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const sizeStyle: CSSProperties = {};
  if (width) sizeStyle.width = width;
  if (height) sizeStyle.height = height;
  const merged = { ...style, ...sizeStyle };
  const hasStyle = Object.keys(merged).length > 0;

  return (
    <>
      {Array.from({ length: Math.max(0, count) }, (_, i) => (
        <div
          {...rest}
          key={i}
          className={cx('trazos-skeleton', `trazos-skeleton-${variant}`, className)}
          style={hasStyle ? merged : undefined}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
