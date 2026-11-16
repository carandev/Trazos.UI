import { useEffect, useState } from 'react';
import { Badge, DataTable, Pagination, SortHeader } from '@carandev/trazos-ui';
import type { TableSort } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface Order {
  id: number;
  customer: string;
  total: number;
  shipped: boolean;
}

interface OrderPage {
  items: Order[];
  totalCount: number;
}

const customers = ['Ana', 'Julián', 'Luisa', 'Tomás', 'Valentina', 'Mateo', 'Sofía', 'Samuel'];
const database: Order[] = Array.from({ length: 42 }, (_, i) => ({
  id: 5001 + i,
  customer: customers[i % customers.length] ?? '',
  total: ((i * 7919) % 900) * 1000 + 50_000,
  shipped: i % 4 !== 0,
}));

// Stands in for fetch(`/api/orders?${query}`): the server sorts and pages.
function fakeApi(query: URLSearchParams): Promise<OrderPage> {
  const sortBy = query.get('sortBy') ?? 'id';
  const desc = query.get('desc') === 'true';
  const page = Number(query.get('page'));
  const pageSize = Number(query.get('pageSize'));
  const sorted = [...database].sort((a, b) => {
    const order = sortBy === 'total' ? a.total - b.total : sortBy === 'customer' ? a.customer.localeCompare(b.customer) : a.id - b.id;
    return desc ? -order : order;
  });
  const items = sorted.slice((page - 1) * pageSize, page * pageSize);
  return new Promise((resolve) => setTimeout(() => resolve({ items, totalCount: database.length }), 600));
}

export default function Demo() {
  const [sort, setSort] = useState<TableSort | null>({ field: 'id', descending: true });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [result, setResult] = useState<(OrderPage & { query: string }) | null>(null);

  // Map the table state to the API query.
  const query = new URLSearchParams({
    sortBy: sort?.field ?? 'id',
    desc: String(sort?.descending ?? false),
    page: String(page),
    pageSize: String(pageSize),
  });
  const queryString = query.toString();
  // Loading until the response for the current query arrives.
  const loading = result?.query !== queryString;

  useEffect(() => {
    let current = true;
    void fakeApi(new URLSearchParams(queryString)).then((data) => {
      if (current) setResult({ ...data, query: queryString });
    });
    return () => {
      current = false;
    };
  }, [queryString]);

  return (
    <div className="docs-stack">
      <DataTable
        items={result?.items}
        loading={loading}
        loadingRows={pageSize}
        getRowKey={(order) => order.id}
        ariaLabel={t('Orders', 'Pedidos')}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          setPage(1);
        }}
        tableHeader={
          <>
            <SortHeader field="id">{t('Order', 'Pedido')}</SortHeader>
            <SortHeader field="customer">{t('Customer', 'Cliente')}</SortHeader>
            <th className="trazos-cell-center">{t('Status', 'Estado')}</th>
            <SortHeader field="total" align="end">
              {t('Total', 'Total')}
            </SortHeader>
          </>
        }
        rowTemplate={(order) => (
          <>
            <td>#{order.id}</td>
            <td>{order.customer}</td>
            <td className="trazos-cell-center">
              <Badge variant={order.shipped ? 'success' : 'info'}>
                {order.shipped ? t('Shipped', 'Enviado') : t('Preparing', 'En preparación')}
              </Badge>
            </td>
            <td className="trazos-cell-numeric">{order.total.toLocaleString()}</td>
          </>
        )}
        pagination={
          <Pagination
            page={page}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalCount={result?.totalCount ?? 0}
            pageSizeOptions={[5, 10, 20]}
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
        {t('Request:', 'Petición:')} <code>/api/orders?{queryString}</code>
      </p>
    </div>
  );
}
