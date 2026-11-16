import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Stat } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Stat', () => {
  it('shows the label, value, delta, trend and icon', () => {
    const { container } = render(
      <Stat
        label="Net payroll"
        value="$ 148M"
        delta="+4.2%"
        trend="up"
        trendLabel="Up from last month"
        icon={<svg data-testid="icon" />}
      />,
    );
    expect(container.querySelector('.trazos-stat-label')).toHaveTextContent('Net payroll');
    expect(container.querySelector('.trazos-stat-value')).toHaveTextContent('$ 148M');
    const delta = container.querySelector('.trazos-stat-delta');
    expect(delta).toHaveClass('trazos-stat-delta-up');
    expect(delta).toHaveTextContent('+4.2%');
    const hidden = screen.getByText('Up from last month');
    expect(hidden).toHaveClass('trazos-visually-hidden');
    expect(delta).toContainElement(hidden);
    const icon = container.querySelector('.trazos-stat-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveClass('trazos-stat-icon-primary');
    expect(icon).toContainElement(screen.getByTestId('icon'));
  });

  it.each([
    ['up', 'm4.5 15.75'],
    ['down', 'm19.5 8.25'],
    ['flat', 'M5 12h14'],
  ] as const)('draws the %s arrow', (trend, path) => {
    const { container } = render(<Stat label="L" value="1" delta="0" trend={trend} />);
    const svg = container.querySelector('.trazos-stat-delta svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.querySelector('path')?.getAttribute('d')).toContain(path);
    expect(container.querySelector('.trazos-stat-delta')).toHaveClass(`trazos-stat-delta-${trend}`);
  });

  it('draws no arrow without a trend', () => {
    const { container } = render(<Stat label="L" value="1" delta="3" />);
    expect(container.querySelector('.trazos-stat-delta')).toHaveClass('trazos-stat-delta-none');
    expect(container.querySelector('.trazos-stat-delta svg')).toBeNull();
  });

  it('colors a rise as bad and a fall as good when inverted', () => {
    const { container } = render(<Stat label="Absences" value="12" delta="+2" trend="up" inverted />);
    const delta = container.querySelector('.trazos-stat-delta') as Element;
    expect(delta).toHaveClass('trazos-stat-delta-inverted');
    const { container: normal } = render(<Stat label="Absences" value="12" delta="-2" trend="down" />);
    expect(getComputedStyle(delta).color).toBe(getComputedStyle(normal.querySelector('.trazos-stat-delta') as Element).color);
  });

  it('renders no delta, hint or icon when they are not given', () => {
    const { container } = render(<Stat label="Employees" value="42" />);
    expect(container.querySelector('.trazos-stat-delta')).toBeNull();
    expect(container.querySelector('.trazos-stat-hint')).toBeNull();
    expect(container.querySelector('.trazos-stat-icon')).toBeNull();
  });

  it('shows the hint and the icon tone', () => {
    const { container } = render(<Stat label="L" value="1" hint="Last 30 days" icon={<svg />} tone="wine" />);
    expect(container.querySelector('.trazos-stat-hint')).toHaveTextContent('Last 30 days');
    expect(container.querySelector('.trazos-stat-icon')).toHaveClass('trazos-stat-icon-wine');
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Stat ref={ref} label="L" value="1" className="extra" data-x="1" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass('trazos-stat', 'extra');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Stat label="Net payroll" value="$ 148M" delta="+4.2%" trend="up" trendLabel="Up from last month" hint="Nov" icon={<svg />} />,
    );
    await expectNoA11yViolations(container);
  });
});
