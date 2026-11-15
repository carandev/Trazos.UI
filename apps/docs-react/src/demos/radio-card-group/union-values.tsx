import { useState } from 'react';
import { RadioCardGroup, type RadioCardOption } from '@carandev/trazos-ui';
import { t } from '../../i18n';

type Frequency = 'once' | 'weekly' | 'monthly';

export default function Demo() {
  const [frequency, setFrequency] = useState<Frequency>('weekly');

  const frequencies: RadioCardOption<Frequency>[] = [
    { value: 'once', title: t('Once', 'Una vez'), description: t('A single date.', 'Una sola fecha.') },
    { value: 'weekly', title: t('Weekly', 'Semanal'), description: t('Same day every week.', 'El mismo día cada semana.') },
    { value: 'monthly', title: t('Monthly', 'Mensual'), description: t('Same day every month.', 'El mismo día cada mes.') },
  ];

  return (
    <div className="docs-stack">
      <RadioCardGroup<Frequency>
        label={t('Frequency', 'Frecuencia')}
        options={frequencies}
        value={frequency}
        onValueChange={setFrequency}
      />
    </div>
  );
}
