import { Alert } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div className="docs-stack">
      <Alert title={t('Payroll period open', 'Periodo de nómina abierto')}>
        {t('You can add novelties until November 25.', 'Puedes registrar novedades hasta el 25 de noviembre.')}
      </Alert>
      <Alert tone="success" title={t('Payroll approved', 'Nómina aprobada')}>
        {t('42 payslips were generated.', 'Se generaron 42 desprendibles.')}
      </Alert>
      <Alert tone="warning" title={t('3 employees without a bank account', '3 empleados sin cuenta bancaria')}>
        {t('Their payment will be left pending.', 'Su pago quedará pendiente.')}
      </Alert>
      <Alert tone="danger" title={t('The calculation failed', 'El cálculo falló')}>
        {t('Check the salary of the employees marked in red.', 'Revisa el salario de los empleados marcados en rojo.')}
      </Alert>
    </div>
  );
}
