import { Breadcrumbs, type BreadcrumbItem } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // The last item is the current page: it is not linked and gets aria-current="page".
  const trail: BreadcrumbItem[] = [
    { text: t('Home', 'Inicio'), href: './' },
    { text: t('Payroll', 'Nómina'), href: 'components/breadcrumbs' },
    { text: t('November 2026', 'Noviembre 2026') },
  ];

  return <Breadcrumbs items={trail} label={t('Breadcrumb', 'Migas de pan')} />;
}
