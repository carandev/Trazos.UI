import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ConfirmDialogProvider, useConfirm } from './index';
import type { ConfirmDialogOptions, ConfirmOverrides } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

type Request =
  | { kind: 'options'; options: ConfirmDialogOptions }
  | { kind: 'message'; message: string; overrides?: ConfirmOverrides };

function Asker({ request }: { request: Request }) {
  const confirm = useConfirm();
  const [result, setResult] = useState('pending');
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const promise =
            request.kind === 'options' ? confirm(request.options) : confirm(request.message, request.overrides);
          void promise.then((value) => {
            setResult(String(value));
          });
        }}
      >
        Ask
      </button>
      <output>{result}</output>
    </>
  );
}

function setup(request: Request = { kind: 'message', message: '¿Eliminar el registro?' }) {
  const utils = render(
    <ConfirmDialogProvider>
      <Asker request={request} />
    </ConfirmDialogProvider>,
  );
  return { ...utils, ask: () => userEvent.click(screen.getByRole('button', { name: 'Ask' })) };
}

describe('ConfirmDialog', () => {
  it('renders nothing until confirm is called', () => {
    const { container } = setup();
    expect(container.querySelector('.trazos-modal-backdrop')).toBeNull();
  });

  it('shows the message with the Razor defaults', async () => {
    const { ask } = setup();
    await ask();
    const dialog = screen.getByRole('dialog', { name: 'Confirmar acción' });
    expect(dialog).toHaveClass('trazos-modal-small');
    expect(dialog.querySelector('.trazos-modal-body p.trazos-confirm-message')).toHaveTextContent('¿Eliminar el registro?');
    const cancel = screen.getByRole('button', { name: 'Cancelar' });
    const confirm = screen.getByRole('button', { name: 'Confirmar' });
    expect(cancel).toHaveClass('trazos-btn-outline');
    expect(confirm).toHaveClass('trazos-btn-primary');
    expect(dialog.querySelector('.trazos-modal-footer')?.children[0]).toBe(cancel);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('resolves true on confirm and closes', async () => {
    const { ask } = setup();
    await ask();
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('true')).toBeInTheDocument();
  });

  it('resolves false on cancel', async () => {
    const { ask } = setup();
    await ask();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('false')).toBeInTheDocument();
  });

  it('resolves false from the close button', async () => {
    const { ask } = setup();
    await ask();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(await screen.findByText('false')).toBeInTheDocument();
  });

  it('resolves false on Escape', async () => {
    const { ask } = setup();
    await ask();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('false')).toBeInTheDocument();
  });

  it('does not close on backdrop click', async () => {
    const { ask, container } = setup();
    await ask();
    const backdrop = container.querySelector('.trazos-modal-backdrop');
    if (!(backdrop instanceof HTMLElement)) throw new Error('backdrop missing');
    await userEvent.click(backdrop);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('applies full options', async () => {
    const { ask } = setup({
      kind: 'options',
      options: {
        message: 'Delete?',
        title: 'Danger',
        confirmText: 'Delete',
        cancelText: 'Keep',
        confirmVariant: 'wine',
        size: 'large',
      },
    });
    await ask();
    expect(screen.getByRole('dialog', { name: 'Danger' })).toHaveClass('trazos-modal-large');
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('trazos-btn-wine');
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('applies overrides in the (message, overrides) overload', async () => {
    const { ask } = setup({ kind: 'message', message: 'Archive?', overrides: { title: 'Archive', confirmVariant: 'secondary' } });
    await ask();
    expect(screen.getByRole('dialog', { name: 'Archive' })).toHaveClass('trazos-modal-small');
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveClass('trazos-btn-secondary');
  });

  it('resolves false outside a provider without rendering anything', async () => {
    const { container } = render(<Asker request={{ kind: 'message', message: 'x' }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    expect(await screen.findByText('false')).toBeInTheDocument();
    expect(container.querySelector('.trazos-modal-backdrop')).toBeNull();
  });

  it('has no accessibility violations while open', async () => {
    const { ask, container } = setup();
    await ask();
    await expectNoA11yViolations(container);
  });
});
