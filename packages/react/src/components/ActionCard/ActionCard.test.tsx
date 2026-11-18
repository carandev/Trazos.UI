import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { ActionCard } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('ActionCard', () => {
  it('renders as a link to href with the title as its accessible name', () => {
    render(<ActionCard href="/employees/new" title="New employee" />);
    const link = screen.getByRole('link', { name: 'New employee' });
    expect(link).toHaveAttribute('href', '/employees/new');
    expect(link).toHaveClass('trazos-action-card');
  });

  it('renders the title, description and icon', () => {
    render(
      <ActionCard
        href="/payroll/run"
        title="Run payroll"
        description="Process this month's payroll."
        icon={<svg data-testid="icon" />}
      />,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Run payroll' });
    expect(heading).toHaveClass('trazos-heading', 'trazos-action-card-title');
    expect(screen.getByText("Process this month's payroll.")).toHaveClass('trazos-action-card-description');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('omits the description paragraph when not given', () => {
    const { container } = render(<ActionCard href="/reports" title="View reports" />);
    expect(container.querySelector('.trazos-action-card-description')).toBeNull();
  });

  it('wraps the icon in an IconBox using the given variant, defaulting to primary', () => {
    const { container, rerender } = render(
      <ActionCard href="/reports" title="View reports" icon={<svg data-testid="icon" />} />,
    );
    expect(container.querySelector('.trazos-action-card-icon')).toHaveClass('trazos-icon-box-primary');

    rerender(
      <ActionCard href="/reports" title="View reports" icon={<svg data-testid="icon" />} iconVariant="lavender" />,
    );
    expect(container.querySelector('.trazos-action-card-icon')).toHaveClass('trazos-icon-box-lavender');
  });

  it('renders no icon box when no icon is given', () => {
    const { container } = render(<ActionCard href="/reports" title="View reports" />);
    expect(container.querySelector('.trazos-action-card-icon')).toBeNull();
  });

  it('forwards the ref, className and native attributes to the root link', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<ActionCard ref={ref} href="/reports" title="View reports" className="extra" data-x="1" />);
    expect(ref.current).toHaveClass('trazos-action-card', 'extra');
    expect(ref.current).toHaveAttribute('data-x', '1');
    expect(ref.current).toHaveAttribute('href', '/reports');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ActionCard
        href="/employees/new"
        title="New employee"
        description="Add a new employee to the roster."
        icon={<svg aria-hidden="true" />}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
