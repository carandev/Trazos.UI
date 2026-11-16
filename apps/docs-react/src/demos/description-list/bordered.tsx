import { DescriptionItem, DescriptionList } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <DescriptionList columns={2} bordered>
      <DescriptionItem label={t('Earnings', 'Devengados')} value="$ 3.850.000" />
      <DescriptionItem label={t('Deductions', 'Deducciones')} value="$ 640.000" />
      <DescriptionItem label={t('Health', 'Salud')} value="$ 140.000" hint="4%" />
      <DescriptionItem label={t('Pension', 'Pensión')} value="$ 140.000" hint="4%" />
      <DescriptionItem label={t('Phone', 'Teléfono')} />
      <DescriptionItem label={t('Net pay', 'Neto a pagar')} value="$ 3.210.000" />
    </DescriptionList>
  );
}
