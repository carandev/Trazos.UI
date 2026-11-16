import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CheckboxGroup, RadioGroup } from './index';
import type { ChoiceOption } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

const shifts: ChoiceOption<string>[] = [
  { value: 'am', label: 'Morning' },
  { value: 'pm', label: 'Afternoon' },
  { value: 'night', label: 'Night', disabled: true },
];

const benefits: ChoiceOption<number>[] = [
  { value: 1, label: 'Food' },
  { value: 2, label: 'Transport' },
  { value: 3, label: 'Gym' },
];

describe('RadioGroup', () => {
  it('renders a radiogroup fieldset with a legend and native radios sharing one name', () => {
    const { container } = render(<RadioGroup id="shift" label="Shift" options={shifts} />);
    const group = screen.getByRole('radiogroup', { name: 'Shift' });
    expect(group.tagName).toBe('FIELDSET');
    expect(group).toHaveAttribute('id', 'shift');
    expect(group).toHaveClass('trazos-choice-group');
    expect(container.querySelector('legend')).toHaveClass('trazos-choice-legend');
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios.map((r) => r.id)).toEqual(['shift-0', 'shift-1', 'shift-2']);
    expect(radios[0]).toHaveClass('trazos-choice-input', 'trazos-choice-input-radio');
    expect(radios[0]).toHaveAttribute('name', 'shift');
    expect(radios[1]).toHaveAttribute('name', 'shift');
    expect(radios[2]).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Afternoon' })).not.toBeChecked();
    const labels = container.querySelectorAll('label.trazos-choice');
    expect(labels[2]).toHaveClass('trazos-choice-is-disabled');
    expect(labels[0]).not.toHaveClass('trazos-choice-is-disabled');
    expect(labels[0]).toHaveAttribute('for', 'shift-0');
  });

  it('generates an id and lets a custom name override the shared name', () => {
    render(<RadioGroup label="Shift" name="turn" options={shifts} />);
    const group = screen.getByRole('radiogroup');
    expect(group.id).toMatch(/^trazos-radio-/);
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('name', 'turn');
    expect(screen.getAllByRole('radio')[0]?.id).toBe(`${group.id}-0`);
  });

  it('works uncontrolled from defaultValue and reports the chosen value', async () => {
    const onValueChange = vi.fn();
    render(<RadioGroup label="Shift" options={shifts} defaultValue="am" onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Morning' })).toBeChecked();
    await userEvent.click(screen.getByText('Afternoon'));
    expect(onValueChange).toHaveBeenCalledWith('pm');
    expect(screen.getByRole('radio', { name: 'Afternoon' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Morning' })).not.toBeChecked();
  });

  it('is controlled through value and ignores disabled options', async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <>
          <RadioGroup
            label="Shift"
            options={shifts}
            value={value}
            onValueChange={(v) => {
              onValueChange(v);
              setValue(v);
            }}
          />
          <output>{value ?? 'none'}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getAllByRole('radio').some((r) => (r as HTMLInputElement).checked)).toBe(false);
    await userEvent.click(screen.getByRole('radio', { name: 'Afternoon' }));
    expect(screen.getByText('pm')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Night'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('stays unchanged when controlled without a state update', async () => {
    const onValueChange = vi.fn();
    render(<RadioGroup label="Shift" options={shifts} value="am" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Afternoon' }));
    expect(onValueChange).toHaveBeenCalledWith('pm');
    expect(screen.getByRole('radio', { name: 'Morning' })).toBeChecked();
  });

  it('matches non-string values with Object.is', () => {
    render(<RadioGroup label="Benefit" options={benefits} value={2} />);
    expect(screen.getByRole('radio', { name: 'Transport' })).toBeChecked();
  });

  it('shows the required marker, helper text and error with aria wiring', () => {
    const { container, rerender } = render(
      <RadioGroup id="shift" label="Shift" required helperText="Pick one" options={shifts} />,
    );
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(container.querySelector('.trazos-choice-required')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.trazos-choice-helper')).toHaveTextContent('Pick one');
    expect(group).toHaveAttribute('aria-describedby', 'shift-helper');
    expect(group).not.toHaveAttribute('aria-invalid');

    rerender(<RadioGroup id="shift" label="Shift" helperText="Pick one" error="Choose a shift." options={shifts} />);
    expect(container.querySelector('.trazos-choice-helper')).not.toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('id', 'shift-error');
    expect(alert).toHaveClass('trazos-choice-error');
    expect(alert).toHaveTextContent('Choose a shift.');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-describedby', 'shift-error');
    expect(group).not.toHaveAttribute('aria-required');
  });

  it('lays options inline and disables every option with disabled', () => {
    render(<RadioGroup label="Shift" inline disabled options={shifts} />);
    expect(screen.getByRole('radiogroup')).toHaveClass('trazos-choice-group-inline');
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });

  it('forwards the ref, classes and native attributes to the fieldset', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<RadioGroup ref={ref} label="Shift" options={shifts} className="extra" data-testid="g" />);
    const group = screen.getByRole('radiogroup');
    expect(ref.current).toBe(group);
    expect(group).toHaveClass('trazos-choice-group', 'extra');
    expect(group).toHaveAttribute('data-testid', 'g');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RadioGroup label="Shift" helperText="Pick one" defaultValue="am" options={shifts} />,
    );
    await expectNoA11yViolations(container);
  });
});

describe('CheckboxGroup', () => {
  it('renders a group fieldset with native checkboxes', () => {
    render(<CheckboxGroup id="benefits" label="Benefits" options={benefits} />);
    const group = screen.getByRole('group', { name: 'Benefits' });
    expect(group.tagName).toBe('FIELDSET');
    expect(group).toHaveClass('trazos-choice-group');
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes.map((b) => b.id)).toEqual(['benefits-0', 'benefits-1', 'benefits-2']);
    expect(boxes[0]).toHaveClass('trazos-choice-input', 'trazos-choice-input-checkbox');
    expect(group).not.toHaveAttribute('aria-required');
  });

  it('generates an id', () => {
    render(<CheckboxGroup label="Benefits" options={benefits} />);
    expect(screen.getByRole('group').id).toMatch(/^trazos-checks-/);
  });

  it('adds and removes values in option order with a new array each time', async () => {
    const changes: number[][] = [];
    function Controlled() {
      const [value, setValue] = useState<number[]>([]);
      return (
        <CheckboxGroup
          label="Benefits"
          options={benefits}
          value={value}
          onValueChange={(next) => {
            changes.push(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Gym' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Food' }));
    expect(changes.at(-1)).toEqual([1, 3]);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Gym' }));
    expect(changes.at(-1)).toEqual([1]);
    expect(changes).toEqual([[3], [1, 3], [1]]);
    expect(changes[0]).not.toBe(changes[1]);
    expect(screen.getByRole('checkbox', { name: 'Food' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Gym' })).not.toBeChecked();
  });

  it('works uncontrolled from defaultValue without mutating it', async () => {
    const initial = [2];
    const onValueChange = vi.fn();
    render(<CheckboxGroup label="Benefits" options={benefits} defaultValue={initial} onValueChange={onValueChange} />);
    expect(screen.getByRole('checkbox', { name: 'Transport' })).toBeChecked();
    await userEvent.click(screen.getByText('Food'));
    expect(onValueChange).toHaveBeenCalledWith([1, 2]);
    expect(screen.getByRole('checkbox', { name: 'Food' })).toBeChecked();
    expect(initial).toEqual([2]);
  });

  it('does not toggle disabled options', async () => {
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup
        label="Benefits"
        options={[...benefits.slice(0, 2), { value: 3, label: 'Gym', disabled: true }]}
        onValueChange={onValueChange}
      />,
    );
    const gym = screen.getByRole('checkbox', { name: 'Gym' });
    expect(gym).toBeDisabled();
    await userEvent.click(screen.getByText('Gym'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('flags the error with aria-invalid and the alert', () => {
    const { container } = render(
      <CheckboxGroup id="benefits" label="Benefits" required error="Choose at least one benefit." options={benefits} />,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-describedby', 'benefits-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one benefit.');
    expect(container.querySelector('.trazos-choice-required')).toBeInTheDocument();
  });

  it('lays options inline', () => {
    render(<CheckboxGroup label="Benefits" inline options={benefits} />);
    expect(screen.getByRole('group')).toHaveClass('trazos-choice-group-inline');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CheckboxGroup label="Benefits" error="Choose one" defaultValue={[1]} options={benefits} />,
    );
    await expectNoA11yViolations(container);
  });
});
