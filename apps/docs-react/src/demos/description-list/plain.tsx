import { DescriptionItem, DescriptionList } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // Dense data reads better as a plain grid with dividers than as many tiles.
  return (
    <DescriptionList variant="plain" columns={3} bordered>
      <DescriptionItem label={t('Earnings', 'Devengados')} value="$ 3.850.000" />
      <DescriptionItem label={t('Deductions', 'Deducciones')} value="$ 640.000" />
      <DescriptionItem label={t('Health', 'Salud')} value="$ 140.000" hint="4%" />
      <DescriptionItem label={t('Pension', 'Pensión')} value="$ 140.000" hint="4%" />
      <DescriptionItem label={t('Solidarity fund', 'Fondo de solidaridad')} value="$ 35.000" hint="1%" />
      <DescriptionItem label={t('Withholding tax', 'Retención en la fuente')} />
      <DescriptionItem label={t('Overtime', 'Horas extra')} value="$ 210.000" />
      <DescriptionItem label={t('Transport allowance', 'Auxilio de transporte')} value="$ 140.000" />
      <DescriptionItem label={t('Net pay', 'Neto a pagar')} value="$ 3.210.000" highlight />
    </DescriptionList>
  );
}
