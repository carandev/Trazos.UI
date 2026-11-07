import type { ComponentPropsWithRef, ReactNode } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './Button';

export interface LinkButtonProps extends ComponentPropsWithRef<'a'> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

/** A link that looks like a `Button`, for actions that navigate. */
export function LinkButton({
  variant = 'primary',
  size = 'medium',
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a {...rest} className={buttonClasses(variant, size, className)}>
      {leadingIcon != null && <span className="trazos-btn-leading-icon">{leadingIcon}</span>}
      <span className="trazos-btn-text">{children}</span>
      {trailingIcon != null && <span className="trazos-btn-trailing-icon">{trailingIcon}</span>}
    </a>
  );
}
