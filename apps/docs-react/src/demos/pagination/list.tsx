import { useState } from 'react';
import { Badge, Pagination } from '@carandev/trazos-ui';
import { t } from '../../i18n';

const invoices = Array.from({ length: 23 }, (_, i) => ({
  id: `INV-${String(1001 + i)}`,
  paid: i % 3 !== 0,
}));

export default function Demo() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  // Client-side paging: slice the list for the current page.
  const visible = invoices.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="docs-stack">
      <ul className="docs-stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {visible.map((invoice) => (
          <li key={invoice.id} className="docs-row">
            <strong>{invoice.id}</strong>
            <Badge variant={invoice.paid ? 'success' : 'warning'}>
              {invoice.paid ? t('Paid', 'Pagada') : t('Pending', 'Pendiente')}
            </Badge>
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        totalCount={invoices.length}
        siblings={0}
        label={t('Invoice pages', 'Páginas de facturas')}
        previousLabel={t('Previous page', 'Página anterior')}
        nextLabel={t('Next page', 'Página siguiente')}
        pageLabelFormat={t('Page {0}', 'Página {0}')}
        summaryFormat={t('{0}–{1} of {2} invoices', '{0}–{1} de {2} facturas')}
      />
    </div>
  );
}
