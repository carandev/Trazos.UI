import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { DescriptionItem, DescriptionList } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';
import listCss from './DescriptionList.css?raw';

describe('DescriptionList', () => {
  it('renders label and value pairs with hints, empty text and rich values', () => {
    const { container } = render(
      <DescriptionList columns={3}>
        <DescriptionItem label="Salary" value="$ 3.500.000" hint="Before deductions" />
        <DescriptionItem label="Bank" emptyText="Not set" />
        <DescriptionItem label="Address" fullWidth>
          <strong>Calle 1</strong>
        </DescriptionItem>
      </DescriptionList>,
    );
    const dl = container.querySelector('dl');
    expect(dl).toHaveClass('trazos-dl', 'trazos-dl-cols-3');
    expect([...container.querySelectorAll('dt')].map((dt) => dt.textContent)).toEqual(['Salary', 'Bank', 'Address']);
    const values = container.querySelectorAll('dd.trazos-dl-value');
    expect(values[0]).toHaveTextContent('$ 3.500.000');
    expect(container.querySelector('dd.trazos-dl-hint')).toHaveTextContent('Before deductions');
    expect(values[1]).toHaveTextContent('Not set');
    expect(values[1]).toHaveClass('trazos-dl-value-empty');
    expect(values[0]).not.toHaveClass('trazos-dl-value-empty');
    expect(values[2]?.querySelector('strong')).toHaveTextContent('Calle 1');
    expect(container.querySelectorAll('.trazos-dl-item')[2]).toHaveClass('trazos-dl-item-full');
  });

  it('defaults to two columns and clamps the count to 1..4', () => {
    const { container, rerender } = render(<DescriptionList />);
    expect(container.querySelector('dl')).toHaveClass('trazos-dl-cols-2');
    rerender(<DescriptionList columns={0} />);
    expect(container.querySelector('dl')).toHaveClass('trazos-dl-cols-1');
    rerender(<DescriptionList columns={9} />);
    expect(container.querySelector('dl')).toHaveClass('trazos-dl-cols-4');
  });

  it('shows an em dash when an item has no value', () => {
    render(
      <DescriptionList>
        <DescriptionItem label="Phone" />
      </DescriptionList>,
    );
    expect(screen.getByText('—')).toHaveClass('trazos-dl-value', 'trazos-dl-value-empty');
  });

  it('prefers children over value', () => {
    render(
      <DescriptionList>
        <DescriptionItem label="Status" value="ignored">
          <span>Active</span>
        </DescriptionItem>
      </DescriptionList>,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).toBeNull();
  });

  it('draws a dashed divider under each item when bordered', () => {
    const { container } = render(
      <DescriptionList bordered>
        <DescriptionItem label="A" value="1" />
      </DescriptionList>,
    );
    expect(container.querySelector('dl')).toHaveClass('trazos-dl-bordered');
    expect(getComputedStyle(container.querySelector('.trazos-dl-item') as Element).paddingBottom).toBe('14px');
    // jsdom does not resolve var() inside border shorthands, so the line is read from the stylesheet.
    expect(listCss).toMatch(/\.trazos-dl-bordered \.trazos-dl-item \{[^}]*border-bottom: 1px dashed var\(--trazos-border-soft\);/);
  });

  it('shows one column on phones, two on tablets and up to four on wide screens', () => {
    expect(listCss).toMatch(/\.trazos-dl \{[^}]*grid-template-columns: minmax\(0, 1fr\);/);
    const tablet = listCss.match(/@media \(min-width: 640px\) \{[\s\S]*?\n\}/)?.[0];
    expect(tablet).toContain('.trazos-dl-cols-4');
    expect(tablet).toContain('repeat(2, minmax(0, 1fr))');
    const wide = listCss.match(/@media \(min-width: 1024px\) \{[\s\S]*?\n\}/)?.[0];
    expect(wide).toContain('repeat(3, minmax(0, 1fr))');
    expect(wide).toContain('repeat(4, minmax(0, 1fr))');
  });

  it('forwards refs, extra classes and native attributes on the list and the item', () => {
    const listRef = createRef<HTMLDListElement>();
    const itemRef = createRef<HTMLDivElement>();
    const { container } = render(
      <DescriptionList ref={listRef} className="list-extra" data-x="1">
        <DescriptionItem ref={itemRef} label="A" value="1" className="item-extra" data-y="2" />
      </DescriptionList>,
    );
    const dl = container.querySelector('dl');
    expect(listRef.current).toBe(dl);
    expect(dl).toHaveClass('trazos-dl', 'list-extra');
    expect(dl).toHaveAttribute('data-x', '1');
    expect(itemRef.current).toHaveClass('trazos-dl-item', 'item-extra');
    expect(itemRef.current).toHaveAttribute('data-y', '2');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DescriptionList columns={3} bordered>
        <DescriptionItem label="Salary" value="$ 3.500.000" hint="Before deductions" />
        <DescriptionItem label="Bank" />
        <DescriptionItem label="Address" fullWidth>
          <strong>Calle 1</strong>
        </DescriptionItem>
      </DescriptionList>,
    );
    await expectNoA11yViolations(container);
  });
});
