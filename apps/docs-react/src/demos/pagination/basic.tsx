import { useState } from 'react';
import { Pagination } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [page, setPage] = useState(7);
  const [pageSize, setPageSize] = useState(10);

  return (
    <div className="docs-stack">
      <Pagination
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalCount={248}
        pageSizeOptions={[10, 25, 50]}
        label={t('Pagination', 'Paginación')}
        previousLabel={t('Previous page', 'Página anterior')}
        nextLabel={t('Next page', 'Página siguiente')}
        pageLabelFormat={t('Page {0}', 'Página {0}')}
        pageSizeLabel={t('Rows per page', 'Filas por página')}
        summaryFormat={t('{0}–{1} of {2}', '{0}–{1} de {2}')}
      />
      <p className="docs-demo-output">
        {t('Page:', 'Página:')} <strong>{page}</strong> · {t('Size:', 'Tamaño:')} <strong>{pageSize}</strong>
      </p>
    </div>
  );
}
