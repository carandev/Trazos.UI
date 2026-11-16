import { Button, PageHeader, TabItem, Tabs } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // children render below the header row, which is the place for page tabs.
  return (
    <PageHeader
      title={t('Payroll · November 2026', 'Nómina · Noviembre 2026')}
      level={2}
      actions={<Button>{t('Approve', 'Aprobar')}</Button>}
    >
      <Tabs variant="underline">
        <TabItem title={t('Summary', 'Resumen')}>
          <p>{t('Totals of the period.', 'Totales del periodo.')}</p>
        </TabItem>
        <TabItem title={t('Employees', 'Empleados')}>
          <p>{t('One row per employee.', 'Una fila por empleado.')}</p>
        </TabItem>
      </Tabs>
    </PageHeader>
  );
}
