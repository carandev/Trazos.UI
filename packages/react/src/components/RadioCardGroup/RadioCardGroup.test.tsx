import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RadioCardGroup, type RadioCardOption } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

type Plan = 'basic' | 'pro';

const options: RadioCardOption<Plan>[] = [
  { value: 'basic', title: 'Basic', description: 'For individuals' },
  { value: 'pro', title: 'Pro', icon: <svg data-testid="pro-icon" /> },
];

describe('RadioCardGroup', () => {
  it('renders a fieldset with a legend and one native radio card per option', () => {
    const { container } = render(<RadioCardGroup label="Plan" options={options} />);
    const group = screen.getByRole('group', { name: 'Plan' });
    expect(group.tagName).toBe('FIELDSET');
    expect(group).toHaveClass('trazos-radio-cards');
    expect(container.querySelector('legend')).toHaveClass('trazos-radio-cards-label');
    expect(container.querySelector('.trazos-radio-cards-grid')).toHaveClass('trazos-radio-cards-cols-2');
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    const [first, second] = radios;
    expect(first).toHaveClass('trazos-radio-card-input');
    expect(first).toHaveAttribute('name', second?.getAttribute('name') ?? 'missing');
    expect(first?.id).toBe(`${first?.getAttribute('name') ?? ''}-0`);
    expect(first?.closest('label')).toHaveClass('trazos-radio-card');
    expect(first?.closest('label')).toHaveAttribute('for', first?.id);
    expect(screen.getByRole('radio', { name: /Basic/ })).not.toBeChecked();
    expect(container.querySelector('.trazos-radio-card-title')).toHaveTextContent('Basic');
    expect(container.querySelector('.trazos-radio-card-description')).toHaveTextContent('For individuals');
    expect(container.querySelectorAll('.trazos-radio-card-description')).toHaveLength(1);
    expect(container.querySelector('.trazos-radio-card-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.trazos-radio-card-icon')).toContainElement(screen.getByTestId('pro-icon'));
    expect(container.querySelectorAll('.trazos-radio-card-check')).toHaveLength(2);
    expect(container.querySelector('.trazos-radio-card-check svg')).not.toBeInTheDocument();
  });

  it('maps columns to its grid class', () => {
    const { container } = render(<RadioCardGroup label="Plan" options={options} columns={1} />);
    expect(container.querySelector('.trazos-radio-cards-grid')).toHaveClass('trazos-radio-cards-cols-1');
  });

  it('shows the required marker and no legend without a label', () => {
    const { container, rerender } = render(<RadioCardGroup label="Plan" options={options} required />);
    expect(container.querySelector('.trazos-radio-cards-required')).toHaveAttribute('aria-hidden', 'true');
    rerender(<RadioCardGroup aria-label="Plan" options={options} />);
    expect(container.querySelector('legend')).not.toBeInTheDocument();
  });

  it('shows the error instead of the helper and describes the group', () => {
    const { container, rerender } = render(<RadioCardGroup label="Plan" options={options} helperText="Change later" />);
    expect(container.querySelector('.trazos-radio-cards-helper')).toHaveTextContent('Change later');
    expect(screen.getByRole('group')).toHaveAccessibleDescription('Change later');
    rerender(<RadioCardGroup label="Plan" options={options} helperText="Change later" error="Pick a plan" />);
    expect(container.querySelector('.trazos-radio-cards-helper')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('trazos-radio-cards-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a plan');
    expect(screen.getByRole('group')).toHaveAccessibleDescription('Pick a plan');
    expect(screen.getByRole('group')).toHaveAttribute('aria-invalid', 'true');
  });

  it('works uncontrolled with defaultValue and reports the selected option value', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <RadioCardGroup label="Plan" options={options} defaultValue="basic" onValueChange={onValueChange} />,
    );
    expect(screen.getByRole('radio', { name: /Basic/ })).toBeChecked();
    await userEvent.click(screen.getByText('Pro'));
    expect(screen.getByRole('radio', { name: /Pro/ })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith('pro');
    const checked = container.querySelector('.trazos-radio-card.is-checked');
    expect(checked).toHaveTextContent('Pro');
    expect(checked?.querySelector('.trazos-radio-card-check svg')).toBeInTheDocument();
  });

  it('works controlled and supports arrow-key selection of native radios', async () => {
    function Controlled() {
      const [plan, setPlan] = useState<Plan>('basic');
      return (
        <>
          <RadioCardGroup label="Plan" options={options} value={plan} onValueChange={setPlan} />
          <output>{plan}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('radio', { name: /Basic/ }));
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('status')).toHaveTextContent('pro');
    expect(screen.getByRole('radio', { name: /Pro/ })).toBeChecked();
  });

  it('is generic over non-string option values', async () => {
    const onValueChange = vi.fn();
    const numeric: RadioCardOption<number>[] = [
      { value: 1, title: 'One' },
      { value: 2, title: 'Two' },
    ];
    render(<RadioCardGroup label="Count" options={numeric} value={2} onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Two' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'One' }));
    expect(onValueChange).toHaveBeenCalledWith(1);
  });

  it('disables every card', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<RadioCardGroup label="Plan" options={options} disabled onValueChange={onValueChange} />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
    expect(container.querySelectorAll('.trazos-radio-card.is-disabled')).toHaveLength(2);
    await userEvent.click(screen.getByText('Pro'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('forwards the ref, classes and native attributes to the fieldset', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<RadioCardGroup ref={ref} label="Plan" options={options} className="extra" data-x="1" />);
    const group = screen.getByRole('group');
    expect(ref.current).toBe(group);
    expect(group).toHaveClass('trazos-radio-cards', 'extra');
    expect(group).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RadioCardGroup label="Plan" options={options} defaultValue="pro" error="Pick one" required />,
    );
    await expectNoA11yViolations(container);
  });
});
