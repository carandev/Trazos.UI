import { render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Stepper, type StepperStep } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

const steps: StepperStep[] = [{ title: 'Employee' }, { title: 'Contract', description: 'Type and dates' }, { title: 'Review' }];

describe('Stepper', () => {
  it('marks completed, current and upcoming steps', () => {
    render(<Stepper steps={steps} current={1} label="New employee" />);
    const list = screen.getByRole('list', { name: 'New employee' });
    expect(list).toHaveClass('trazos-stepper', 'trazos-stepper-horizontal');
    const items = within(list).getAllByRole('listitem');
    expect(items[0]).toHaveClass('trazos-stepper-step', 'trazos-stepper-complete');
    expect(items[1]).toHaveClass('trazos-stepper-current');
    expect(items[2]).toHaveClass('trazos-stepper-upcoming');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[2]).not.toHaveAttribute('aria-current');
    expect(items[1]?.querySelector('.trazos-stepper-description')).toHaveTextContent('Type and dates');
    expect(items[0]?.querySelector('.trazos-stepper-description')).toBeNull();
  });

  it('adds hidden completed text and a check mark to completed steps', () => {
    render(<Stepper steps={steps} current={2} />);
    const items = screen.getAllByRole('listitem');
    for (const item of items.slice(0, 2)) {
      expect(within(item).getByText('Completed')).toHaveClass('trazos-visually-hidden');
      expect(item.querySelector('.trazos-stepper-marker svg')).not.toBeNull();
    }
    expect(within(items[2] as HTMLElement).queryByText('Completed')).toBeNull();
    expect(items[2]?.querySelector('.trazos-stepper-marker')).toHaveTextContent('3');
  });

  it('uses completedLabel for the hidden text', () => {
    render(<Stepper steps={steps} current={1} completedLabel="Completado" />);
    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('numbers the steps in a hidden marker', () => {
    const { container } = render(<Stepper steps={steps} />);
    const markers = [...container.querySelectorAll('.trazos-stepper-marker')];
    expect(markers.map((m) => m.textContent)).toEqual(['1', '2', '3']);
    for (const marker of markers) expect(marker).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step');
  });

  it('stacks the steps when vertical', () => {
    render(<Stepper steps={steps} vertical />);
    const list = screen.getByRole('list');
    expect(list).toHaveClass('trazos-stepper-vertical');
    expect(getComputedStyle(list).flexDirection).toBe('column');
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLOListElement>();
    render(<Stepper ref={ref} steps={steps} className="extra" data-x="1" />);
    const list = screen.getByRole('list');
    expect(ref.current).toBe(list);
    expect(list).toHaveClass('trazos-stepper', 'extra');
    expect(list).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Stepper steps={steps} current={1} label="New employee" />);
    await expectNoA11yViolations(container);
  });
});
