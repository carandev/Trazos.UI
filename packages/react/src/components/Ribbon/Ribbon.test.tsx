import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Ribbon } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Ribbon', () => {
  it('shows its text in a corner with a tone', () => {
    const { container } = render(<Ribbon text="PAID" tone="olive" position="top-left" />);
    const ribbon = container.firstElementChild;
    expect(ribbon).toHaveClass('trazos-ribbon', 'trazos-ribbon-olive', 'trazos-ribbon-top-left');
    expect(container.querySelector('.trazos-ribbon-band')).toHaveTextContent('PAID');
  });

  it('defaults to an olive ribbon in the top-right corner that keeps its fill on paper', () => {
    const { container } = render(<Ribbon text="Draft" />);
    const ribbon = container.firstElementChild as HTMLElement;
    expect(ribbon).toHaveClass('trazos-ribbon-olive', 'trazos-ribbon-top-right', 'trazos-print-exact');
    const style = getComputedStyle(ribbon);
    expect(style.position).toBe('absolute');
    expect(style.right).toBe('0px');
    expect(style.pointerEvents).toBe('none');
  });

  it.each(['olive', 'wine', 'gold', 'sky', 'neutral'] as const)('applies the %s tone', (tone) => {
    const { container } = render(<Ribbon text="x" tone={tone} />);
    expect(container.firstElementChild).toHaveClass(`trazos-ribbon-${tone}`);
  });

  it('keeps the text readable by screen readers', () => {
    render(<Ribbon text="Paid" />);
    expect(screen.getByText('Paid')).toBeVisible();
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<Ribbon ref={ref} text="x" className="extra" data-x="1" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass('trazos-ribbon', 'extra');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div style={{ position: 'relative' }}>
        <Ribbon text="Paid" />
        <p>Receipt</p>
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
