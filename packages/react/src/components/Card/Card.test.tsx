import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Card } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';
import cardCss from './Card.css?raw';

describe('Card', () => {
  it('renders a default card with only the body when no header or footer is given', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstElementChild;
    expect(card).toHaveClass('trazos-card-box', 'trazos-card-default');
    expect(card?.querySelector('.trazos-card-body')).toHaveTextContent('Content');
    expect(card?.querySelector('.trazos-card-header')).toBeNull();
    expect(card?.querySelector('.trazos-card-footer')).toBeNull();
  });

  it.each([
    ['default', 'trazos-card-default'],
    ['white', 'trazos-card-default'],
    ['lavender', 'trazos-card-lavender'],
    ['interactive', 'trazos-card-interactive'],
  ] as const)('maps variant %s to %s', (variant, className) => {
    const { container } = render(<Card variant={variant}>x</Card>);
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('renders header, body and footer in order', () => {
    const { container } = render(
      <Card header={<span>Head</span>} footer={<span>Foot</span>}>
        Body
      </Card>,
    );
    const parts = [...(container.firstElementChild?.children ?? [])].map((el) => [el.className, el.textContent]);
    expect(parts).toEqual([
      ['trazos-card-header', 'Head'],
      ['trazos-card-body', 'Body'],
      ['trazos-card-footer', 'Foot'],
    ]);
  });

  it('calls onClick with the mouse event', async () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Click me</Card>);
    await userEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]?.[0]).toHaveProperty('type', 'click');
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card ref={ref} className="extra" data-x="1" title="Card title">
        x
      </Card>,
    );
    const card = screen.getByTitle('Card title');
    expect(ref.current).toBe(card);
    expect(card).toHaveClass('trazos-card-box', 'extra');
    expect(card).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card header={<h2>Title</h2>} footer={<p>Footer</p>}>
        <p>Body</p>
      </Card>,
    );
    await expectNoA11yViolations(container);
  });

  it.each(['olive', 'gold', 'wine', 'sky'] as const)('builds the %s tone from its tint, border and text tokens', (tone) => {
    render(<Card variant={tone}>Tone</Card>);
    expect(screen.getByText('Tone').parentElement).toHaveClass(`trazos-card-${tone}`);
    const rule = cardCss.match(new RegExp(`^\\.trazos-card-${tone} \\{[^}]*\\}`, 'm'))?.[0];
    expect(rule).toContain(`var(--trazos-${tone}-tint)`);
    expect(rule).toContain(`var(--trazos-${tone}-border)`);
    expect(rule).toContain(`var(--trazos-${tone}-text)`);
  });

  it('renders media above the body, outside the header divider', () => {
    const { container } = render(
      <Card media={<img src="/cover.png" alt="Cover" />} header="Title">
        Body
      </Card>,
    );
    const media = container.querySelector('.trazos-card-media');
    expect(media).toContainElement(screen.getByAltText('Cover'));
    expect(container.querySelector('.trazos-card-header')).not.toContainElement(screen.getByAltText('Cover'));
    expect(media?.nextElementSibling).toHaveClass('trazos-card-header');
  });

  it('renders no media wrapper without media', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.querySelector('.trazos-card-media')).toBeNull();
  });

  it('lets the body fill the card height with fill', () => {
    const { container, rerender } = render(<Card>Body</Card>);
    const box = container.firstElementChild as Element;
    expect(getComputedStyle(box).display).not.toBe('flex');
    rerender(<Card fill>Body</Card>);
    expect(getComputedStyle(box).display).toBe('flex');
    expect(getComputedStyle(box).flexDirection).toBe('column');
    const body = container.querySelector('.trazos-card-body') as Element;
    expect(getComputedStyle(body).display).toBe('flex');
    expect(getComputedStyle(body).flexGrow).toBe('1');
  });
});
