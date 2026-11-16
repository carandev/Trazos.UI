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

  it('draws a dashed divider under each item when plain and bordered', () => {
    const { container } = render(
      <DescriptionList variant="plain" bordered>
        <DescriptionItem label="A" value="1" />
      </DescriptionList>,
    );
    expect(container.querySelector('dl')).toHaveClass('trazos-dl-plain', 'trazos-dl-bordered');
    expect(getComputedStyle(container.querySelector('.trazos-dl-item') as Element).paddingBottom).toBe('14px');
    // jsdom does not resolve var() inside border shorthands, so the line is read from the stylesheet.
    expect(listCss).toMatch(/\.trazos-dl-plain\.trazos-dl-bordered \.trazos-dl-item \{[^}]*border-bottom: 1px dashed var\(--trazos-border-soft\);/);
  });

  it('auto-fits items by a minimum width, capped by columns, with one column on phones', () => {
    expect(listCss).toMatch(/\.trazos-dl \{[^}]*grid-template-columns: repeat\(\s*auto-fit,\s*minmax\(min\(100%, max\(var\(--trazos-dl-min, 12rem\)/);
    expect(listCss).toContain('var(--trazos-dl-cols)');
    expect(listCss).toMatch(/\.trazos-dl-cols-4 \{[^}]*--trazos-dl-cols: 4;/);
    expect(listCss).toMatch(/\.trazos-dl \{[^}]*container: trazos-dl \/ inline-size;/);
    expect(listCss).toContain('overflow-wrap: anywhere');
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

  it('defaults to the tiles variant and switches to plain', () => {
    const { container, rerender } = render(<DescriptionList />);
    expect(container.querySelector('dl')).toHaveClass('trazos-dl-tiles');
    expect(container.querySelector('dl')).not.toHaveClass('trazos-dl-plain');
    rerender(<DescriptionList variant="plain" />);
    expect(container.querySelector('dl')).toHaveClass('trazos-dl-plain');
    expect(container.querySelector('dl')).not.toHaveClass('trazos-dl-tiles');
  });

  it('sets the minimum item width as a custom property and keeps the host style', () => {
    const { container } = render(<DescriptionList minItemWidth="16rem" style={{ marginTop: '1rem' }} />);
    const dl = container.querySelector('dl') as HTMLElement;
    expect(dl.style.getPropertyValue('--trazos-dl-min')).toBe('16rem');
    expect(dl.style.marginTop).toBe('1rem');
    const { container: other } = render(<DescriptionList />);
    expect(other.querySelector('dl')?.getAttribute('style')).toBeNull();
  });

  it('clamps the item span to 1..4', () => {
    const { container } = render(
      <DescriptionList columns={4}>
        <DescriptionItem label="A" span={1} />
        <DescriptionItem label="B" span={2} />
        <DescriptionItem label="C" span={3} />
        <DescriptionItem label="D" span={9} />
        <DescriptionItem label="E" span={0} />
      </DescriptionList>,
    );
    const items = [...container.querySelectorAll('.trazos-dl-item')];
    expect(items[0]?.className).not.toMatch(/trazos-dl-span/);
    expect(items[1]).toHaveClass('trazos-dl-span-2');
    expect(items[2]).toHaveClass('trazos-dl-span-3');
    expect(items[3]).toHaveClass('trazos-dl-span-4');
    expect(items[4]?.className).not.toMatch(/trazos-dl-span/);
    expect(listCss).toMatch(/@container trazos-dl \(min-width: 26rem\) \{[\s\S]*?\.trazos-dl-span-2/);
  });

  it('tints a highlighted item olive and lets a tone override it', () => {
    const { container } = render(
      <DescriptionList>
        <DescriptionItem label="Plain" value="1" />
        <DescriptionItem label="Net pay" value="$ 3.210.000" highlight />
        <DescriptionItem label="Gold" value="2" highlight tone="gold" />
        <DescriptionItem label="Wine" value="3" tone="wine" />
        <DescriptionItem label="Sky" value="4" tone="sky" />
      </DescriptionList>,
    );
    const items = [...container.querySelectorAll('.trazos-dl-item')];
    expect(items[0]?.className).not.toMatch(/trazos-dl-tone|trazos-dl-highlight/);
    expect(items[1]).toHaveClass('trazos-dl-highlight', 'trazos-dl-tone-olive');
    expect(items[2]).toHaveClass('trazos-dl-highlight', 'trazos-dl-tone-gold');
    expect(items[2]).not.toHaveClass('trazos-dl-tone-olive');
    expect(items[3]).toHaveClass('trazos-dl-tone-wine');
    expect(items[4]).toHaveClass('trazos-dl-tone-sky');
    for (const tone of ['olive', 'gold', 'wine', 'sky']) {
      expect(listCss).toContain(`.trazos-dl-tone-${tone}`);
      expect(listCss).toContain(`var(--trazos-${tone}-tint)`);
    }
  });

  it('renders the icon hidden inside the term and the actions after the value', () => {
    const { container } = render(
      <DescriptionList>
        <DescriptionItem
          label="Email"
          value="ana@example.com"
          hint="Work"
          icon={<svg data-testid="icon" />}
          actions={<button type="button">Copy</button>}
        />
      </DescriptionList>,
    );
    const icon = container.querySelector('dt .trazos-dl-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon?.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('dt .trazos-dl-label-text')).toHaveTextContent('Email');
    const item = container.querySelector('.trazos-dl-item') as Element;
    expect([...item.children].map((c) => `${c.tagName.toLowerCase()}.${c.className}`)).toEqual([
      'dt.trazos-dl-label',
      'dd.trazos-dl-value',
      'dd.trazos-dl-hint',
      'dd.trazos-dl-actions',
    ]);
    expect(screen.getByRole('button', { name: 'Copy' }).closest('dd')).toHaveClass('trazos-dl-actions');
  });

  it('renders no icon or actions wrappers when they are not given', () => {
    const { container } = render(
      <DescriptionList>
        <DescriptionItem label="Bank" />
      </DescriptionList>,
    );
    expect(container.querySelector('.trazos-dl-icon')).toBeNull();
    expect(container.querySelector('.trazos-dl-actions')).toBeNull();
    expect(container.querySelector('dt')).toHaveTextContent('Bank');
  });

  it('styles tiles with tokens only', () => {
    expect(listCss).toMatch(/\.trazos-dl-tiles \.trazos-dl-item \{[^}]*border: 1\.5px solid var\(--trazos-border-soft\);/);
    expect(listCss).toMatch(/\.trazos-dl-tiles \.trazos-dl-item \{[^}]*border-radius: var\(--trazos-radius-sketch-sm\);/);
    expect(listCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DescriptionList columns={3} bordered>
        <DescriptionItem label="Salary" value="$ 3.500.000" hint="Before deductions" icon={<svg />} highlight span={2} />
        <DescriptionItem label="Email" value="ana@example.com" actions={<button type="button">Copy email</button>} />
        <DescriptionItem label="Bank" />
        <DescriptionItem label="Address" fullWidth>
          <strong>Calle 1</strong>
        </DescriptionItem>
      </DescriptionList>,
    );
    await expectNoA11yViolations(container);
  });
});

describe('DescriptionList width', () => {
  it('fills its parent, so a flex row cannot collapse the size container', () => {
    const start = listCss.indexOf('.trazos-dl {');
    const rule = listCss.slice(start, listCss.indexOf('}', start));

    expect(rule).toContain('width: 100%');
    expect(rule).toContain('box-sizing: border-box');
  });
});
