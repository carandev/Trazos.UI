import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { FilterBar, FormActions, FormGrid } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('FormGrid', () => {
  it('defaults to two columns and renders its children', () => {
    const { container } = render(
      <FormGrid>
        <span>A</span>
      </FormGrid>,
    );
    const root = container.firstElementChild;
    expect(root).toHaveClass('trazos-form-grid', 'trazos-form-grid-cols-2');
    expect(root).toHaveTextContent('A');
  });

  it('sets its column count, clamped to 1 to 4', () => {
    const { container, rerender } = render(<FormGrid columns={3} />);
    expect(container.firstElementChild).toHaveClass('trazos-form-grid-cols-3');
    rerender(<FormGrid columns={9} />);
    expect(container.firstElementChild).toHaveClass('trazos-form-grid-cols-4');
    rerender(<FormGrid columns={0} />);
    expect(container.firstElementChild).toHaveClass('trazos-form-grid-cols-1');
  });

  it('forwards the ref, classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <FormGrid ref={ref} className="extra" data-testid="grid">
        <div className="trazos-form-full">Full</div>
      </FormGrid>,
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(container.firstElementChild).toHaveClass('trazos-form-grid', 'extra');
    expect(container.firstElementChild).toHaveAttribute('data-testid', 'grid');
    expect(container.querySelectorAll('.trazos-form-full')).toHaveLength(1);
  });
});

describe('FormActions', () => {
  it('aligns to the end by default and is not sticky', () => {
    const { container } = render(
      <FormActions>
        <button type="submit">Save</button>
      </FormActions>,
    );
    const root = container.firstElementChild;
    expect(root).toHaveClass('trazos-form-actions', 'trazos-form-actions-end');
    expect(root).not.toHaveClass('trazos-form-actions-sticky');
    expect(screen.getByRole('button')).toHaveTextContent('Save');
  });

  it('aligns between or start and can stick to the bottom', () => {
    const { container, rerender } = render(<FormActions align="between" sticky />);
    expect(container.firstElementChild).toHaveClass('trazos-form-actions-between', 'trazos-form-actions-sticky');
    rerender(<FormActions align="start" />);
    expect(container.firstElementChild).toHaveClass('trazos-form-actions-start');
    expect(container.firstElementChild).not.toHaveClass('trazos-form-actions-between');
  });

  it('forwards the ref, classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<FormActions ref={ref} className="extra" id="bar" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(container.firstElementChild).toHaveClass('trazos-form-actions', 'extra');
    expect(container.firstElementChild).toHaveAttribute('id', 'bar');
  });
});

describe('FilterBar', () => {
  it('is a labelled search landmark with fields and an actions area', () => {
    const { container } = render(
      <FilterBar label="Filtros" actions={<button type="button">Reset</button>}>
        <input aria-label="Name" />
      </FilterBar>,
    );
    const root = screen.getByRole('search', { name: 'Filtros' });
    expect(root).toHaveClass('trazos-filter-bar');
    expect(container.querySelector('.trazos-filter-bar-fields input')).toBeInTheDocument();
    expect(container.querySelector('.trazos-filter-bar-actions button')).toHaveTextContent('Reset');
  });

  it('omits the actions area without actions', () => {
    const { container } = render(
      <FilterBar label="Filters">
        <input aria-label="Name" />
      </FilterBar>,
    );
    expect(container.querySelector('.trazos-filter-bar-actions')).not.toBeInTheDocument();
  });

  it('forwards the ref, classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FilterBar ref={ref} label="Filters" className="extra" data-testid="fb" />);
    const root = screen.getByRole('search');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('trazos-filter-bar', 'extra');
    expect(root).toHaveAttribute('data-testid', 'fb');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <FilterBar label="Filters" actions={<button type="button">Reset</button>}>
          <input aria-label="Name" />
        </FilterBar>
        <FormGrid columns={2}>
          <input aria-label="First" />
          <input aria-label="Last" className="trazos-form-full" />
        </FormGrid>
        <FormActions align="between">
          <button type="button">Cancel</button>
          <button type="submit">Save</button>
        </FormActions>
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
