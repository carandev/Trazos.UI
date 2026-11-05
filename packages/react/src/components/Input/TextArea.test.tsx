import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TextArea } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('TextArea', () => {
  it('renders the Razor structure with 4 rows by default', () => {
    const { container } = render(<TextArea label="Notes" placeholder="Write here" />);
    const textarea = screen.getByLabelText('Notes');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '4');
    expect(textarea).toHaveAttribute('placeholder', 'Write here');
    expect(textarea).toHaveClass('trazos-textarea-control');
    expect(textarea.id).toMatch(/^trazos-textarea-/);
    expect(textarea.parentElement).toHaveClass('trazos-textarea-wrapper');
    expect(container.firstElementChild).toHaveClass('trazos-input-group');
    expect(container.querySelector('.trazos-input-label')).toHaveAttribute('for', textarea.id);
  });

  it('accepts a custom row count', () => {
    render(<TextArea label="Notes" rows={8} />);
    expect(screen.getByLabelText('Notes')).toHaveAttribute('rows', '8');
  });

  it('shows the required marker', () => {
    const { container } = render(<TextArea label="Notes" required />);
    expect(container.querySelector('.trazos-input-required')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute('aria-required', 'true');
  });

  it('wires helper and error text', () => {
    const { container, rerender } = render(<TextArea label="Notes" helperText="Optional" />);
    expect(container.querySelector('.trazos-input-helper')).toHaveTextContent('Optional');
    expect(screen.getByLabelText('Notes')).toHaveAccessibleDescription('Optional');
    rerender(<TextArea label="Notes" helperText="Optional" error="Too long" />);
    const textarea = screen.getByLabelText('Notes');
    expect(container.querySelector('.trazos-input-helper')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Too long');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAccessibleDescription('Too long');
    expect(textarea.parentElement).toHaveClass('has-error');
  });

  it('applies disabled and readOnly', () => {
    render(<TextArea label="Notes" disabled readOnly />);
    const textarea = screen.getByLabelText('Notes');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('readonly');
    expect(textarea.parentElement).toHaveClass('disabled');
  });

  it('works uncontrolled and calls onValueChange and onChange', async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<TextArea label="Notes" defaultValue="Hi" onValueChange={onValueChange} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Notes'), '!');
    expect(screen.getByLabelText('Notes')).toHaveValue('Hi!');
    expect(onValueChange).toHaveBeenCalledWith('Hi!');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('');
      return <TextArea label="Notes" value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    await userEvent.type(screen.getByLabelText('Notes'), 'ok');
    expect(screen.getByLabelText('Notes')).toHaveValue('ok');
  });

  it('forwards the ref, id, classes and native attributes', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { container } = render(
      <TextArea ref={ref} id="notes" label="Notes" className="extra" maxLength={10} />,
    );
    const textarea = screen.getByLabelText('Notes');
    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute('id', 'notes');
    expect(textarea).toHaveAttribute('maxlength', '10');
    expect(container.firstElementChild).toHaveClass('extra');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TextArea label="Notes" helperText="Help" required />);
    await expectNoA11yViolations(container);
  });
});
