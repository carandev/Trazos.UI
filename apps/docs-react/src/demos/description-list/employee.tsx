import { Badge, CopyButton, DescriptionItem, DescriptionList } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CalendarIcon, HomeIcon, MailIcon, UserIcon } from '../../icons';

export default function Demo() {
  // Each value sits on its own tile; net pay is the one people look for first.
  return (
    <DescriptionList columns={3}>
      <DescriptionItem icon={<UserIcon />} label={t('Full name', 'Nombre completo')} value="Ana María Restrepo" />
      <DescriptionItem label={t('Position', 'Cargo')} value={t('Payroll analyst', 'Analista de nómina')} hint={t('Finance team', 'Equipo de finanzas')} />
      <DescriptionItem label={t('Status', 'Estado')}>
        <Badge variant="success">{t('Active', 'Activo')}</Badge>
      </DescriptionItem>
      <DescriptionItem
        icon={<MailIcon />}
        label={t('Work email', 'Correo laboral')}
        value="ana.restrepo@example.com"
        hint={t('Payslips are sent to this address', 'Los desprendibles se envían a esta dirección')}
        span={2}
        actions={
          <CopyButton
            value="ana.restrepo@example.com"
            label={t('Copy email', 'Copiar correo')}
            copiedLabel={t('Copied!', '¡Copiado!')}
          />
        }
      />
      <DescriptionItem icon={<CalendarIcon />} label={t('Start date', 'Fecha de ingreso')} value="2024-02-01" />
      <DescriptionItem label={t('Base salary', 'Salario base')} value="$ 3.500.000" hint={t('Before deductions', 'Antes de deducciones')} />
      <DescriptionItem label={t('Bank account', 'Cuenta bancaria')} emptyText={t('Not registered', 'Sin registrar')} />
      <DescriptionItem label={t('Net pay', 'Neto a pagar')} value="$ 3.210.000" hint={t('November 2026', 'Noviembre 2026')} highlight />
      <DescriptionItem icon={<HomeIcon />} label={t('Address', 'Dirección')} value="Carrera 7 # 72-41, Bogotá" fullWidth />
    </DescriptionList>
  );
}
