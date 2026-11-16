import { DescriptionItem, DescriptionList } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <DescriptionList columns={4}>
      <DescriptionItem label={t('Earnings', 'Devengados')} value="$ 3.850.000" tone="olive" />
      <DescriptionItem label={t('Deductions', 'Deducciones')} value="$ 640.000" tone="wine" />
      <DescriptionItem label={t('Pending approval', 'Pendiente de aprobación')} value="$ 120.000" tone="gold" />
      <DescriptionItem label={t('Vacation days', 'Días de vacaciones')} value="12" tone="sky" />
    </DescriptionList>
  );
}
