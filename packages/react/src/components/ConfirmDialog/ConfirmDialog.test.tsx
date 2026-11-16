import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialogProvider, useConfirm, usePrompt } from './index';
import type { ConfirmDialogOptions, ConfirmOverrides, PromptDialogOptions, PromptResult } from './index';
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

const rejectOptions: PromptDialogOptions = {
  message: 'The payroll will go back to draft.',
  title: 'Reject payroll',
  inputLabel: 'Reason',
  confirmText: 'Reject',
  minLength: 10,
  requiredMessage: 'Write a reason.',
  minLengthMessage: 'Use at least {0} characters.',
};

function PromptAsker({ options, onResult }: { options: PromptDialogOptions; onResult: (r: PromptResult) => void }) {
  const prompt = usePrompt();
  return (
    <button
      type="button"
      onClick={() => {
        void prompt(options).then(onResult);
      }}
    >
      Prompt
    </button>
  );
}

function setupPrompt(options: PromptDialogOptions = rejectOptions) {
  const onResult = vi.fn<(r: PromptResult) => void>();
  const user = userEvent.setup();
  const utils = render(
    <ConfirmDialogProvider>
      <PromptAsker options={options} onResult={onResult} />
    </ConfirmDialogProvider>,
  );
  return { ...utils, user, onResult, open: () => user.click(screen.getByRole('button', { name: 'Prompt' })) };
}

describe('prompt dialog', () => {
  it('requires valid text before confirming and resolves the trimmed text', async () => {
    const { user, open, onResult } = setupPrompt();
    await open();
    const dialog = screen.getByRole('dialog', { name: 'Reject payroll' });
    expect(dialog).toHaveClass('trazos-modal-small');
    expect(dialog.querySelector('.trazos-prompt-body p.trazos-confirm-message')).toHaveTextContent(
      'The payroll will go back to draft.',
    );
    const field = screen.getByRole('textbox', { name: /Reason/ });
    expect(field).toHaveAttribute('maxlength', '500');
    expect(field).toHaveAttribute('aria-required', 'true');

    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Write a reason.');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(onResult).not.toHaveBeenCalled();

    await user.type(field, 'too short');
    expect(screen.getByRole('alert')).toHaveTextContent('Use at least 10 characters.');
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onResult).not.toHaveBeenCalled();

    await user.clear(field);
    await user.type(field, '  Wrong overtime hours  ');
    expect(screen.queryByRole('alert')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onResult).toHaveBeenCalledExactlyOnceWith({ confirmed: true, text: 'Wrong overtime hours' });
  });

  it('resolves an unconfirmed result on cancel, close and Escape', async () => {
    const { user, open, onResult } = setupPrompt();
    await open();
    await user.type(screen.getByRole('textbox'), 'Some reason here');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onResult).toHaveBeenLastCalledWith({ confirmed: false, text: null });
    await open();
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onResult).toHaveBeenLastCalledWith({ confirmed: false, text: null });
    await open();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onResult).toHaveBeenCalledTimes(3);
    expect(onResult).toHaveBeenLastCalledWith({ confirmed: false, text: null });
  });

  it('starts empty each time it opens', async () => {
    const { user, open } = setupPrompt();
    await open();
    await user.type(screen.getByRole('textbox'), 'draft');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await open();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('uses the English defaults', async () => {
    const { open, user, onResult } = setupPrompt({ message: 'Why?' });
    await open();
    expect(screen.getByRole('dialog', { name: 'Confirm action' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Reason/ })).toBeInTheDocument();
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    expect(cancel).toHaveClass('trazos-btn-outline', 'trazos-prompt-cancel');
    expect(confirm).toHaveClass('trazos-btn-primary', 'trazos-prompt-confirm');
    await user.click(confirm);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required.');
    await user.type(screen.getByRole('textbox'), 'ab');
    await user.click(confirm);
    expect(onResult).toHaveBeenCalledExactlyOnceWith({ confirmed: true, text: 'ab' });
  });

  it('applies every option', async () => {
    const { open } = setupPrompt({
      message: 'Approve?',
      title: 'Approve payroll',
      inputLabel: 'Comment',
      confirmText: 'Approve',
      cancelText: 'Back',
      confirmVariant: 'wine',
      placeholder: 'Optional note',
      maxLength: 120,
      initialText: 'Looks good',
      size: 'medium',
    });
    await open();
    expect(screen.getByRole('dialog', { name: 'Approve payroll' })).toHaveClass('trazos-modal-medium');
    const field = screen.getByRole('textbox', { name: /Comment/ });
    expect(field).toHaveValue('Looks good');
    expect(field).toHaveAttribute('placeholder', 'Optional note');
    expect(field).toHaveAttribute('maxlength', '120');
    expect(screen.getByRole('button', { name: 'Approve' })).toHaveClass('trazos-btn-wine');
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('lets optional text be empty and resolves null for it', async () => {
    const { open, user, onResult } = setupPrompt({ message: 'Note?', required: false, minLength: 5 });
    await open();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
    await user.type(screen.getByRole('textbox'), '   ');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onResult).toHaveBeenCalledExactlyOnceWith({ confirmed: true, text: null });
  });

  it('resolves unconfirmed outside a provider without rendering anything', async () => {
    const onResult = vi.fn<(r: PromptResult) => void>();
    const { container } = render(<PromptAsker options={{ message: 'x' }} onResult={onResult} />);
    await userEvent.click(screen.getByRole('button', { name: 'Prompt' }));
    await vi.waitFor(() => {
      expect(onResult).toHaveBeenCalledWith({ confirmed: false, text: null });
    });
    expect(container.querySelector('.trazos-modal-backdrop')).toBeNull();
  });

  it('has no accessibility violations while open with an error', async () => {
    const { open, user, container } = setupPrompt();
    await open();
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await expectNoA11yViolations(container);
  });
});
