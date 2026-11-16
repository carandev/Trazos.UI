import { Stepper } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <Stepper
      vertical
      current={2}
      label={t('Payroll run', 'Liquidación de nómina')}
      completedLabel={t('Completed', 'Completado')}
      steps={[
        { title: t('Load novelties', 'Cargar novedades'), description: t('Overtime, absences and bonuses', 'Horas extra, ausencias y bonificaciones') },
        { title: t('Calculate', 'Calcular'), description: t('Earnings and deductions', 'Devengados y deducciones') },
        { title: t('Approve', 'Aprobar'), description: t('Payroll manager', 'Jefe de nómina') },
        { title: t('Pay', 'Pagar'), description: t('Bank file', 'Archivo del banco') },
      ]}
    />
  );
}
