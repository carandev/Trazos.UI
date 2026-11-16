import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchInput } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Testing Library only advances fake timers inside its async helpers when it
    // detects Jest; expose the Vitest equivalent so user-event does not hang.
    vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  // delay: null types without timers of its own, so the fake clock only moves when a test moves it.
  const user = () => userEvent.setup({ delay: null });

  it('renders a search box with a search icon and the default accessible name', () => {
    const { container } = render(<SearchInput placeholder="Find" />);
    const box = screen.getByRole('searchbox', { name: 'Search' });
    expect(box).toHaveAttribute('type', 'search');
    expect(box).toHaveAttribute('autocomplete', 'off');
    expect(box).toHaveAttribute('placeholder', 'Find');
    expect(box).toHaveClass('trazos-input-control', 'trazos-search-control');
    expect(box.id).toMatch(/^trazos-search-/);
    expect(container.firstElementChild).toHaveClass('trazos-input-group', 'trazos-search');
    const icon = container.querySelector('.trazos-input-icon.leading svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses the visible label instead of ariaLabel when there is one', () => {
    render(<SearchInput label="Employees" ariaLabel="Ignored" />);
    const box = screen.getByRole('searchbox', { name: 'Employees' });
    expect(box).not.toHaveAttribute('aria-label');
  });

  it('accepts a custom ariaLabel', () => {
    render(<SearchInput ariaLabel="Buscar" />);
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('debounces onValueChange until the user pauses', async () => {
    const onValueChange = vi.fn();
    render(<SearchInput onValueChange={onValueChange} debounce={300} />);
    await user().type(screen.getByRole('searchbox'), 'ana');
    expect(screen.getByRole('searchbox')).toHaveValue('ana');
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('ana');
  });

  it('defaults the debounce to 300 ms', async () => {
    const onValueChange = vi.fn();
    render(<SearchInput onValueChange={onValueChange} />);
    await user().type(screen.getByRole('searchbox'), 'x');
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onValueChange).toHaveBeenCalledWith('x');
  });

  it('reports every key immediately when debounce is 0', async () => {
    const onValueChange = vi.fn();
    render(<SearchInput onValueChange={onValueChange} debounce={0} />);
    await user().type(screen.getByRole('searchbox'), 'lu');
    expect(onValueChange.mock.calls).toEqual([['l'], ['lu']]);
  });

  it('clears with the clear button, reports the empty value at once and returns focus', async () => {
    const onValueChange = vi.fn();
    render(<SearchInput defaultValue="maria" onValueChange={onValueChange} clearLabel="Clear the filter" />);
    const clear = screen.getByRole('button', { name: 'Clear the filter' });
    expect(clear).toHaveClass('trazos-search-clear');
    expect(clear).toHaveAttribute('type', 'button');
    await user().click(clear);
    expect(onValueChange).toHaveBeenCalledWith('');
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('clears on Escape and cancels a pending debounced change', async () => {
    const onValueChange = vi.fn();
    render(<SearchInput onValueChange={onValueChange} />);
    await user().type(screen.getByRole('searchbox'), 'ab{Escape}');
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(onValueChange.mock.calls).toEqual([['']]);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onValueChange.mock.calls).toEqual([['']]);
  });

  it('uses the default clear label and hides the clear button while disabled', () => {
    const { rerender } = render(<SearchInput value="ana" onValueChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    rerender(<SearchInput value="ana" onValueChange={() => undefined} disabled />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeDisabled();
  });

  it('shows a new controlled value from the parent', () => {
    function Parent() {
      const [value, setValue] = useState('first');
      return (
        <>
          <SearchInput value={value} onValueChange={setValue} />
          <button type="button" onClick={() => { setValue('second'); }}>
            Reset
          </button>
        </>
      );
    }
    render(<Parent />);
    expect(screen.getByRole('searchbox')).toHaveValue('first');
    act(() => {
      screen.getByRole('button', { name: 'Reset' }).click();
    });
    expect(screen.getByRole('searchbox')).toHaveValue('second');
  });

  it('does not report a pending change after unmount', async () => {
    const onValueChange = vi.fn();
    const { unmount } = render(<SearchInput onValueChange={onValueChange} />);
    await user().type(screen.getByRole('searchbox'), 'a');
    unmount();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('wires helper and error text and forwards ref and attributes', () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchInput ref={ref} id="q" name="q" helperText="Name or ID" error="Too short" />);
    const box = screen.getByRole('searchbox');
    expect(ref.current).toBe(box);
    expect(box).toHaveAttribute('id', 'q');
    expect(box).toHaveAttribute('name', 'q');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription('Too short');
  });

  it('has no accessibility violations', async () => {
    vi.useRealTimers();
    const { container } = render(<SearchInput defaultValue="ana" helperText="Help" />);
    await expectNoA11yViolations(container);
  });
});
