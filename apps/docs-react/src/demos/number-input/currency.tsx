import { useState } from 'react';
import { NumberInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [salary, setSalary] = useState<number | null>(3500000);
  const [bonus, setBonus] = useState<number | null>(null);

  return (
    <div className="docs-stack">
      <div className="docs-grid-2">
        <NumberInput
          label={t('Base salary', 'Salario base')}
          mode="currency"
          locale="es-CO"
          currency="COP"
          currencySymbol="COP"
          decimals={0}
          min={0}
          value={salary}
          onValueChange={setSalary}
        />
        <NumberInput
          label={t('Bonus (USD)', 'Bonificación (USD)')}
          mode="currency"
          locale="en-US"
          currency="USD"
          value={bonus}
          onValueChange={setBonus}
        />
      </div>
      <p className="docs-demo-output">
        {t('Values:', 'Valores:')} <strong>{JSON.stringify(salary)}</strong> · <strong>{JSON.stringify(bonus)}</strong>
      </p>
    </div>
  );
}
