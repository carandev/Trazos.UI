import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import { cx } from '../../internal/cx';
import { TabItem, type TabItemProps } from './TabItem';
import './Tabs.css';

/** Mirrors `Trazos.UI.Components.TabsVariant`. */
export type TabsVariant = 'underline' | 'pills' | 'contained';

export interface TabsProps extends ComponentPropsWithRef<'div'> {
  variant?: TabsVariant;
  /** Controlled active index. */
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  /** Controlled active key (case-insensitive); wins over the index when it matches a tab. */
  activeKey?: string;
  defaultActiveKey?: string;
  /** Called only when the selected tab has a `tabKey`. */
  onActiveKeyChange?: (key: string) => void;
}

function sameKey(a: string | undefined, b: string | undefined): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

/** Same resolution as the Razor `ActiveTab`: key match, then index in range, then first tab. */
function resolveActive(tabs: readonly TabItemProps[], key: string | undefined, index: number): number {
  if (tabs.length === 0) return -1;
  if (key) {
    const match = tabs.findIndex((t) => sameKey(t.tabKey, key));
    if (match >= 0) return match;
  }
  return index >= 0 && index < tabs.length ? index : 0;
}

export function Tabs({
  variant = 'underline',
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  activeKey,
  defaultActiveKey,
  onActiveKeyChange,
  className,
  children,
  ...rest
}: TabsProps) {
  const id = `trazos-tabs-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [innerIndex, setInnerIndex] = useState(defaultActiveIndex);
  const [innerKey, setInnerKey] = useState<string | undefined>(defaultActiveKey);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = Children.toArray(children)
    .filter((child): child is ReactElement<TabItemProps> => isValidElement(child) && child.type === TabItem)
    .map((child) => child.props);

  const currentIndex = activeIndex ?? innerIndex;
  const currentKey = activeKey !== undefined ? activeKey : innerKey;
  const active = resolveActive(tabs, currentKey, currentIndex);

  const headerId = (tab: TabItemProps, index: number) => `${id}-tab-${tab.tabKey ?? String(index)}`;
  const panelId = (tab: TabItemProps, index: number) => `${id}-panel-${tab.tabKey ?? String(index)}`;

  const select = (index: number) => {
    const tab = tabs[index];
    if (!tab || tab.disabled) return;
    if (activeIndex === undefined) setInnerIndex(index);
    // Uncontrolled keyless tabs clear the stored key so the index can take effect.
    if (activeKey === undefined) setInnerKey(tab.tabKey || undefined);
    onActiveIndexChange?.(index);
    if (tab.tabKey) onActiveKeyChange?.(tab.tabKey);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const enabled = tabs.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
    if (enabled.length === 0) return;
    const focused = buttons.current.findIndex((b) => b === event.currentTarget);
    const from = focused >= 0 ? focused : active;
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = enabled.find((i) => i > from) ?? enabled[0];
        break;
      case 'ArrowLeft':
        next = [...enabled].reverse().find((i) => i < from) ?? enabled[enabled.length - 1];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    if (next === undefined) return;
    event.preventDefault();
    buttons.current[next]?.focus();
    select(next);
  };

  const activeTab = tabs[active];

  return (
    <div {...rest} className={cx('trazos-tabs', `trazos-tabs-${variant}`, className)}>
      <div className="trazos-tabs-nav" role="tablist">
        {tabs.map((tab, index) => {
          const isActive = index === active;
          return (
            <button
              key={headerId(tab, index)}
              ref={(el) => {
                buttons.current[index] = el;
              }}
              type="button"
              role="tab"
              id={headerId(tab, index)}
              aria-selected={isActive}
              aria-controls={panelId(tab, index)}
              tabIndex={isActive ? 0 : -1}
              className={cx(
                'trazos-tab-btn',
                isActive && 'trazos-tab-btn--active',
                tab.disabled && 'trazos-tab-btn--disabled',
              )}
              disabled={tab.disabled}
              onClick={() => {
                select(index);
              }}
              onKeyDown={handleKeyDown}
            >
              {tab.header != null ? (
                tab.header
              ) : (
                <>
                  {tab.icon != null && <span className="trazos-tab-icon">{tab.icon}</span>}
                  <span className="trazos-tab-title">{tab.title ?? ''}</span>
                  {tab.badge != null && <span className="trazos-tab-badge">{tab.badge}</span>}
                </>
              )}
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div
          className="trazos-tabs-panel"
          role="tabpanel"
          id={panelId(activeTab, active)}
          aria-labelledby={headerId(activeTab, active)}
        >
          {activeTab.children}
        </div>
      )}
    </div>
  );
}
