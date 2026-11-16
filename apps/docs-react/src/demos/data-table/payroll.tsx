import { useState } from 'react';
import { Button, DataTable, Pagination, SortHeader, TextInput } from '@carandev/trazos-ui';
import type { TableSort } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface Payslip {
  name: string;
  net: number;
}

const payslips: Payslip[] = [
  { name: 'Ana María Restrepo', net: 3_210_000 },
  { name: 'Julián Ospina', net: 4_580_000 },
  { name: 'Luisa Fernanda Gil', net: 2_890_000 },
  { name: 'Tomás Arango', net: 5_120_000 },
  { name: 'Valentina Ríos', net: 3_760_000 },
  { name: 'Mateo Cárdenas', net: 2_450_000 },
  { name: 'Sofía Londoño', net: 6_030_000 },
  { name: 'Samuel Duque', net: 3_340_000 },
];

const money = (value: number) => value.toLocaleString();

export default function Demo() {
  const [sort, setSort] = useState<TableSort | null>({ field: 'name', descending: false });
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [opened, setOpened] = useState<string | null>(null);

  // The table never sorts or pages: the app does it, here in memory.
  const filtered = payslips
    .filter((p) => p.name.toLowerCase().includes(filter.trim().toLowerCase()))
    .sort((a, b) => {
      const order = sort?.field === 'net' ? a.net - b.net : a.name.localeCompare(b.name);
      return sort?.descending ? -order : order;
    });
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const total = filtered.reduce((sum, p) => sum + p.net, 0);

  return (
    <div className="docs-stack">
      <DataTable
        items={pageItems}
        getRowKey={(slip) => slip.name}
        ariaLabel={t('Payslips', 'Desprendibles')}
        sort={sort}
        onSortChange={setSort}
        actionsLabel={t('Actions', 'Acciones')}
        toolbar={
          <TextInput
            className="docs-table-filter"
            aria-label={t('Filter by name', 'Filtrar por nombre')}
            placeholder={t('Filter by name', 'Filtrar por nombre')}
            value={filter}
            onValueChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
          />
        }
        tableHeader={
          <>
            <SortHeader field="name">{t('Employee', 'Empleado')}</SortHeader>
            <SortHeader field="net" align="end">
              {t('Net pay', 'Neto a pagar')}
            </SortHeader>
          </>
        }
        rowTemplate={(slip) => (
          <>
            <td>{slip.name}</td>
            <td className="trazos-cell-numeric">{money(slip.net)}</td>
          </>
        )}
        rowActions={(slip) => (
          <Button size="small" variant="ghost" onClick={() => setOpened(slip.name)}>
            {t('View', 'Ver')}
          </Button>
        )}
        tableFooter={
          <>
            <td>{t('Total', 'Total')}</td>
            <td className="trazos-cell-numeric">{money(total)}</td>
          </>
        }
        pagination={
          <Pagination
            page={page}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalCount={filtered.length}
            pageSizeOptions={[3, 5, 10]}
            label={t('Pagination', 'Paginación')}
            previousLabel={t('Previous page', 'Página anterior')}
            nextLabel={t('Next page', 'Página siguiente')}
            pageLabelFormat={t('Page {0}', 'Página {0}')}
            pageSizeLabel={t('Rows per page', 'Filas por página')}
            summaryFormat={t('{0}–{1} of {2}', '{0}–{1} de {2}')}
          />
        }
      />
      <p className="docs-demo-output">
        {t('Opened:', 'Abierto:')} <strong>{opened ?? t('none', 'ninguno')}</strong>
      </p>
    </div>
  );
}
