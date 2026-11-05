import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler, createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TabItem, Tabs } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

function Basic(props: Partial<React.ComponentProps<typeof Tabs>>) {
  return (
    <Tabs {...props}>
      <TabItem title="One">Panel one</TabItem>
      <TabItem title="Two">Panel two</TabItem>
      <TabItem title="Three">Panel three</TabItem>
    </Tabs>
  );
}

function Keyed(props: Partial<React.ComponentProps<typeof Tabs>>) {
  return (
    <Tabs {...props}>
      <TabItem tabKey="a" title="Alpha">Panel a</TabItem>
      <TabItem tabKey="b" title="Beta">Panel b</TabItem>
      <TabItem tabKey="c" title="Gamma">Panel c</TabItem>
    </Tabs>
  );
}

const tab = (name: string) => screen.getByRole('tab', { name });

describe('Tabs', () => {
  it('renders an underline tablist with the first tab active by default', () => {
    const { container } = render(<Basic />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('trazos-tabs', 'trazos-tabs-underline');
    expect(screen.getByRole('tablist')).toHaveClass('trazos-tabs-nav');
    const one = tab('One');
    expect(one).toHaveAttribute('type', 'button');
    expect(one).toHaveClass('trazos-tab-btn', 'trazos-tab-btn--active');
    expect(one).toHaveAttribute('aria-selected', 'true');
    expect(one).toHaveAttribute('tabindex', '0');
    expect(tab('Two')).toHaveAttribute('aria-selected', 'false');
    expect(tab('Two')).toHaveAttribute('tabindex', '-1');
    expect(tab('Two')).not.toHaveClass('trazos-tab-btn--active');
    expect(one.querySelector('.trazos-tab-title')).toHaveTextContent('One');
    const panels = screen.getAllByRole('tabpanel');
    expect(panels).toHaveLength(1);
    expect(panels[0]).toHaveClass('trazos-tabs-panel');
    expect(panels[0]).toHaveTextContent('Panel one');
  });

  it('links each tab with the panel through ids', () => {
    render(<Keyed />);
    const alpha = tab('Alpha');
    const panel = screen.getByRole('tabpanel');
    expect(alpha.id).toMatch(/-tab-a$/);
    expect(alpha).toHaveAttribute('aria-controls', panel.id);
    expect(panel.id).toMatch(/-panel-a$/);
    expect(panel).toHaveAttribute('aria-labelledby', alpha.id);
    expect(tab('Beta').getAttribute('aria-controls')).toMatch(/-panel-b$/);
  });

  it('uses the index in ids when a tab has no key', () => {
    render(<Basic />);
    expect(tab('Two').id).toMatch(/-tab-1$/);
  });

  it.each(['underline', 'pills', 'contained'] as const)('maps variant %s to its class', (variant) => {
    const { container } = render(<Basic variant={variant} />);
    expect(container.firstElementChild).toHaveClass(`trazos-tabs-${variant}`);
  });

  it('renders icon, title and badge slots, or a custom header instead', () => {
    render(
      <Tabs>
        <TabItem title="Inbox" icon={<svg data-testid="icon" />} badge={3}>
          Inbox panel
        </TabItem>
        <TabItem title="Ignored" header={<em>Custom</em>}>
          Custom panel
        </TabItem>
      </Tabs>,
    );
    const inbox = tab('Inbox 3');
    expect(inbox.querySelector('.trazos-tab-icon')).toContainElement(screen.getByTestId('icon'));
    expect(inbox.querySelector('.trazos-tab-badge')).toHaveTextContent('3');
    const custom = tab('Custom');
    expect(custom.querySelector('.trazos-tab-title')).toBeNull();
    expect(custom.querySelector('.trazos-tab-icon')).toBeNull();
    expect(custom).not.toHaveTextContent('Ignored');
  });

  it('selects a tab on click (uncontrolled) and reports index and key', async () => {
    const onActiveIndexChange = vi.fn();
    const onActiveKeyChange = vi.fn();
    render(<Keyed onActiveIndexChange={onActiveIndexChange} onActiveKeyChange={onActiveKeyChange} />);
    await userEvent.click(tab('Gamma'));
    expect(tab('Gamma')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Alpha')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel c');
    expect(onActiveIndexChange).toHaveBeenCalledExactlyOnceWith(2);
    expect(onActiveKeyChange).toHaveBeenCalledExactlyOnceWith('c');
  });

  it('does not report a key for tabs without one', async () => {
    const onActiveKeyChange = vi.fn();
    const onActiveIndexChange = vi.fn();
    render(<Basic onActiveKeyChange={onActiveKeyChange} onActiveIndexChange={onActiveIndexChange} />);
    await userEvent.click(tab('Two'));
    expect(onActiveIndexChange).toHaveBeenCalledExactlyOnceWith(1);
    expect(onActiveKeyChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two');
  });

  it('honours defaultActiveIndex and defaultActiveKey', () => {
    const { unmount } = render(<Basic defaultActiveIndex={2} />);
    expect(tab('Three')).toHaveAttribute('aria-selected', 'true');
    unmount();
    render(<Keyed defaultActiveKey="B" />);
    expect(tab('Beta')).toHaveAttribute('aria-selected', 'true');
  });

  it('is controlled by activeIndex', async () => {
    const onActiveIndexChange = vi.fn();
    const { rerender } = render(<Basic activeIndex={1} onActiveIndexChange={onActiveIndexChange} />);
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(tab('Three'));
    expect(onActiveIndexChange).toHaveBeenCalledExactlyOnceWith(2);
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
    rerender(<Basic activeIndex={2} onActiveIndexChange={onActiveIndexChange} />);
    expect(tab('Three')).toHaveAttribute('aria-selected', 'true');
  });

  it('is controlled by activeKey (case-insensitive), which wins over activeIndex', async () => {
    function Harness() {
      const [key, setKey] = useState('B');
      return <Keyed activeKey={key} activeIndex={0} onActiveKeyChange={setKey} />;
    }
    render(<Harness />);
    expect(tab('Beta')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Alpha')).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(tab('Gamma'));
    expect(tab('Gamma')).toHaveAttribute('aria-selected', 'true');
  });

  it('falls back to activeIndex, then the first tab, when the key or index does not match', () => {
    const { rerender } = render(<Keyed activeKey="zzz" activeIndex={2} />);
    expect(tab('Gamma')).toHaveAttribute('aria-selected', 'true');
    rerender(<Keyed activeIndex={9} />);
    expect(tab('Alpha')).toHaveAttribute('aria-selected', 'true');
  });

  it('does not select disabled tabs', async () => {
    const onActiveIndexChange = vi.fn();
    render(
      <Tabs onActiveIndexChange={onActiveIndexChange}>
        <TabItem title="One">1</TabItem>
        <TabItem title="Two" disabled>
          2
        </TabItem>
      </Tabs>,
    );
    const two = tab('Two');
    expect(two).toBeDisabled();
    expect(two).toHaveClass('trazos-tab-btn--disabled');
    await userEvent.setup({ pointerEventsCheck: 0 }).click(two);
    expect(onActiveIndexChange).not.toHaveBeenCalled();
    expect(tab('One')).toHaveAttribute('aria-selected', 'true');
  });

  it('moves focus and selection with ArrowRight/ArrowLeft (wrapping), Home and End, skipping disabled tabs', async () => {
    const onActiveIndexChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tabs onActiveIndexChange={onActiveIndexChange}>
        <TabItem title="One">1</TabItem>
        <TabItem title="Two" disabled>
          2
        </TabItem>
        <TabItem title="Three">3</TabItem>
        <TabItem title="Four">4</TabItem>
      </Tabs>,
    );
    tab('One').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Three')).toHaveFocus();
    expect(tab('Three')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight}');
    expect(tab('Four')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tab('One')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tab('Four')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(tab('One')).toHaveFocus();
    await user.keyboard('{End}');
    expect(tab('Four')).toHaveFocus();
    expect(tab('Four')).toHaveAttribute('aria-selected', 'true');
    expect(onActiveIndexChange.mock.calls.map((c: unknown[]) => c[0])).toEqual([2, 3, 0, 3, 0, 3]);
  });

  it('updates headers when TabItem props change and renders once on mount (no render loop)', () => {
    const onRender = vi.fn();
    const { rerender } = render(
      <Profiler id="tabs" onRender={onRender}>
        <Tabs>
          <TabItem title="One">1</TabItem>
        </Tabs>
      </Profiler>,
    );
    expect(onRender).toHaveBeenCalledTimes(1);
    rerender(
      <Profiler id="tabs" onRender={onRender}>
        <Tabs>
          <TabItem title="Renamed">1</TabItem>
          <TabItem title="Added">2</TabItem>
        </Tabs>
      </Profiler>,
    );
    expect(onRender).toHaveBeenCalledTimes(2);
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Renamed', 'Added']);
  });

  it('renders no panel when there are no tabs', () => {
    render(<Tabs />);
    expect(screen.getByRole('tablist')).toBeEmptyDOMElement();
    expect(screen.queryByRole('tabpanel')).toBeNull();
  });

  it('forwards ref, class and native attributes to the root', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Basic ref={ref} className="extra" data-x="1" />);
    const root = container.firstElementChild;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('trazos-tabs', 'extra');
    expect(root).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Keyed variant="pills" />);
    await expectNoA11yViolations(container);
  });
});
