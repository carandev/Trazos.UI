import { useState } from 'react';
import { SelectInput, type SelectOption } from '@carandev/trazos-ui';
import { t } from '../../i18n';

type PayFrequency = 'weekly' | 'biweekly' | 'monthly';

const companies: SelectOption<number>[] = [
  { value: 1, label: 'Acme S.A.S.' },
  { value: 2, label: 'Globex Ltda.' },
  { value: 3, label: 'Initech (inactive)', disabled: true },
];

export default function Demo() {
  const [frequency, setFrequency] = useState<PayFrequency | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const frequencies: SelectOption<PayFrequency>[] = [
    { value: 'weekly', label: t('Weekly', 'Semanal') },
    { value: 'biweekly', label: t('Biweekly', 'Quincenal') },
    { value: 'monthly', label: t('Monthly', 'Mensual') },
  ];

  return (
    <div className="docs-stack">
      <div className="docs-grid-2">
        <SelectInput<PayFrequency>
          label={t('Pay frequency', 'Frecuencia de pago')}
          placeholder={t('Choose', 'Elige')}
          options={frequencies}
          value={frequency}
          onValueChange={setFrequency}
        />
        <SelectInput<number>
          label={t('Company', 'Empresa')}
          placeholder={t('Choose', 'Elige')}
          options={companies}
          value={companyId}
          onValueChange={setCompanyId}
        />
      </div>
      <p className="docs-demo-output">
        {t('Frequency:', 'Frecuencia:')} <strong>{JSON.stringify(frequency)}</strong> · {t('Company id:', 'Id de empresa:')}{' '}
        <strong>{JSON.stringify(companyId)}</strong>
      </p>
    </div>
  );
}
