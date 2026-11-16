import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

function pageItems(container: HTMLElement): string[] {
  return [...container.querySelectorAll('.trazos-pagination-pages li')].map((li) => li.textContent.trim());
}

describe('Pagination', () => {
  it('collapses long ranges into ellipses around the current page', () => {
    const { container } = render(<Pagination page={10} pageSize={10} totalCount={200} />);
    expect(pageItems(container)).toEqual(['1', '…', '9', '10', '11', '…', '20']);
    const gaps = container.querySelectorAll('li.trazos-pagination-gap');
    expect(gaps).toHaveLength(2);
    expect(gaps[0]).toHaveAttribute('aria-hidden', 'true');
    const current = container.querySelector('button[aria-current]');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveTextContent('10');
    expect(current).toHaveClass('trazos-pagination-page', 'trazos-pagination-page-current');
    expect(screen.getByRole('button', { name: 'Page 9' })).not.toHaveAttribute('aria-current');
  });

  it('shows every page when they fit and widens the window near the ends', () => {
    const { container, rerender } = render(<Pagination page={1} pageSize={10} totalCount={70} />);
    expect(pageItems(container)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    rerender(<Pagination page={1} pageSize={10} totalCount={200} />);
    expect(pageItems(container)).toEqual(['1', '2', '3', '4', '5', '…', '20']);
    rerender(<Pagination page={20} pageSize={10} totalCount={200} />);
    expect(pageItems(container)).toEqual(['1', '…', '16', '17', '18', '19', '20']);
    rerender(<Pagination page={10} pageSize={10} totalCount={200} siblings={2} />);
    expect(pageItems(container)).toEqual(['1', '…', '8', '9', '10', '11', '12', '…', '20']);
  });

  it('moves one page with previous and next, disabled at the ends', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <Pagination page={1} pageSize={10} totalCount={25} previousLabel="Anterior" onPageChange={onPageChange} />,
    );
    const previous = screen.getByRole('button', { name: 'Anterior' });
    expect(previous).toBeDisabled();
    expect(previous).toHaveClass('trazos-pagination-button', 'trazos-pagination-previous');
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);

    rerender(<Pagination page={3} pageSize={10} totalCount={25} onPageChange={onPageChange} />);
    const next = screen.getByRole('button', { name: 'Next page' });
    expect(next).toBeDisabled();
    expect(next).toHaveClass('trazos-pagination-next');
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it('reports the clicked page and ignores the current one', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={2} pageSize={10} totalCount={50} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onPageChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Page 5' }));
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(5);
  });

  it('keeps its own page when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Pagination totalCount={50} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('21–30 of 50')).toBeInTheDocument();
  });

  it('clamps an out-of-range page', () => {
    render(<Pagination page={99} pageSize={10} totalCount={25} />);
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('21–25 of 25')).toBeInTheDocument();
  });

  it('shows the visible range and total with a custom format', () => {
    const { container, rerender } = render(<Pagination page={2} pageSize={10} totalCount={15} />);
    const summary = container.querySelector('p.trazos-pagination-summary');
    expect(summary).toHaveTextContent('11–15 of 15');
    rerender(<Pagination page={2} pageSize={10} totalCount={15} summaryFormat="{0}-{1} de {2}" />);
    expect(summary).toHaveTextContent('11-15 de 15');
  });

  it('returns to the first page when the page size changes', async () => {
    const onPageSizeChange = vi.fn();
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Pagination
        page={4}
        pageSize={10}
        totalCount={100}
        pageSizeOptions={[10, 25, 50]}
        pageSizeLabel="Filas"
        onPageSizeChange={onPageSizeChange}
        onPageChange={onPageChange}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Filas' });
    expect(select).toHaveClass('trazos-pagination-select');
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['10', '25', '50']);
    expect(select).toHaveValue('10');
    await user.selectOptions(select, '25');
    expect(onPageSizeChange).toHaveBeenCalledExactlyOnceWith(25);
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('keeps its own page size when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Pagination defaultPage={3} totalCount={100} pageSizeOptions={[10, 50]} />);
    expect(screen.getByText('21–30 of 100')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '50');
    expect(screen.getByText('1–50 of 100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  });

  it('has no selector without options and one page when there are no results', () => {
    const { container } = render(<Pagination page={1} pageSize={10} totalCount={0} />);
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(container.querySelector('.trazos-pagination-summary')).toHaveTextContent('0–0 of 0');
    expect(pageItems(container)).toEqual(['1']);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('labels the navigation and page buttons from props', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={20}
        label="Paginación"
        pageLabelFormat="Página {0}"
        nextLabel="Siguiente"
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toHaveClass('trazos-pagination');
    expect(screen.getByRole('button', { name: 'Página 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
  });

  it('forwards ref, class and native attributes to the nav', () => {
    const ref = createRef<HTMLElement>();
    render(<Pagination ref={ref} totalCount={10} className="extra" data-x="1" />);
    const nav = screen.getByRole('navigation');
    expect(ref.current).toBe(nav);
    expect(nav).toHaveClass('trazos-pagination', 'extra');
    expect(nav).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Pagination page={5} pageSize={10} totalCount={200} pageSizeOptions={[10, 25]} />);
    await expectNoA11yViolations(container);
  });
});
