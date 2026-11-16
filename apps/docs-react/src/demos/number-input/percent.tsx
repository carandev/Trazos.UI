import { useState } from 'react';
import { NumberInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // Percent mode binds the fraction: 0.04 reads 4 %.
  const [pension, setPension] = useState<number | null>(0.04);
  const [hours, setHours] = useState<number | null>(6);

  return (
    <div className="docs-stack">
      <div className="docs-grid-2">
        <NumberInput
          label={t('Pension contribution', 'Aporte a pensión')}
          mode="percent"
          decimals={1}
          min={0}
          max={1}
          step={0.5}
          value={pension}
          onValueChange={setPension}
        />
        <NumberInput
          label={t('Overtime hours', 'Horas extra')}
          decimals={0}
          min={0}
          max={48}
          suffix="h"
          helperText={t('Between 0 and 48.', 'Entre 0 y 48.')}
          value={hours}
          onValueChange={setHours}
        />
      </div>
      <p className="docs-demo-output">
        {t('Values:', 'Valores:')} <strong>{JSON.stringify(pension)}</strong> · <strong>{JSON.stringify(hours)}</strong>
      </p>
    </div>
  );
}
