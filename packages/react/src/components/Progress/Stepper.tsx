import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { VisuallyHidden } from '../VisuallyHidden';
import './Stepper.css';

/** One step. Mirrors `Trazos.UI.Components.StepperStep`. */
export interface StepperStep {
  title: ReactNode;
  description?: ReactNode;
}

export interface StepperProps extends ComponentPropsWithRef<'ol'> {
  steps: readonly StepperStep[];
  /** Zero-based index of the current step. Earlier steps show as complete. */
  current?: number;
  /** Accessible name of the list, such as the name of the workflow. */
  label?: string;
  /** Screen-reader text added to completed steps. */
  completedLabel?: string;
  vertical?: boolean;
}

export function Stepper({
  steps,
  current = 0,
  label,
  completedLabel = 'Completed',
  vertical = false,
  className,
  ...rest
}: StepperProps) {
  return (
    <ol
      aria-label={label}
      {...rest}
      className={cx('trazos-stepper', vertical ? 'trazos-stepper-vertical' : 'trazos-stepper-horizontal', className)}
    >
      {steps.map((step, i) => {
        const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
        return (
          <li key={i} className={cx('trazos-stepper-step', `trazos-stepper-${state}`)} aria-current={i === current ? 'step' : undefined}>
            <span className="trazos-stepper-marker" aria-hidden="true">
              {i < current ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className="trazos-stepper-text">
              <span className="trazos-stepper-title">{step.title}</span>
              {step.description != null && step.description !== '' && (
                <span className="trazos-stepper-description">{step.description}</span>
              )}
              {i < current && <VisuallyHidden>{completedLabel}</VisuallyHidden>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
