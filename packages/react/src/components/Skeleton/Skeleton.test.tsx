import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Skeleton', () => {
  it('renders one hidden text skeleton by default', () => {
    const { container } = render(<Skeleton />);
    const items = container.querySelectorAll('div');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveClass('trazos-skeleton', 'trazos-skeleton-text');
    expect(items[0]).toHaveAttribute('aria-hidden', 'true');
    expect(items[0]).not.toHaveAttribute('style');
  });

  it.each(['text', 'circular', 'card', 'rounded'] as const)('maps variant %s to its class', (variant) => {
    const { container } = render(<Skeleton variant={variant} />);
    expect(container.firstElementChild).toHaveClass(`trazos-skeleton-${variant}`);
  });

  it('renders `count` skeletons, each with the width/height style and extra class', () => {
    const { container } = render(<Skeleton count={3} width="50%" height="2rem" className="extra" />);
    const items = container.querySelectorAll<HTMLElement>('.trazos-skeleton');
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item).toHaveClass('extra');
      expect(item.style.width).toBe('50%');
      expect(item.style.height).toBe('2rem');
    }
  });

  it('renders nothing when count is 0', () => {
    const { container } = render(<Skeleton count={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('passes native attributes and merges style on every skeleton', () => {
    const { container } = render(<Skeleton count={2} data-x="1" width="10px" style={{ opacity: 0.5 }} />);
    for (const item of container.querySelectorAll('.trazos-skeleton')) {
      expect(item).toHaveAttribute('data-x', '1');
      expect(item).toHaveStyle({ width: '10px', opacity: '0.5' });
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Skeleton count={2} variant="card" />);
    await expectNoA11yViolations(container);
  });
});
