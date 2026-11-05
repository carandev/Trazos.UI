import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { IconBox } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('IconBox', () => {
  it('renders a primary, medium, decorative box by default', () => {
    const { container } = render(
      <IconBox>
        <svg data-testid="icon" />
      </IconBox>,
    );
    const box = container.firstElementChild;
    expect(box).toHaveClass('trazos-icon-box', 'trazos-icon-box-primary', 'trazos-icon-box-md');
    expect(box).toHaveAttribute('aria-hidden', 'true');
    expect(box?.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it.each(['primary', 'lavender', 'cream', 'wine', 'neutral'] as const)('maps variant %s to its class', (variant) => {
    const { container } = render(<IconBox variant={variant} />);
    expect(container.firstElementChild).toHaveClass(`trazos-icon-box-${variant}`);
  });

  it.each([
    ['small', 'trazos-icon-box-sm'],
    ['medium', 'trazos-icon-box-md'],
    ['large', 'trazos-icon-box-lg'],
  ] as const)('maps size %s to %s', (size, className) => {
    const { container } = render(<IconBox size={size} />);
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<IconBox ref={ref} className="extra" data-x="1" />);
    const box = container.firstElementChild;
    expect(ref.current).toBe(box);
    expect(box).toHaveClass('trazos-icon-box', 'extra');
    expect(box).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <IconBox>
        <svg />
      </IconBox>,
    );
    await expectNoA11yViolations(container);
  });
});
