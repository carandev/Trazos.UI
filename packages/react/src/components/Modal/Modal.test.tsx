import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Modal title="Hi">Body</Modal>);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the Razor structure with the medium size by default', () => {
    const { container } = render(
      <Modal open title="Edit" footer={<button type="button">Ok</button>}>
        Body text
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Edit' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveClass('modal-container', 'modal-medium');
    expect(dialog.parentElement).toHaveClass('modal-backdrop');
    expect(container.querySelector('.modal-header .modal-title')).toHaveTextContent('Edit');
    expect(container.querySelector('.modal-body')).toHaveTextContent('Body text');
    expect(container.querySelector('.modal-footer')).toContainElement(screen.getByRole('button', { name: 'Ok' }));
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveClass('modal-close');
  });

  it('omits the footer and the close button when not requested', () => {
    const { container } = render(
      <Modal open title="T" showCloseButton={false}>
        Body
      </Modal>,
    );
    expect(container.querySelector('.modal-footer')).toBeNull();
    expect(container.querySelector('.modal-close')).toBeNull();
  });

  it.each([
    ['small', 'modal-small'],
    ['medium', 'modal-medium'],
    ['large', 'modal-large'],
  ] as const)('maps size %s to %s', (size, className) => {
    render(
      <Modal open title="T" size={size}>
        Body
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveClass(className);
  });

  it('closes from the close button, calling onOpenChange(false) then onClose', async () => {
    const calls: string[] = [];
    render(
      <Modal
        open
        title="T"
        onOpenChange={(open) => calls.push(`change:${String(open)}`)}
        onClose={() => calls.push('close')}
      >
        Body
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(calls).toEqual(['change:false', 'close']);
  });

  it('closes on backdrop click by default but not on clicks inside the container', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open title="T" onClose={onClose}>
        Body
      </Modal>,
    );
    await userEvent.click(screen.getByText('Body'));
    expect(onClose).not.toHaveBeenCalled();
    const backdrop = container.querySelector('.modal-backdrop');
    if (!(backdrop instanceof HTMLElement)) throw new Error('backdrop missing');
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores backdrop clicks when closeOnBackdropClick is false', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open title="T" closeOnBackdropClick={false} onClose={onClose}>
        Body
      </Modal>,
    );
    const backdrop = container.querySelector('.modal-backdrop');
    if (!(backdrop instanceof HTMLElement)) throw new Error('backdrop missing');
    await userEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open title="T" onOpenChange={onOpenChange}>
        Body
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('works uncontrolled with defaultOpen', async () => {
    render(
      <Modal defaultOpen title="T">
        Body
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves focus in, traps Tab and restores focus on close', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            Open
          </button>
          <Modal open={open} onOpenChange={setOpen} title="T" footer={<button type="button">Last</button>}>
            <input aria-label="Name" />
          </Modal>
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(opener);
    const close = screen.getByRole('button', { name: 'Cerrar' });
    const last = screen.getByRole('button', { name: 'Last' });
    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    await userEvent.tab();
    expect(last).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(last).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('accepts a custom close label, forwards the ref, classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Modal open title="T" ref={ref} className="extra" data-x="1" closeButtonAriaLabel="Close">
        Body
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(ref.current).toBe(dialog);
    expect(dialog).toHaveClass('extra');
    expect(dialog).toHaveAttribute('data-x', '1');
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Modal open title="Edit" footer={<button type="button">Ok</button>}>
        Body
      </Modal>,
    );
    await expectNoA11yViolations(container);
  });
});
