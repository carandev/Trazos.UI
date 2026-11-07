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
    const stack = container.querySelector('.trazos-toast-container');
    expect(stack).toBeInTheDocument();
    expect(stack).toBeEmptyDOMElement();
  });

  it.each([
    ['showSuccess', 'trazos-toast-success', 'status'],
    ['showError', 'trazos-toast-error', 'alert'],
    ['showWarning', 'trazos-toast-warning', 'status'],
    ['showInfo', 'trazos-toast-info', 'status'],
  ] as const)('%s renders a %s toast with role %s', (method, className, role) => {
    const { container } = setup();
    act(() => {
      getApi()[method]('Saved', 'Done');
    });
    const toast = screen.getByRole(role);
    expect(toast).toHaveClass('trazos-toast', className);
    expect(toast).not.toHaveClass('trazos-toast-exit');
    expect(container.querySelector('.trazos-toast-icon svg')).toBeInTheDocument();
    expect(toast.querySelector('.trazos-toast-content strong.trazos-toast-title')).toHaveTextContent('Done');
    expect(toast.querySelector('.trazos-toast-content p.trazos-toast-message')).toHaveTextContent('Saved');
  });

  it('omits the title when not given', () => {
    const { container } = setup();
    act(() => {
      getApi().showInfo('Only message');
    });
    expect(container.querySelector('.trazos-toast-title')).toBeNull();
    expect(container.querySelector('.trazos-toast-message')).toHaveTextContent('Only message');
  });

  it('stacks toasts in insertion order', () => {
    const { container } = setup();
    act(() => {
      getApi().showSuccess('First');
      getApi().showError('Second');
    });
    const messages = [...container.querySelectorAll('.trazos-toast-message')].map((m) => m.textContent);
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
    expect(container.querySelector('.trazos-toast')).not.toHaveClass('trazos-toast-exit');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector('.trazos-toast')).toHaveClass('trazos-toast-exit');
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(container.querySelector('.trazos-toast')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector('.trazos-toast')).toBeNull();
  });

  it('dismisses from the close button with the default Spanish label', () => {
    const { container } = setup();
    act(() => {
      getApi().showWarning('Careful');
    });
    const close = screen.getByRole('button', { name: 'Cerrar notificación' });
    expect(close).toHaveClass('trazos-toast-close');
    expect(close).toHaveAttribute('type', 'button');
    fireEvent.click(close);
    expect(container.querySelector('.trazos-toast')).toHaveClass('trazos-toast-exit');
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector('.trazos-toast')).toBeNull();
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
