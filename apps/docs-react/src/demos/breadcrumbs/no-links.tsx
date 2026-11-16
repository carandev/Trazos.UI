import { Breadcrumbs } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // An item without href renders as plain text, for levels that have no page of their own.
  return (
    <Breadcrumbs
      label={t('Breadcrumb', 'Migas de pan')}
      items={[
        { text: t('Settings', 'Configuración') },
        { text: t('Company', 'Empresa'), href: 'components/breadcrumbs' },
        { text: t('Cost centers', 'Centros de costo') },
      ]}
    />
  );
}
