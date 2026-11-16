import { Divider } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div>
      <p>{t('Earnings', 'Devengados')}</p>
      <Divider />
      <Divider label={t('Deductions', 'Deducciones')} />
      <Divider dashed />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>{t('Draft', 'Borrador')}</span>
        <Divider vertical />
        <span>{t('42 employees', '42 empleados')}</span>
        <Divider vertical dashed />
        <span>{t('November 2026', 'Noviembre 2026')}</span>
      </div>
    </div>
  );
}
