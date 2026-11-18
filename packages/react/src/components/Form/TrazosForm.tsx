import type { ComponentPropsWithRef, SubmitEvent } from 'react';
import { cx } from '../../internal/cx';
import './TrazosForm.css';

export interface TrazosFormProps extends Omit<ComponentPropsWithRef<'form'>, 'onSubmit'> {
  onSubmit?: (event: SubmitEvent<HTMLFormElement>) => void;
  /** Validation error messages to show above the fields. Omit or pass an empty array to hide the summary. */
  errors?: readonly string[];
  /** Accessible heading for the error summary when `errors` is non-empty. */
  errorSummaryLabel?: string;
}

/**
 * Structural form wrapper: prevents the native page reload on submit (so
 * callers do not repeat `event.preventDefault()` in every handler, mirroring
 * what Blazor's `EditForm` does for Trazos callers) and renders an optional
 * validation-summary slot above the fields.
 *
 * Unlike the Blazor `TrazosForm`, this is **not** a `DataAnnotationsValidator`
 * port: React has no model-annotation validation framework, so this component
 * wires no validation of its own. Compute your own messages (react-hook-form,
 * Zod, hand-rolled) and pass them through `errors`.
 */
export function TrazosForm({
  onSubmit,
  errors,
  errorSummaryLabel = 'Please fix the following:',
  className,
  children,
  ...rest
}: TrazosFormProps) {
  const hasErrors = errors != null && errors.length > 0;

  return (
    <form
      {...rest}
      className={cx('trazos-form', className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
    >
      {hasErrors && (
        <div className="trazos-form-summary" role="alert">
          <p className="trazos-form-summary-title">{errorSummaryLabel}</p>
          <ul>
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </form>
  );
}
