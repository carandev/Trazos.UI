import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { LoadingSpinner } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('LoadingSpinner', () => {
  it('renders the inline spinner markup as a labelled status by default', () => {
    const { container } = render(<LoadingSpinner />);
    const status = screen.getByRole('status', { name: 'Cargando' });
    expect(status).toBe(container.firstElementChild);
    expect(status).toHaveClass('trazos-loading-spinner');
    expect(status).not.toHaveClass('trazos-loading-overlay');
    const spinner = status.querySelector('.trazos-spinner-container > .trazos-spinner');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(spinner?.querySelector('.trazos-spinner-inner')).not.toBeNull();
    expect(status.querySelector('.trazos-loading-message')).toBeNull();
  });

  it('adds the overlay class', () => {
    render(<LoadingSpinner overlay />);
    expect(screen.getByRole('status')).toHaveClass('trazos-loading-spinner', 'trazos-loading-overlay');
  });

  it('shows the message, which then names the status', () => {
    render(<LoadingSpinner message="Guardando cambios" />);
    const status = screen.getByRole('status', { name: 'Guardando cambios' });
    expect(status).not.toHaveAttribute('aria-label');
    expect(status).toHaveAttribute('aria-labelledby', status.querySelector('.trazos-loading-message')?.id);
    expect(status.querySelector('.trazos-spinner-container > .trazos-loading-message')).toHaveTextContent('Guardando cambios');
  });

  it('accepts a custom accessible label', () => {
    render(<LoadingSpinner label="Loading" />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<LoadingSpinner ref={ref} className="extra" data-x="1" />);
    const status = screen.getByRole('status');
    expect(ref.current).toBe(status);
    expect(status).toHaveClass('trazos-loading-spinner', 'extra');
    expect(status).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LoadingSpinner message="Cargando" />);
    await expectNoA11yViolations(container);
    const { container: bare } = render(<LoadingSpinner overlay />);
    await expectNoA11yViolations(bare);
  });
});
