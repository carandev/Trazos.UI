import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Alert', () => {
  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['danger', 'alert'],
  ] as const)('gives the %s tone its class and the %s live role', (tone, role) => {
    const { container } = render(
      <Alert tone={tone} title="Heads up">
        Body text
      </Alert>,
    );
    const root = screen.getByRole(role);
    expect(root).toHaveClass('trazos-alert', `trazos-alert-${tone}`);
    expect(root.querySelector('.trazos-alert-title')).toHaveTextContent('Heads up');
    expect(root.querySelector('.trazos-alert-body')).toHaveTextContent('Body text');
    expect(container.querySelector('.trazos-alert-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.trazos-alert-icon svg')).not.toBeNull();
  });

  it('defaults to the info tone', () => {
    render(<Alert>Body</Alert>);
    expect(screen.getByRole('status')).toHaveClass('trazos-alert-info');
  });

  it('draws a different default icon for each tone', () => {
    const paths = (['info', 'success', 'warning', 'danger'] as const).map((tone) => {
      const { container, unmount } = render(<Alert tone={tone}>x</Alert>);
      const d = container.querySelector('.trazos-alert-icon path')?.getAttribute('d');
      unmount();
      return d;
    });
    expect(new Set(paths).size).toBe(4);
  });

  it('renders no title, body or actions when they are not given', () => {
    const { container } = render(<Alert />);
    expect(container.querySelector('.trazos-alert-title')).toBeNull();
    expect(container.querySelector('.trazos-alert-body')).toBeNull();
    expect(container.querySelector('.trazos-alert-actions')).toBeNull();
    expect(container.querySelector('.trazos-alert-dismiss')).toBeNull();
  });

  it('renders actions in their own area', () => {
    render(<Alert actions={<button type="button">Undo</button>}>Saved</Alert>);
    expect(screen.getByRole('button', { name: 'Undo' }).parentElement).toHaveClass('trazos-alert-actions');
  });

  it('replaces the tone icon with a custom icon', () => {
    const { container } = render(<Alert icon={<svg data-testid="custom" />}>x</Alert>);
    const icon = container.querySelector('.trazos-alert-icon');
    expect(icon).toContainElement(screen.getByTestId('custom'));
    expect(icon?.querySelectorAll('svg')).toHaveLength(1);
  });

  it('hides itself and calls onDismiss when the dismiss button is pressed', async () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <Alert dismissible dismissLabel="Cerrar aviso" onDismiss={onDismiss}>
        Body
      </Alert>,
    );
    const button = screen.getByRole('button', { name: 'Cerrar aviso' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('trazos-alert-dismiss');
    await userEvent.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.trazos-alert')).toBeNull();
  });

  it('names the dismiss button "Dismiss" by default', () => {
    render(<Alert dismissible>Body</Alert>);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Alert ref={ref} className="extra" data-x="1">
        x
      </Alert>,
    );
    const root = screen.getByRole('status');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('trazos-alert', 'extra');
    expect(root).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Alert tone="warning" title="Careful" dismissible actions={<button type="button">Review</button>}>
        <p>Something needs your attention.</p>
      </Alert>,
    );
    await expectNoA11yViolations(container);
  });
});
