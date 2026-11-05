import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { IconBox, type IconBoxVariant } from '../IconBox';
import './EmptyState.css';

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Heading text. */
  title: string;
  description?: string;
  icon?: ReactNode;
  iconVariant?: IconBoxVariant;
  /** Buttons or links that resolve the empty state. */
  actions?: ReactNode;
  /** Less vertical space, for side panels. */
  compact?: boolean;
}

/** Message for lists or views without content: explains why it is empty and offers the next action. */
export function EmptyState({
  title,
  description,
  icon,
  iconVariant = 'cream',
  actions,
  compact = false,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div {...rest} className={cx('trazos-empty-state', compact && 'is-compact', className)}>
      {icon != null && (
        <IconBox variant={iconVariant} size={compact ? 'medium' : 'large'} className="trazos-empty-state-icon">
          {icon}
        </IconBox>
      )}
      <h3 className="trazos-empty-state-title">{title}</h3>
      {description ? <p className="trazos-empty-state-description">{description}</p> : null}
      {actions != null && <div className="trazos-empty-state-actions">{actions}</div>}
    </div>
  );
}
