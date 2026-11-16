import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';
import progressCss from './ProgressBar.css?raw';

function fill(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('.trazos-progress-fill');
  if (el == null) throw new Error('no fill');
  return el;
}

describe('ProgressBar', () => {
  it('exposes progressbar semantics labelled by the visible label', () => {
    const { container } = render(<ProgressBar value={3} max={7} label="Calculating payroll" valueText="3 of 7 employees" />);
    const bar = screen.getByRole('progressbar', { name: 'Calculating payroll' });
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '7');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 7 employees');
    const label = container.querySelector('.trazos-progress-label');
    expect(bar).toHaveAttribute('aria-labelledby', label?.id);
    expect(bar).not.toHaveAttribute('aria-label');
    expect(fill(container).style.width).toBe('42.86%');
    const value = container.querySelector('.trazos-progress-value');
    expect(value).toHaveTextContent('3 of 7 employees');
    expect(value).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows a rounded percentage by default and no aria-valuetext', () => {
    const { container } = render(<ProgressBar value={1} max={3} label="Upload" />);
    expect(container.querySelector('.trazos-progress-value')).toHaveTextContent('33%');
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuetext');
    expect(fill(container).style.width).toBe('33.33%');
  });

  it('uses ariaLabel as the name when there is no visible label', () => {
    const { container } = render(<ProgressBar value={50} ariaLabel="Upload" showValue={false} />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).not.toHaveAttribute('aria-labelledby');
    expect(container.querySelector('.trazos-progress-header')).toBeNull();
  });

  it('hides the value with showValue false', () => {
    const { container } = render(<ProgressBar value={50} label="Upload" showValue={false} />);
    expect(container.querySelector('.trazos-progress-value')).toBeNull();
    expect(container.querySelector('.trazos-progress-label')).toHaveTextContent('Upload');
  });

  it('clamps the value to 0..max', () => {
    const { container, rerender } = render(<ProgressBar value={150} label="Done" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(fill(container).style.width).toBe('100%');
    rerender(<ProgressBar value={-5} label="Done" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(fill(container).style.width).toBe('0%');
  });

  it('treats a max of zero as empty', () => {
    const { container } = render(<ProgressBar value={5} max={0} label="Nothing" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(fill(container).style.width).toBe('0%');
  });

  it('has no value when indeterminate', () => {
    const { container } = render(<ProgressBar indeterminate label="Loading" valueText="ignored" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    for (const attr of ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext']) {
      expect(bar).not.toHaveAttribute(attr);
    }
    expect(container.firstElementChild).toHaveClass('trazos-progress-indeterminate');
    expect(container.querySelector('.trazos-progress-value')).toBeNull();
    expect(fill(container).style.width).toBe('');
  });

  it('stops the indeterminate animation with reduced motion', () => {
    const reduced = progressCss.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/)?.[0];
    expect(reduced).toMatch(/\.trazos-progress-indeterminate \.trazos-progress-fill \{[^}]*animation: none;/);
  });

  it.each(['olive', 'gold', 'wine', 'sky'] as const)('applies the %s tone', (tone) => {
    const { container } = render(<ProgressBar value={1} label="x" tone={tone} />);
    expect(container.firstElementChild).toHaveClass(`trazos-progress-${tone}`);
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ProgressBar ref={ref} value={1} label="x" className="extra" data-x="1" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass('trazos-progress', 'extra');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <ProgressBar value={3} max={7} label="Payroll" />
        <ProgressBar indeterminate ariaLabel="Sending" />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
