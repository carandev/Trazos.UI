import { ProgressBar } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div className="docs-stack">
      <ProgressBar label={t('Vacation used', 'Vacaciones usadas')} value={40} />
      <ProgressBar label={t('Budget used', 'Presupuesto usado')} value={75} tone="gold" />
      <ProgressBar label={t('Overtime limit', 'Límite de horas extra')} value={95} tone="wine" />
      {/* Without a visible label, ariaLabel names the bar for screen readers. */}
      <ProgressBar ariaLabel={t('Upload', 'Carga')} value={60} tone="sky" showValue={false} />
    </div>
  );
}
