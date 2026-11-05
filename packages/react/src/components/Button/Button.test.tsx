import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Button', () => {
  it('renders a primary, medium, type="button" button by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('trazos-btn', 'trazos-btn-primary', 'trazos-btn-md');
  });

  it.each([
    ['primary', 'trazos-btn-primary'],
    ['wine', 'trazos-btn-wine'],
    ['secondary', 'trazos-btn-secondary'],
    ['outline', 'trazos-btn-outline'],
    ['cream', 'trazos-btn-cream'],
    ['lavender', 'trazos-btn-lavender'],
    ['ghost', 'trazos-btn-ghost'],
  ] as const)('maps variant %s to %s', (variant, className) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass(className);
  });

  it.each([
    ['small', 'trazos-btn-sm'],
    ['medium', 'trazos-btn-md'],
    ['large', 'trazos-btn-lg'],
  ] as const)('maps size %s to %s', (size, className) => {
    render(<Button size={size}>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass(className);
  });

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not fire onClick while loading, and hides the leading icon', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading onClick={onClick} leadingIcon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>
        Saving
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.trazos-btn-spinner')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByTestId('lead')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trail')).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders leading and trailing icons in their slots', () => {
    const { container } = render(
      <Button leadingIcon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>
        Next
      </Button>,
    );
    expect(container.querySelector('.trazos-btn-leading-icon')).toContainElement(screen.getByTestId('lead'));
    expect(container.querySelector('.trazos-btn-trailing-icon')).toContainElement(screen.getByTestId('trail'));
    expect(container.querySelector('.trazos-btn-text')).toHaveTextContent('Next');
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} type="submit" className="extra" aria-label="Send form" data-x="1">
        Send
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Send form' });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('extra');
    expect(button).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Save</Button>);
    await expectNoA11yViolations(container);
  });
});
