import { Badge, DescriptionItem, DescriptionList } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <DescriptionList columns={3}>
      <DescriptionItem label={t('Document', 'Documento')} value="CC 1.020.304.050" />
      <DescriptionItem label={t('Position', 'Cargo')} value={t('Payroll analyst', 'Analista de nómina')} />
      <DescriptionItem label={t('Status', 'Estado')}>
        <Badge variant="success">{t('Active', 'Activo')}</Badge>
      </DescriptionItem>
      <DescriptionItem label={t('Base salary', 'Salario base')} value="$ 3.500.000" hint={t('Before deductions', 'Antes de deducciones')} />
      <DescriptionItem label={t('Bank account', 'Cuenta bancaria')} emptyText={t('Not registered', 'Sin registrar')} />
      <DescriptionItem label={t('Start date', 'Fecha de ingreso')} value="2024-02-01" />
      <DescriptionItem label={t('Address', 'Dirección')} value="Carrera 7 # 72-41, Bogotá" fullWidth />
    </DescriptionList>
  );
}
