import { useState } from 'react';
import { Button, ProgressBar } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [done, setDone] = useState(3);

  return (
    <div className="docs-stack">
      <ProgressBar
        label={t('Calculating payroll', 'Calculando nómina')}
        value={done}
        max={7}
        valueText={`${done} ${t('of 7 employees', 'de 7 empleados')}`}
      />
      <ProgressBar label={t('Sending payslips', 'Enviando desprendibles')} indeterminate tone="sky" />
      <div>
        <Button variant="outline" size="small" onClick={() => setDone((d) => (d >= 7 ? 0 : d + 1))}>
          {t('Advance', 'Avanzar')}
        </Button>
      </div>
    </div>
  );
}
