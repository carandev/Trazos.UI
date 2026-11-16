import { Button, Card, DescriptionItem, DescriptionList, PageHeader } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // A typical detail page: PageHeader on top, one Card per group of fields.
  return (
    <div>
      <PageHeader
        title="Ana María Restrepo"
        level={3}
        backHref="components/description-list"
        backLabel={t('Employees', 'Empleados')}
        actions={<Button variant="outline">{t('Edit', 'Editar')}</Button>}
      />
      <Card header={<h4 className="trazos-heading">{t('Contract', 'Contrato')}</h4>}>
        <DescriptionList columns={2}>
          <DescriptionItem label={t('Type', 'Tipo')} value={t('Open-ended', 'Indefinido')} />
          <DescriptionItem label={t('Start date', 'Fecha de ingreso')} value="2024-02-01" />
          <DescriptionItem label={t('End date', 'Fecha de retiro')} emptyText={t('No end date', 'Sin fecha de retiro')} />
          <DescriptionItem label={t('Schedule', 'Jornada')} value={t('Full time', 'Tiempo completo')} />
        </DescriptionList>
      </Card>
    </div>
  );
}
