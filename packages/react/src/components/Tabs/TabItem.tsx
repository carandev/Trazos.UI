import type { ReactNode } from 'react';

export interface TabItemProps {
  /** Stable key used by `activeKey`, `onActiveKeyChange` and the element ids. */
  tabKey?: string;
  title?: string;
  icon?: ReactNode;
  /** Badge/count shown after the title. */
  badge?: ReactNode;
  /** Replaces the icon, title and badge in the tab header. */
  header?: ReactNode;
  disabled?: boolean;
  /** Panel content, shown while the tab is active. */
  children?: ReactNode;
}

/**
 * Declares one tab of a `<Tabs>`. It renders nothing by itself: `<Tabs>`
 * reads its props from its direct children, so there is no registration
 * step and no parent/child re-render loop.
 */
export const TabItem: (props: TabItemProps) => null = () => null;
