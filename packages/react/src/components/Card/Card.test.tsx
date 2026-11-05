import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Card } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

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
});
