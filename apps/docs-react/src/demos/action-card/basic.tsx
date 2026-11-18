import { ActionCard } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CalendarIcon, LayersIcon, UserIcon } from '../../icons';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
      <ActionCard
        href="/employees/new"
        title={t('New employee', 'Nuevo empleado')}
        description={t('Add someone to the roster.', 'Agrega a alguien a la plantilla.')}
        icon={<UserIcon />}
      />
      <ActionCard
        href="/payroll/run"
        title={t('Run payroll', 'Procesar nómina')}
        description={t("Process this month's payroll.", 'Procesa la nómina de este mes.')}
        icon={<CalendarIcon />}
        iconVariant="lavender"
      />
      <ActionCard
        href="/reports"
        title={t('View reports', 'Ver reportes')}
        description={t('See attendance and payroll reports.', 'Consulta reportes de asistencia y nómina.')}
        icon={<LayersIcon />}
        iconVariant="cream"
      />
    </div>
  );
}
