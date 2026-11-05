import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('EmptyState', () => {
  it('renders only the title by default', () => {
    const { container } = render(<EmptyState title="No orders" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('trazos-empty-state');
    expect(root).not.toHaveClass('is-compact');
    expect(screen.getByRole('heading', { level: 3, name: 'No orders' })).toHaveClass('trazos-empty-state-title');
    expect(root?.querySelector('.trazos-icon-box')).toBeNull();
    expect(root?.querySelector('.trazos-empty-state-description')).toBeNull();
    expect(root?.querySelector('.trazos-empty-state-actions')).toBeNull();
  });

  it('renders the icon in a large cream IconBox by default', () => {
    const { container } = render(<EmptyState title="Empty" icon={<svg data-testid="icon" />} />);
    const box = container.querySelector('.trazos-icon-box');
    expect(box).toHaveClass('trazos-icon-box-cream', 'trazos-icon-box-lg', 'trazos-empty-state-icon');
    expect(box).toHaveAttribute('aria-hidden', 'true');
    expect(box).toContainElement(screen.getByTestId('icon'));
  });

  it('uses the given icon variant and a medium box when compact', () => {
    const { container } = render(<EmptyState title="Empty" icon={<svg />} iconVariant="wine" compact />);
    expect(container.firstElementChild).toHaveClass('is-compact');
    expect(container.querySelector('.trazos-icon-box')).toHaveClass('trazos-icon-box-wine', 'trazos-icon-box-md');
  });

  it('renders description and actions when given, in order', () => {
    const { container } = render(
      <EmptyState title="Empty" description="Nothing here yet." actions={<button type="button">Create</button>} />,
    );
    const classes = [...(container.firstElementChild?.children ?? [])].map((el) => el.className);
    expect(classes).toEqual(['trazos-empty-state-title', 'trazos-empty-state-description', 'trazos-empty-state-actions']);
    expect(screen.getByText('Nothing here yet.')).toHaveClass('trazos-empty-state-description');
    expect(container.querySelector('.trazos-empty-state-actions')).toContainElement(
      screen.getByRole('button', { name: 'Create' }),
    );
  });

  it('does not render an empty description', () => {
    const { container } = render(<EmptyState title="Empty" description="" />);
    expect(container.querySelector('.trazos-empty-state-description')).toBeNull();
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<EmptyState ref={ref} title="Empty" className="extra" data-x="1" />);
    const root = container.firstElementChild;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('trazos-empty-state', 'extra');
    expect(root).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        description="Nothing here."
        icon={<svg />}
        actions={<button type="button">Create</button>}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
