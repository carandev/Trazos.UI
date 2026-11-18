import { PageHeader, PageStack } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <PageStack>
      <PageHeader title={t('Employees', 'Empleados')} />
      <p>{t('Section one.', 'Sección uno.')}</p>
      <p>{t('Section two.', 'Sección dos.')}</p>
    </PageStack>
  );
}
