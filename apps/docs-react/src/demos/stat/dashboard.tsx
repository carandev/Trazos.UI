import { Stat } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CalendarIcon, UserIcon } from '../../icons';

export default function Demo() {
  return (
    <div className="docs-grid-2">
      <Stat
        label={t('Net payroll', 'Nómina neta')}
        value="$ 148,2M"
        delta="+4,2%"
        trend="up"
        trendLabel={t('up from last month', 'más que el mes pasado')}
        hint={t('November 2026', 'Noviembre 2026')}
        icon={<CalendarIcon />}
      />
      {/* Fewer absences is good news: inverted colors a fall in olive. */}
      <Stat
        label={t('Absences', 'Ausencias')}
        value="12"
        delta="-3"
        trend="down"
        inverted
        trendLabel={t('down from last month', 'menos que el mes pasado')}
        tone="wine"
        icon={<UserIcon />}
      />
      <Stat label={t('Employees', 'Empleados')} value="42" delta="0" trend="flat" trendLabel={t('same as last month', 'igual que el mes pasado')} tone="lavender" icon={<UserIcon />} />
      <Stat label={t('Pending novelties', 'Novedades pendientes')} value="7" hint={t('Due November 25', 'Vencen el 25 de noviembre')} />
    </div>
  );
}
