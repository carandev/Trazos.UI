import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Checkbox', () => {
  it('renders the Razor structure unchecked by default', () => {
    const { container } = render(<Checkbox label="Accept terms" />);
    const input = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(input).toHaveClass('trazos-checkbox-control');
    expect(input).not.toBeChecked();
    expect(input.id).toMatch(/^trazos-chk-/);
    expect(container.firstElementChild).toHaveClass('trazos-checkbox-group');
    const label = container.querySelector('label');
    expect(label).toHaveClass('trazos-checkbox-container');
    expect(label).not.toHaveClass('trazos-input-is-disabled');
    expect(label).toHaveAttribute('for', input.id);
    const box = container.querySelector('.trazos-checkbox-box');
    expect(box).toHaveAttribute('aria-hidden', 'true');
    expect(box).not.toHaveClass('trazos-checkbox-is-checked');
    expect(box?.querySelector('svg.trazos-checkbox-check')).toBeInTheDocument();
    expect(container.querySelector('.trazos-checkbox-label')).toHaveTextContent('Accept terms');
  });

  it('prefers children over label and omits the label span when neither is given', () => {
    const { container, rerender } = render(
      <Checkbox label="Plain">
        <strong>Rich</strong>
      </Checkbox>,
    );
    expect(container.querySelector('.trazos-checkbox-label')).toHaveTextContent('Rich');
    expect(container.querySelector('.trazos-checkbox-label')).not.toHaveTextContent('Plain');
    rerender(<Checkbox aria-label="Bare" />);
    expect(container.querySelector('.trazos-checkbox-label')).not.toBeInTheDocument();
  });

  it('wires helper and error text', () => {
    const { container, rerender } = render(<Checkbox label="News" helperText="Weekly" />);
    expect(container.querySelector('.trazos-checkbox-helper')).toHaveTextContent('Weekly');
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('Weekly');
    rerender(<Checkbox label="News" helperText="Weekly" error="Required" />);
    const input = screen.getByRole('checkbox');
    expect(container.querySelector('.trazos-checkbox-helper')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('trazos-checkbox-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(container.querySelector('.trazos-checkbox-box')).toHaveClass('trazos-input-has-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Required');
  });

  it('is disabled and ignores clicks', async () => {
    const onCheckedChange = vi.fn();
    const { container } = render(<Checkbox label="News" disabled onCheckedChange={onCheckedChange} />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(container.querySelector('label')).toHaveClass('trazos-input-is-disabled');
    await userEvent.click(screen.getByText('News'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('works uncontrolled with defaultChecked and toggles the visual box', async () => {
    const onCheckedChange = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      <Checkbox label="News" defaultChecked onCheckedChange={onCheckedChange} onChange={onChange} />,
    );
    const box = container.querySelector('.trazos-checkbox-box');
    expect(box).toHaveClass('trazos-checkbox-is-checked');
    await userEvent.click(screen.getByText('News'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(box).not.toHaveClass('trazos-checkbox-is-checked');
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('works controlled with checked + onCheckedChange', async () => {
    function Controlled() {
      const [checked, setChecked] = useState(false);
      return <Checkbox label="News" checked={checked} onCheckedChange={setChecked} />;
    }
    const { container } = render(<Controlled />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(container.querySelector('.trazos-checkbox-box')).toHaveClass('trazos-checkbox-is-checked');
  });

  it('stays unchanged when controlled without a handler update', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="News" checked={false} onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('forwards the ref, id, classes and native attributes', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Checkbox ref={ref} id="news" label="News" className="extra" name="news" />);
    const input = screen.getByRole('checkbox');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('id', 'news');
    expect(input).toHaveAttribute('name', 'news');
    expect(container.firstElementChild).toHaveClass('trazos-checkbox-group', 'extra');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Checkbox label="News" helperText="Weekly" />);
    await expectNoA11yViolations(container);
  });
});
