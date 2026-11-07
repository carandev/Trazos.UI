import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Badge', () => {
  it('renders a neutral badge by default', () => {
    render(<Badge>Draft</Badge>);
    const badge = screen.getByText('Draft').parentElement;
    expect(badge).toHaveClass('trazos-badge-box', 'trazos-badge-neutral');
  });

  it.each(['success', 'warning', 'error', 'info', 'lavender', 'cream', 'neutral'] as const)(
    'maps variant %s to its class',
    (variant) => {
      render(<Badge variant={variant}>Label</Badge>);
      expect(screen.getByText('Label').parentElement).toHaveClass(`trazos-badge-${variant}`);
    },
  );

  it('renders the leading icon slot only when an icon is given', () => {
    const { container, rerender } = render(<Badge>Plain</Badge>);
    expect(container.querySelector('.trazos-badge-icon')).toBeNull();
    rerender(<Badge leadingIcon={<svg data-testid="icon" />}>Iconic</Badge>);
    expect(container.querySelector('.trazos-badge-icon')).toContainElement(screen.getByTestId('icon'));
  });

  it('passes classes and native attributes through', () => {
    render(
      <Badge className="extra" title="Status" data-x="1">
        Live
      </Badge>,
    );
    const badge = screen.getByTitle('Status');
    expect(badge).toHaveClass('trazos-badge-box', 'extra');
    expect(badge).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge variant="success">Active</Badge>);
    await expectNoA11yViolations(container);
  });

  it('uppercases its text by default', () => {
    render(<Badge>tag</Badge>);
    expect(getComputedStyle(screen.getByText('tag').parentElement as Element).textTransform).toBe('uppercase');
  });

  it('keeps the original case with uppercase={false}', () => {
    render(<Badge uppercase={false}>lazytsql</Badge>);
    expect(getComputedStyle(screen.getByText('lazytsql').parentElement as Element).textTransform).toBe('none');
  });
});
