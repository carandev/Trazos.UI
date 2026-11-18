import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Card } from '../Card';
import './AuthLayout.css';

export interface AuthLayoutProps extends ComponentPropsWithRef<'div'> {
  /** Rendered above the card, such as a logo. */
  brand?: ReactNode;
  /** Rendered as a heading inside the card, above the content, when non-empty. */
  title?: string;
  /** Rendered under the title, inside the card, when non-empty. */
  subtitle?: string;
  /** Rendered below the card, outside it. */
  footer?: ReactNode;
}

/**
 * Centered single-card layout for login, password-reset and similar auth
 * pages (Razor `Trazos.UI.Layout.AuthLayout`): a full-height centered
 * container around one `Card`, with an optional footer rendered below the
 * card (outside it), for links such as "Forgot your password?" or "Don't
 * have an account? Sign up".
 */
export function AuthLayout({ brand, title, subtitle, footer, className, children, ...rest }: AuthLayoutProps) {
  return (
    <div {...rest} className={cx('trazos-auth-layout', className)}>
      {brand != null && <div className="trazos-auth-layout-brand">{brand}</div>}

      <div className="trazos-auth-layout-card">
        <Card>
          {title != null && title !== '' && <h1 className="trazos-heading trazos-auth-layout-title">{title}</h1>}
          {subtitle != null && subtitle !== '' && <p className="trazos-auth-layout-subtitle">{subtitle}</p>}
          {children}
        </Card>
      </div>

      {footer != null && <div className="trazos-auth-layout-footer">{footer}</div>}
    </div>
  );
}
