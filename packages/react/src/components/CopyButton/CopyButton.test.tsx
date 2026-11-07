import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyButton } from './CopyButton';
import { expectNoA11yViolations } from '../../../test/a11y';

const labels = { label: 'Copy email', copiedLabel: 'Copied!' };

function stubClipboard(writeText: ((value: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText === undefined ? undefined : { writeText },
  });
}

async function click() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button'));
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  stubClipboard(undefined);
});

describe('CopyButton', () => {
  it('uses the label as its accessible name and shows no note at first', () => {
    stubClipboard(vi.fn());
    const { container } = render(<CopyButton value="a@b.co" {...labels} />);
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
    expect(container.querySelector('.trazos-copy-button-note')).toBeNull();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('copies the value, then shows the note, the check icon and an announcement', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const { container } = render(<CopyButton value="a@b.co" {...labels} icon={<svg data-testid="icon" />} checkIcon={<svg data-testid="check" />} />);
    await click();
    expect(writeText).toHaveBeenCalledWith('a@b.co');
    expect(screen.getByTestId('check')).toBeInTheDocument();
    expect(screen.queryByTestId('icon')).toBeNull();
    const note = container.querySelector('.trazos-copy-button-note');
    expect(note).toHaveTextContent('Copied!');
    expect(note).toHaveClass('trazos-handwriting');
    expect(note).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Copied!');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('goes back to idle after about 2 seconds', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const { container } = render(<CopyButton value="a@b.co" {...labels} />);
    await click();
    await act(async () => {
      vi.advanceTimersByTime(1999);
      await Promise.resolve();
    });
    expect(container.querySelector('.trazos-copy-button-note')).not.toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(container.querySelector('.trazos-copy-button-note')).toBeNull();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('restarts the timer when clicked again', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const { container } = render(<CopyButton value="a@b.co" {...labels} />);
    await click();
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    await click();
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(container.querySelector('.trazos-copy-button-note')).not.toBeNull();
  });

  it('does not touch state after unmounting', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { unmount } = render(<CopyButton value="a@b.co" {...labels} />);
    await click();
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('calls onCopied after a successful copy', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const onCopied = vi.fn();
    render(<CopyButton value="a@b.co" {...labels} onCopied={onCopied} />);
    await click();
    expect(onCopied).toHaveBeenCalledWith('a@b.co');
  });

  it('runs the fallback when the clipboard API is unavailable, without claiming it copied', async () => {
    stubClipboard(undefined);
    const fallback = vi.fn();
    const { container } = render(<CopyButton value="a@b.co" {...labels} fallback={fallback} />);
    await click();
    expect(fallback).toHaveBeenCalledWith('a@b.co');
    expect(container.querySelector('.trazos-copy-button-note')).toBeNull();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('runs the fallback when the clipboard rejects', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    const fallback = vi.fn();
    render(<CopyButton value="a@b.co" {...labels} fallback={fallback} />);
    await click();
    expect(fallback).toHaveBeenCalledWith('a@b.co');
  });

  it('shows the error label when copying fails and there is no fallback', async () => {
    stubClipboard(undefined);
    const { container } = render(<CopyButton value="a@b.co" {...labels} errorLabel="Could not copy" />);
    await click();
    expect(container.querySelector('.trazos-copy-button-note')).toHaveTextContent('Could not copy');
    expect(screen.getByRole('status')).toHaveTextContent('Could not copy');
  });

  it('stays silent on failure without a fallback or an error label', async () => {
    stubClipboard(undefined);
    const { container } = render(<CopyButton value="a@b.co" {...labels} />);
    await click();
    expect(container.querySelector('.trazos-copy-button-note')).toBeNull();
  });

  it('forwards button props and still calls the host onClick', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const onClick = vi.fn();
    render(<CopyButton value="a@b.co" {...labels} variant="outline" onClick={onClick} />);
    await click();
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button')).toHaveClass('trazos-btn-outline');
  });

  it('has no accessibility violations', async () => {
    vi.useRealTimers();
    stubClipboard(vi.fn());
    const { container } = render(<CopyButton value="a@b.co" {...labels} />);
    await expectNoA11yViolations(container);
  });
});
