import { PageHeader } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <PageHeader
      title={t('New employee', 'Nuevo empleado')}
      subtitle={t('Fields marked with * are required.', 'Los campos con * son obligatorios.')}
      level={2}
      backHref="components/page-header"
      backLabel={t('Employees', 'Empleados')}
    />
  );
}
