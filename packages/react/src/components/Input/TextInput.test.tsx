import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TextInput } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('TextInput', () => {
  it('renders the Razor structure with a text input tied to its label', () => {
    const { container } = render(<TextInput label="Name" placeholder="Your name" />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Your name');
    expect(input).toHaveClass('trazos-input-control');
    expect(input.id).toMatch(/^trazos-input-/);
    expect(container.firstElementChild).toHaveClass('trazos-input-group');
    expect(input.parentElement).toHaveClass('trazos-input-wrapper');
    expect(input.parentElement).not.toHaveClass('has-error');
    expect(input.parentElement).not.toHaveClass('disabled');
    expect(container.querySelector('.trazos-input-label')).toHaveAttribute('for', input.id);
    expect(container.querySelector('.trazos-input-required')).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('renders no label when none is given', () => {
    const { container } = render(<TextInput aria-label="Search" />);
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('shows the required marker hidden from assistive tech and marks the input required', () => {
    const { container } = render(<TextInput label="Email" required />);
    const marker = container.querySelector('.trazos-input-required');
    expect(marker).toHaveTextContent('*');
    expect(marker).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-required', 'true');
  });

  it('wires helper text through aria-describedby', () => {
    const { container } = render(<TextInput label="Name" helperText="As in your ID" />);
    const helper = container.querySelector('.trazos-input-helper');
    expect(helper).toHaveTextContent('As in your ID');
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('As in your ID');
  });

  it('shows the error instead of the helper, flags the wrapper and the input', () => {
    const { container } = render(<TextInput label="Name" helperText="Help" error="Required field" />);
    const input = screen.getByLabelText('Name');
    expect(container.querySelector('.trazos-input-helper')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
    expect(screen.getByRole('alert')).toHaveClass('trazos-input-error');
    expect(input.parentElement).toHaveClass('has-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Required field');
  });

  it('keeps a caller aria-describedby alongside its own', () => {
    render(
      <>
        <p id="extra">Extra</p>
        <TextInput label="Name" helperText="Help" aria-describedby="extra" />
      </>,
    );
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Extra Help');
  });

  it('renders leading and trailing icons in their slots', () => {
    const { container } = render(
      <TextInput label="Name" leadingIcon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />} />,
    );
    expect(container.querySelector('.trazos-input-icon.leading')).toContainElement(screen.getByTestId('lead'));
    expect(container.querySelector('.trazos-input-icon.trailing')).toContainElement(screen.getByTestId('trail'));
  });

  it('applies disabled and readOnly', () => {
    render(<TextInput label="Name" disabled readOnly />);
    const input = screen.getByLabelText('Name');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('readonly');
    expect(input.parentElement).toHaveClass('disabled');
  });

  it('works uncontrolled with defaultValue and reports every change', async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<TextInput label="Name" defaultValue="An" onValueChange={onValueChange} onChange={onChange} />);
    const input = screen.getByLabelText('Name');
    await userEvent.type(input, 'a');
    expect(input).toHaveValue('Ana');
    expect(onValueChange).toHaveBeenCalledWith('Ana');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('works controlled with value + onValueChange', async () => {
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <>
          <TextInput label="Name" value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.type(screen.getByLabelText('Name'), 'Luz');
    expect(screen.getByRole('status')).toHaveTextContent('Luz');
    expect(screen.getByLabelText('Name')).toHaveValue('Luz');
  });

  it('forwards the ref to the native input with type, id, extra classes and attributes', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <TextInput ref={ref} id="email" type="email" label="Email" className="extra" name="email" data-x="1" />,
    );
    const input = screen.getByLabelText('Email');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('data-x', '1');
    expect(container.firstElementChild).toHaveClass('trazos-input-group', 'extra');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TextInput label="Name" helperText="Help" required error="Wrong" />);
    await expectNoA11yViolations(container);
  });
});
