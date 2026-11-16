import { Badge, Button, PageHeader, type BreadcrumbItem } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const trail: BreadcrumbItem[] = [
    { text: t('Home', 'Inicio'), href: './' },
    { text: t('Employees', 'Empleados'), href: 'components/page-header' },
    { text: 'Ana María Restrepo' },
  ];

  return (
    <PageHeader
      title="Ana María Restrepo"
      subtitle={t('Payroll analyst · Bogotá', 'Analista de nómina · Bogotá')}
      level={2}
      breadcrumbs={trail}
      breadcrumbsLabel={t('Breadcrumb', 'Migas de pan')}
      meta={
        <>
          <Badge variant="success">{t('Active', 'Activa')}</Badge>
          <Badge variant="info">{t('Open-ended contract', 'Contrato indefinido')}</Badge>
        </>
      }
      actions={
        <>
          <Button variant="outline">{t('Edit', 'Editar')}</Button>
          <Button>{t('New novelty', 'Nueva novedad')}</Button>
        </>
      }
    />
  );
}
