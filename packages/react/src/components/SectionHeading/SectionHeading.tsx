import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { SketchUnderline } from '../Sketch';
import './SectionHeading.css';

export type SectionHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface SectionHeadingProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title: ReactNode;
  /** Handwritten line above the title. */
  eyebrow?: ReactNode;
  /** Heading element. Defaults to `h2`. */
  as?: SectionHeadingLevel;
  /** Draws a sketch underline below the title. */
  underline?: boolean;
  /** Rendered beside the title, such as a "see all" link. */
  actions?: ReactNode;
}

export function SectionHeading({
  title,
  eyebrow,
  as: Heading = 'h2',
  underline = false,
  actions,
  className,
  ...rest
}: SectionHeadingProps) {
  return (
    <div {...rest} className={cx('trazos-section-heading', className)}>
      <div className="trazos-section-heading-text">
        {eyebrow != null && <p className="trazos-handwriting trazos-section-heading-eyebrow">{eyebrow}</p>}
        <Heading className="trazos-heading trazos-section-heading-title">{title}</Heading>
        {underline && <SketchUnderline className="trazos-section-heading-underline" />}
      </div>
      {actions != null && <div className="trazos-section-heading-actions">{actions}</div>}
    </div>
  );
}
