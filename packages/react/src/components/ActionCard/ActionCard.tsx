import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { IconBox, type IconBoxVariant } from '../IconBox';
import { TrazosLink, type TrazosLinkProps } from '../Link/TrazosLinkProvider';
import './ActionCard.css';

export interface ActionCardProps extends Omit<TrazosLinkProps, 'title'> {
  /** Target of the card. */
  href: string;
  icon?: ReactNode;
  iconVariant?: IconBoxVariant;
  /** Heading text. */
  title: string;
  description?: string;
}

/**
 * Large clickable tile for a dashboard/home quick action: an icon, a title and a
 * short description, all linking to `href`. Lay several of these out in a
 * responsive CSS grid of your own; this component only renders one tile.
 */
export function ActionCard({
  href,
  icon,
  iconVariant = 'primary',
  title,
  description,
  className,
  ...rest
}: ActionCardProps) {
  return (
    <TrazosLink {...rest} href={href} className={cx('trazos-action-card', className)}>
      {icon != null && (
        <IconBox variant={iconVariant} size="medium" className="trazos-action-card-icon">
          {icon}
        </IconBox>
      )}
      <div className="trazos-action-card-text">
        <h3 className="trazos-heading trazos-action-card-title">{title}</h3>
        {description ? <p className="trazos-action-card-description">{description}</p> : null}
      </div>
    </TrazosLink>
  );
}
