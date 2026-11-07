import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { LinkButton } from './LinkButton';
import { expectNoA11yViolations } from '../../../test/a11y';
import buttonCss from './Button.css?raw';

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

  // jsdom has no user-agent font rule for buttons, so computed style cannot
  // tell this apart from a missing rule. The stylesheet itself has to say it.
  it('declares the inherited font, because browsers do not inherit it into native buttons', () => {
    const baseRule = buttonCss.match(/^\.trazos-btn \{[^}]*\}/m)?.[0];
    expect(baseRule).toContain('font-family: inherit;');
  });

  it.each(['leading', 'trailing'] as const)('centers the %s icon wrapper on the label', (position) => {
    const { container } = render(
      <Button {...{ [`${position}Icon`]: <svg /> }}>Save</Button>,
    );
    const wrapper = container.querySelector(`.trazos-btn-${position}-icon`);
    if (wrapper == null) throw new Error('no icon wrapper');
    expect(getComputedStyle(wrapper).display).toBe('inline-flex');
    expect(getComputedStyle(wrapper).alignItems).toBe('center');
  });
});

describe('LinkButton', () => {
  it('renders a link with the variant and size classes of Button', () => {
    render(
      <LinkButton href="/cv.pdf" variant="wine" size="large">
        Resume
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: 'Resume' });
    expect(link).toHaveAttribute('href', '/cv.pdf');
    expect(link).toHaveClass('trazos-btn', 'trazos-btn-wine', 'trazos-btn-lg');
  });

  it('defaults to the primary medium style', () => {
    render(<LinkButton href="/">Home</LinkButton>);
    expect(screen.getByRole('link')).toHaveClass('trazos-btn-primary', 'trazos-btn-md');
  });

  it('renders both icons in the Button wrappers', () => {
    const { container } = render(
      <LinkButton href="/" leadingIcon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>
        Home
      </LinkButton>,
    );
    expect(container.querySelector('.trazos-btn-leading-icon')).toContainElement(screen.getByTestId('lead'));
    expect(container.querySelector('.trazos-btn-trailing-icon')).toContainElement(screen.getByTestId('trail'));
  });

  it('forwards native anchor attributes and className', () => {
    render(
      <LinkButton href="mailto:a@b.co" download target="_blank" rel="noreferrer" className="extra">
        Mail
      </LinkButton>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveAttribute('download');
    expect(link).toHaveClass('extra');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LinkButton href="/">Home</LinkButton>);
    await expectNoA11yViolations(container);
  });
});

describe('IconButton', () => {
  it('uses the label as its accessible name and defaults to a non-submitting ghost button', () => {
    render(
      <IconButton label="Open menu">
        <svg />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('trazos-icon-btn', 'trazos-btn-ghost');
  });

  it.each(['primary', 'wine', 'secondary', 'outline', 'cream', 'lavender', 'ghost'] as const)(
    'supports the %s variant',
    (variant) => {
      render(
        <IconButton label="Go" variant={variant}>
          <svg />
        </IconButton>,
      );
      expect(screen.getByRole('button')).toHaveClass(`trazos-btn-${variant}`);
    },
  );

  it.each([
    ['medium', '44px'],
    ['large', '52px'],
  ] as const)('keeps a square %s hit area of at least 44px', (size, px) => {
    render(
      <IconButton label="Go" size={size}>
        <svg />
      </IconButton>,
    );
    const style = getComputedStyle(screen.getByRole('button'));
    expect(style.width).toBe(px);
    expect(style.height).toBe(px);
  });

  it('shows a spinner instead of the icon while loading', () => {
    const { container } = render(
      <IconButton label="Go" loading>
        <svg data-testid="icon" />
      </IconButton>,
    );
    expect(screen.queryByTestId('icon')).toBeNull();
    expect(container.querySelector('.trazos-btn-spinner')).not.toBeNull();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('forwards native attributes', () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Go" aria-expanded="true" onClick={onClick}>
        <svg />
      </IconButton>,
    );
    const button = screen.getByRole('button');
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <IconButton label="Go">
        <svg />
      </IconButton>,
    );
    await expectNoA11yViolations(container);
  });
});
