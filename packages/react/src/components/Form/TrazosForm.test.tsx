import { render, screen, fireEvent } from '@testing-library/react';
import { createRef, type SubmitEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TrazosForm } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('TrazosForm', () => {
  it('prevents the native submit and calls onSubmit with the event', () => {
    const onSubmit = vi.fn<(event: SubmitEvent<HTMLFormElement>) => void>();
    const { container } = render(
      <TrazosForm onSubmit={onSubmit}>
        <button type="submit">Save</button>
      </TrazosForm>,
    );

    const form = container.querySelector('form');
    if (!(form instanceof HTMLFormElement)) throw new Error('form missing');
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]?.defaultPrevented).toBe(true);
  });

  it('renders the error summary with each message as a list item', () => {
    render(<TrazosForm errors={['Name is required.', 'Email is invalid.']} />);

    const summary = screen.getByRole('alert');
    expect(summary).toHaveClass('trazos-form-summary');
    expect(screen.getByText('Please fix the following:')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Name is required.',
      'Email is invalid.',
    ]);
  });

  it('uses a custom error summary label', () => {
    render(<TrazosForm errors={['Oops.']} errorSummaryLabel="Fix these:" />);
    expect(screen.getByText('Fix these:')).toBeInTheDocument();
  });

  it('omits the summary when errors is empty or undefined', () => {
    const { rerender } = render(<TrazosForm />);
    expect(screen.queryByRole('alert')).toBeNull();

    rerender(<TrazosForm errors={[]} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('forwards the ref, className and native attributes to the root', () => {
    const ref = createRef<HTMLFormElement>();
    render(<TrazosForm ref={ref} className="extra" data-x="1" />);
    expect(ref.current?.tagName).toBe('FORM');
    expect(ref.current).toHaveClass('trazos-form', 'extra');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations without a summary', async () => {
    const { container } = render(
      <TrazosForm>
        <label>
          Name <input />
        </label>
      </TrazosForm>,
    );
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations with the summary showing', async () => {
    const { container } = render(
      <TrazosForm errors={['Name is required.']}>
        <label>
          Name <input />
        </label>
      </TrazosForm>,
    );
    await expectNoA11yViolations(container);
  });
});
