import { useState } from 'react';
import { DateInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // Values are ISO date strings: 'yyyy-MM-dd'.
  const [start, setStart] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>('2026-11-01');

  return (
    <div className="docs-stack">
      <div className="docs-grid-2">
        <DateInput label={t('Start date', 'Fecha de ingreso')} min="2020-01-01" value={start} onValueChange={setStart} />
        <DateInput label={t('Payroll period', 'Periodo de nómina')} monthOnly value={period} onValueChange={setPeriod} />
      </div>
      <p className="docs-demo-output">
        {t('Values:', 'Valores:')} <strong>{JSON.stringify(start)}</strong> · <strong>{JSON.stringify(period)}</strong>
      </p>
    </div>
  );
}
