import { createContext } from 'react';

/** Sort state of a `DataTable`: the column field and its direction (Razor `TableSort`). */
export interface TableSort {
  field: string;
  descending: boolean;
}

/** Horizontal alignment of a table column (Razor `TableAlign`). */
export type TableAlign = 'start' | 'center' | 'end';

/** What a `SortHeader` needs from the table around it. */
export interface DataTableSortContextValue {
  sort: TableSort | null;
  toggleSort: (field: string) => void;
}

export const DataTableSortContext = createContext<DataTableSortContextValue | null>(null);
