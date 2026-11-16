import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Divider } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';
import dividerCss from './Divider.css?raw';

// jsdom does not resolve var() inside border shorthands, so the line widths are read from the stylesheet.
function rule(selector: string): string {
  return dividerCss.match(new RegExp(`^${selector.replace(/\./g, '\\.')} \\{[^}]*\\}`, 'm'))?.[0] ?? '';
}

describe('Divider', () => {
  it('is a horizontal separator without an orientation attribute by default', () => {
    render(<Divider />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveClass('trazos-divider', 'trazos-divider-horizontal');
    expect(sep).not.toHaveAttribute('aria-orientation');
    expect(sep).not.toHaveAttribute('aria-label');
    expect(sep).toBeEmptyDOMElement();
    expect(rule('.trazos-divider.trazos-divider-horizontal')).toContain('border-top-width: 1.5px;');
  });

  it('shows a label between two lines and uses it as the accessible name', () => {
    const { container } = render(<Divider label="Deductions" />);
    const sep = screen.getByRole('separator', { name: 'Deductions' });
    expect(sep).toHaveClass('trazos-divider-labeled');
    expect(container.querySelector('.trazos-divider-label')).toHaveTextContent('Deductions');
    expect(container.querySelectorAll('.trazos-divider-line[aria-hidden="true"]')).toHaveLength(2);
    expect(container.querySelector('.trazos-divider-label')).toHaveAttribute('aria-hidden', 'true');
    expect(getComputedStyle(sep).display).toBe('flex');
  });

  it('is vertical with aria-orientation and ignores the label', () => {
    const { container } = render(<Divider vertical label="Ignored" />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    expect(sep).toHaveClass('trazos-divider-vertical');
    expect(sep).not.toHaveClass('trazos-divider-horizontal');
    expect(sep).not.toHaveAttribute('aria-label');
    expect(container.querySelector('.trazos-divider-label')).toBeNull();
    expect(rule('.trazos-divider.trazos-divider-vertical')).toContain('border-left-width: 1.5px;');
    expect(getComputedStyle(sep).alignSelf).toBe('stretch');
  });

  it('draws a dashed line', () => {
    render(<Divider dashed />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveClass('trazos-divider-dashed');
    expect(getComputedStyle(sep).getPropertyValue('--trazos-divider-style').trim()).toBe('dashed');
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Divider ref={ref} className="extra" data-x="1" />);
    const sep = screen.getByRole('separator');
    expect(ref.current).toBe(sep);
    expect(sep).toHaveClass('extra');
    expect(sep).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Divider />
        <Divider label="Section" />
        <Divider vertical dashed />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
