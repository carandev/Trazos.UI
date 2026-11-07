import { useId, type ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './FormSection.css';

export interface FormSectionProps extends Omit<ComponentPropsWithRef<'section'>, 'title'> {
  /** Section heading; it also labels the section. */
  title: string;
  description?: string;
  /** Step number shown next to the title. */
  step?: number;
}

/** Groups related form fields under a clear, optionally numbered title. */
export function FormSection({ title, description, step, className, children, ...rest }: FormSectionProps) {
  const titleId = `trazos-form-section-${useId()}`;
  const hasStep = step != null;
  return (
    <section {...rest} className={cx('trazos-form-section', className)} aria-labelledby={titleId}>
      <header className="trazos-form-section-header">
        {hasStep && (
          <span className="trazos-form-section-step" aria-hidden="true">
            {step}
          </span>
        )}
        <div className="trazos-form-section-heading">
          <h4 id={titleId} className="trazos-form-section-title">
            {title}
          </h4>
          {description ? <p className="trazos-form-section-description">{description}</p> : null}
        </div>
      </header>
      <div className={cx('trazos-form-section-body', hasStep && 'trazos-form-section-has-step')}>{children}</div>
    </section>
  );
}
