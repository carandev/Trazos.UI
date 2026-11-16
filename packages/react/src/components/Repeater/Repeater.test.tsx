import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type CSSProperties } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Repeater } from './index';
import type { RepeaterContext } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

interface Bracket {
  from: number;
  to?: number;
}

const row = ({ item, index, isLast }: RepeaterContext<Bracket>) => (
  <span className={isLast ? 'row last' : 'row'}>{`${index}:${item.from}`}</span>
);

function Bound({
  initial,
  onItems,
  ...props
}: {
  initial: Bracket[];
  onItems?: (items: Bracket[]) => void;
} & Partial<Parameters<typeof Repeater<Bracket>>[0]>) {
  const [items, setItems] = useState(initial);
  return (
    <Repeater<Bracket>
      items={items}
      onItemsChange={(next) => {
        onItems?.(next);
        setItems(next);
      }}
      renderItem={row}
      {...props}
    />
  );
}

describe('Repeater', () => {
  it('renders rows with their index, marks the last row and names the list', () => {
    const { container } = render(
      <Repeater<Bracket>
        label="Brackets"
        items={[{ from: 0, to: 1000 }, { from: 1000 }]}
        renderItem={row}
      />,
    );
    expect(container.firstElementChild).toHaveClass('trazos-repeater');
    const list = screen.getByRole('list', { name: 'Brackets' });
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('trazos-repeater-rows');
    expect([...container.querySelectorAll('.row')].map((r) => r.textContent)).toEqual(['0:0', '1:1000']);
    expect(container.querySelectorAll('.row.last')).toHaveLength(1);
    expect(container.querySelector('.row.last')).toHaveTextContent('1:1000');
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveClass('trazos-repeater-row');
    expect(items[0]?.querySelector('.trazos-repeater-cells .row')).toBeInTheDocument();
  });

  it('has no add button without createItem', () => {
    const { container } = render(<Repeater<Bracket> items={[]} renderItem={row} />);
    expect(container.querySelector('.trazos-repeater-add')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('adds created items and removes the right row with new arrays', async () => {
    const changes: Bracket[][] = [];
    const createItem = vi.fn((items: readonly Bracket[]) => ({ from: (items.at(-1)?.from ?? 0) + 500 }));
    render(
      <Bound
        initial={[{ from: 0 }]}
        createItem={createItem}
        removeLabelFormat="Quitar fila {0}"
        onItems={(next) => changes.push(next)}
      />,
    );
    const add = screen.getByRole('button', { name: 'Add row' });
    expect(add).toHaveClass('trazos-repeater-add');
    await userEvent.click(add);
    await userEvent.click(add);
    expect(changes.at(-1)?.map((i) => i.from)).toEqual([0, 500, 1000]);

    await userEvent.click(screen.getByRole('button', { name: 'Quitar fila 2' }));
    expect(changes.at(-1)?.map((i) => i.from)).toEqual([0, 1000]);
    expect(changes).toHaveLength(3);
    expect(changes[0]).not.toBe(changes[1]);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Quitar fila 1' })).toHaveClass('trazos-repeater-remove');
  });

  it('uses English default labels and a custom add text', () => {
    const { rerender } = render(<Repeater<Bracket> items={[{ from: 0 }]} renderItem={row} createItem={() => ({ from: 0 })} />);
    expect(screen.getByRole('button', { name: 'Remove row 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add row' })).toBeInTheDocument();
    rerender(
      <Repeater<Bracket> items={[{ from: 0 }]} renderItem={row} createItem={() => ({ from: 0 })} addText="Add bracket" />,
    );
    expect(screen.getByRole('button', { name: 'Add bracket' })).toBeInTheDocument();
  });

  it('keeps each row state attached to its row after a removal', async () => {
    render(
      <Bound
        initial={[{ from: 1 }, { from: 2 }, { from: 3 }]}
        renderItem={({ item }) => <input aria-label={`Note ${item.from}`} defaultValue={`note ${item.from}`} />}
      />,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Note 3' }), '!');
    await userEvent.click(screen.getByRole('button', { name: 'Remove row 1' }));
    expect(screen.queryByRole('textbox', { name: 'Note 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Note 2' })).toHaveValue('note 2');
    expect(screen.getByRole('textbox', { name: 'Note 3' })).toHaveValue('note 3!');
  });

  it('disables remove at minItems and add at maxItems', async () => {
    const onChange = vi.fn();
    render(
      <Bound initial={[{ from: 0 }, { from: 1 }]} createItem={() => ({ from: 9 })} minItems={2} maxItems={2} onItems={onChange} />,
    );
    for (const button of screen.getAllByRole('button', { name: /Remove row/ })) expect(button).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add row' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Add row' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables every button when disabled', () => {
    render(<Repeater<Bracket> disabled items={[{ from: 0 }]} renderItem={row} createItem={() => ({ from: 0 })} />);
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });

  it('shows the header hidden from assistive technology and the empty content', () => {
    const { container, rerender } = render(
      <Repeater<Bracket>
        items={[{ from: 0 }]}
        renderItem={row}
        header={<span>From</span>}
        emptyContent="No brackets yet"
      />,
    );
    const header = container.querySelector('.trazos-repeater-header');
    expect(header).toHaveAttribute('aria-hidden', 'true');
    expect(header?.querySelector('.trazos-repeater-cells')).toHaveTextContent('From');
    expect(header?.querySelector('.trazos-repeater-spacer')).toBeInTheDocument();
    expect(screen.queryByText('No brackets yet')).not.toBeInTheDocument();

    rerender(<Repeater<Bracket> items={[]} renderItem={row} emptyContent="No brackets yet" />);
    expect(screen.getByText('No brackets yet')).toHaveClass('trazos-repeater-empty');
    expect(container.querySelector('.trazos-repeater-header')).not.toBeInTheDocument();
  });

  it('works uncontrolled from defaultItems', async () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <Repeater<Bracket>
        defaultItems={[{ from: 5 }]}
        renderItem={row}
        createItem={() => ({ from: 6 })}
        onItemsChange={onItemsChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add row' }));
    expect(onItemsChange).toHaveBeenCalledWith([{ from: 5 }, { from: 6 }]);
    expect([...container.querySelectorAll('.row')].map((r) => r.textContent)).toEqual(['0:5', '1:6']);
  });

  it('forwards the ref, classes, style with the column variable and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Repeater<Bracket>
        ref={ref}
        items={[]}
        renderItem={row}
        className="extra"
        data-testid="rep"
        style={{ '--trazos-repeater-columns': '1fr 8rem' } as CSSProperties}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('trazos-repeater', 'extra');
    expect(root).toHaveAttribute('data-testid', 'rep');
    expect(root.style.getPropertyValue('--trazos-repeater-columns')).toBe('1fr 8rem');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Repeater<Bracket>
        label="Brackets"
        items={[{ from: 0 }, { from: 1 }]}
        header={<span>From</span>}
        renderItem={({ item }) => <input aria-label="From" defaultValue={item.from} />}
        createItem={() => ({ from: 0 })}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
