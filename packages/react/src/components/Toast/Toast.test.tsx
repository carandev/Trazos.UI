import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './index';
import type { ToastApi } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

let api: ToastApi | undefined;

function Capture() {
  const toast = useToast();
  useEffect(() => {
    api = toast;
  }, [toast]);
  return null;
}

function getApi(): ToastApi {
  if (api === undefined) throw new Error('toast api not captured');
  return api;
}

function setup(props: { closeButtonAriaLabel?: string } = {}) {
  return render(
    <ToastProvider {...props}>
      <Capture />
    </ToastProvider>,
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    api = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an empty toast container', () => {
    const { container } = setup();
    const stack = container.querySelector('.toast-container');
    expect(stack).toBeInTheDocument();
    expect(stack).toBeEmptyDOMElement();
  });

  it.each([
    ['showSuccess', 'toast-success', 'status'],
    ['showError', 'toast-error', 'alert'],
    ['showWarning', 'toast-warning', 'status'],
    ['showInfo', 'toast-info', 'status'],
  ] as const)('%s renders a %s toast with role %s', (method, className, role) => {
    const { container } = setup();
    act(() => {
      getApi()[method]('Saved', 'Done');
    });
    const toast = screen.getByRole(role);
    expect(toast).toHaveClass('toast', className);
    expect(toast).not.toHaveClass('toast-exit');
    expect(container.querySelector('.toast-icon svg')).toBeInTheDocument();
    expect(toast.querySelector('.toast-content strong.toast-title')).toHaveTextContent('Done');
    expect(toast.querySelector('.toast-content p.toast-message')).toHaveTextContent('Saved');
  });

  it('omits the title when not given', () => {
    const { container } = setup();
    act(() => {
      getApi().showInfo('Only message');
    });
    expect(container.querySelector('.toast-title')).toBeNull();
    expect(container.querySelector('.toast-message')).toHaveTextContent('Only message');
  });

  it('stacks toasts in insertion order', () => {
    const { container } = setup();
    act(() => {
      getApi().showSuccess('First');
      getApi().showError('Second');
    });
    const messages = [...container.querySelectorAll('.toast-message')].map((m) => m.textContent);
    expect(messages).toEqual(['First', 'Second']);
  });

  it('auto-dismisses after 5000ms with a 300ms exit animation', () => {
    const { container } = setup();
    act(() => {
      getApi().showSuccess('Saved');
    });
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(container.querySelector('.toast')).not.toHaveClass('toast-exit');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector('.toast')).toHaveClass('toast-exit');
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(container.querySelector('.toast')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector('.toast')).toBeNull();
  });

  it('dismisses from the close button with the default Spanish label', () => {
    const { container } = setup();
    act(() => {
      getApi().showWarning('Careful');
    });
    const close = screen.getByRole('button', { name: 'Cerrar notificación' });
    expect(close).toHaveClass('toast-close');
    expect(close).toHaveAttribute('type', 'button');
    fireEvent.click(close);
    expect(container.querySelector('.toast')).toHaveClass('toast-exit');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector('.toast')).toBeNull();
  });

  it('accepts a custom close label', () => {
    setup({ closeButtonAriaLabel: 'Dismiss' });
    act(() => {
      getApi().showInfo('Hi');
    });
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('is a no-op outside a provider', () => {
    const { container } = render(<Capture />);
    expect(() => {
      getApi().showSuccess('x');
    }).not.toThrow();
    expect(container).toBeEmptyDOMElement();
  });

  it('clears pending timers on unmount', () => {
    const { unmount } = setup();
    act(() => {
      getApi().showSuccess('Saved');
    });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('has no accessibility violations', async () => {
    vi.useRealTimers();
    const { container } = setup();
    act(() => {
      getApi().showError('Failed', 'Error');
      getApi().showSuccess('Saved');
    });
    await expectNoA11yViolations(container);
  });
});
