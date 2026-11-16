import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FileInput, type FileInputProps } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

// A drop ignores the accept attribute, so the component checks types itself.
const user = () => userEvent.setup({ applyAccept: false });

function file(name: string, size: number, type: string): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

function Controlled(props: Omit<FileInputProps, 'value'>) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>
      <FileInput
        label="Documents"
        {...props}
        value={files}
        onValueChange={(next) => {
          props.onValueChange?.(next);
          setFiles(next);
        }}
      />
      <output>{files.map((f) => f.name).join(',')}</output>
    </>
  );
}

const native = () => screen.getByLabelText('Documents');
const rejected = (container: HTMLElement) => container.querySelector('.trazos-file-rejected');

describe('FileInput', () => {
  it('renders a labelled native file input over a drop zone with default texts', () => {
    const { container } = render(<FileInput label="Documents" accept=".pdf" hint="PDF up to 5 MB" />);
    expect(native()).toHaveAttribute('type', 'file');
    expect(native()).toHaveAttribute('accept', '.pdf');
    expect(native()).not.toHaveAttribute('multiple');
    expect(native()).toHaveClass('trazos-file-native');
    expect(native().id).toMatch(/^trazos-file-/);
    expect(container.firstElementChild).toHaveClass('trazos-file');
    const zone = container.querySelector('.trazos-file-zone');
    expect(zone).toContainElement(native());
    expect(zone?.querySelector('.trazos-file-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.trazos-file-prompt')).toHaveTextContent('Choose a file or drag it here');
    expect(container.querySelector('.trazos-file-prompt strong')).toHaveTextContent('Choose a file');
    expect(container.querySelector('.trazos-file-hint')).toHaveTextContent('PDF up to 5 MB');
    expect(container.querySelector('.trazos-file-list')).not.toBeInTheDocument();
  });

  it('takes buttonText and dropText', () => {
    const { container } = render(<FileInput label="Documents" buttonText="Elige" dropText="o arrástralo" />);
    expect(container.querySelector('.trazos-file-prompt')).toHaveTextContent('Elige o arrástralo');
  });

  it('lists the chosen file with its size and reports it', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<Controlled onValueChange={onValueChange} />);
    const pdf = file('contract.pdf', 2048, 'application/pdf');
    await user().upload(native(), pdf);
    expect(onValueChange).toHaveBeenCalledWith([pdf]);
    const item = container.querySelector('.trazos-file-item') as HTMLElement;
    expect(within(item).getByText('contract.pdf')).toHaveClass('trazos-file-item-name');
    expect(within(item).getByText('2 KB')).toHaveClass('trazos-file-item-size');
  });

  it('replaces the file in single mode', async () => {
    render(<Controlled />);
    await user().upload(native(), file('a.pdf', 10, 'application/pdf'));
    await user().upload(native(), file('b.pdf', 10, 'application/pdf'));
    expect(screen.getByRole('status')).toHaveTextContent(/^b\.pdf$/);
  });

  it('adds files in multiple mode up to maxFiles and explains the rest', async () => {
    const { container } = render(<Controlled multiple maxFiles={2} />);
    expect(native()).toHaveAttribute('multiple');
    await user().upload(native(), [file('a.pdf', 10, 'application/pdf')]);
    await user().upload(native(), [file('b.pdf', 10, 'application/pdf'), file('c.pdf', 10, 'application/pdf')]);
    expect(screen.getByRole('status')).toHaveTextContent('a.pdf,b.pdf');
    expect(rejected(container)).toHaveAttribute('role', 'alert');
    expect(rejected(container)).toHaveTextContent('c.pdf was not added: the limit is 2 files.');
  });

  it('rejects files of other types and larger files, with their messages', async () => {
    const { container } = render(<Controlled multiple accept=".pdf,image/*" maxFileSize={1024 * 1024} />);
    await user().upload(native(), [
      file('photo.png', 10, 'image/png'),
      file('notes.txt', 10, 'text/plain'),
      file('scan.pdf', 3 * 1024 * 1024, 'application/pdf'),
    ]);
    expect(screen.getByRole('status')).toHaveTextContent(/^photo\.png$/);
    const messages = [...(rejected(container)?.querySelectorAll('li') ?? [])].map((li) => li.textContent);
    expect(messages).toEqual(['notes.txt is not an accepted file type.', 'scan.pdf is larger than 1 MB.']);
  });

  it('matches exact MIME types and uses custom rejection messages', async () => {
    const { container } = render(
      <Controlled
        multiple
        accept="application/pdf"
        maxFileSize={100}
        maxFiles={1}
        notAcceptedMessage="{0}: wrong type"
        tooLargeMessage="{0} over {1}"
        tooManyMessage="{0} beyond {1}"
      />,
    );
    await user().upload(native(), [
      file('ok.pdf', 10, 'application/pdf'),
      file('a.doc', 10, 'application/msword'),
      file('big.pdf', 500, 'application/pdf'),
      file('more.pdf', 10, 'application/pdf'),
    ]);
    expect(screen.getByRole('status')).toHaveTextContent(/^ok\.pdf$/);
    const messages = [...(rejected(container)?.querySelectorAll('li') ?? [])].map((li) => li.textContent);
    expect(messages).toEqual(['a.doc: wrong type', 'big.pdf over 100 B', 'more.pdf beyond 1']);
  });

  it('keeps the previous selection when every new file is rejected', async () => {
    const onValueChange = vi.fn();
    render(<Controlled accept=".pdf" onValueChange={onValueChange} />);
    await user().upload(native(), file('a.pdf', 10, 'application/pdf'));
    await user().upload(native(), file('b.exe', 10, 'application/octet-stream'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent(/^a\.pdf$/);
  });

  it('removes a file with its remove button and clears the rejection messages', async () => {
    const { container } = render(<Controlled multiple maxFiles={1} removeLabelFormat="Quitar {0}" />);
    await user().upload(native(), [file('a.pdf', 10, 'application/pdf'), file('b.pdf', 10, 'application/pdf')]);
    expect(rejected(container)).toBeInTheDocument();
    const remove = screen.getByRole('button', { name: 'Quitar a.pdf' });
    expect(remove).toHaveClass('trazos-file-remove');
    expect(remove).toHaveAttribute('type', 'button');
    await user().click(remove);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(container.querySelector('.trazos-file-list')).not.toBeInTheDocument();
    expect(rejected(container)).not.toBeInTheDocument();
  });

  it('uses the default remove label and formats sizes in B, KB and MB', async () => {
    render(<Controlled multiple />);
    await user().upload(native(), [
      file('tiny.txt', 512, 'text/plain'),
      file('mid.txt', 1536, 'text/plain'),
      file('big.txt', 5 * 1024 * 1024 + 300 * 1024, 'text/plain'),
    ]);
    expect(screen.getByRole('button', { name: 'Remove tiny.txt' })).toBeInTheDocument();
    expect(screen.getByText('512 B')).toBeInTheDocument();
    expect(screen.getByText('1.5 KB')).toBeInTheDocument();
    expect(screen.getByText('5.3 MB')).toBeInTheDocument();
  });

  it('works uncontrolled', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<FileInput label="Documents" onValueChange={onValueChange} />);
    await user().upload(native(), file('a.pdf', 10, 'application/pdf'));
    expect(container.querySelector('.trazos-file-item-name')).toHaveTextContent('a.pdf');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('shows the required marker, helper and error, and disables everything', () => {
    const pdf = file('a.pdf', 10, 'application/pdf');
    const { container, rerender } = render(<FileInput label="Documents" required helperText="One file" value={[pdf]} />);
    expect(container.querySelector('.trazos-file-required')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByLabelText(/Documents/)).toHaveAccessibleDescription('One file');
    rerender(<FileInput label="Documents" required helperText="One file" error="Attach the contract" value={[pdf]} disabled />);
    const input = screen.getByLabelText(/Documents/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Attach the contract');
    expect(input).toBeDisabled();
    expect(container.querySelector('.trazos-file-zone')).toHaveClass('trazos-file-zone-error', 'trazos-file-zone-disabled');
    expect(screen.getByRole('button', { name: 'Remove a.pdf' })).toBeDisabled();
    expect(container.querySelector('.trazos-file-helper')).not.toBeInTheDocument();
    expect(container.querySelector('.trazos-file-error')).toHaveTextContent('Attach the contract');
  });

  it('forwards the ref, id, classes and attributes', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<FileInput ref={ref} id="docs" name="docs" label="Documents" className="extra" />);
    expect(ref.current).toBe(native());
    expect(native()).toHaveAttribute('id', 'docs');
    expect(native()).toHaveAttribute('name', 'docs');
    expect(container.firstElementChild).toHaveClass('trazos-file', 'extra');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FileInput label="Documents" helperText="Help" value={[file('a.pdf', 10, 'application/pdf')]} />,
    );
    await expectNoA11yViolations(container);
  });
});
