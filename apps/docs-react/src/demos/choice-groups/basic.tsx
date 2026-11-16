import { useState } from 'react';
import { CheckboxGroup, RadioGroup, type ChoiceOption } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [contract, setContract] = useState<string | null>(null);
  const [benefits, setBenefits] = useState<number[]>([2]);
  const [shift, setShift] = useState(1);

  const contracts: ChoiceOption<string>[] = [
    { value: 'fixed', label: t('Fixed term', 'Término fijo') },
    { value: 'open', label: t('Open ended', 'Término indefinido') },
    { value: 'service', label: t('Service contract', 'Prestación de servicios') },
  ];

  const benefitOptions: ChoiceOption<number>[] = [
    { value: 1, label: t('Food allowance', 'Auxilio de alimentación') },
    { value: 2, label: t('Transport allowance', 'Auxilio de transporte') },
    { value: 3, label: t('Gym', 'Gimnasio'), disabled: true },
  ];

  const shifts: ChoiceOption<number>[] = [
    { value: 1, label: t('Morning', 'Mañana') },
    { value: 2, label: t('Afternoon', 'Tarde') },
    { value: 3, label: t('Night', 'Noche') },
  ];

  return (
    <div className="docs-stack">
      <div className="docs-grid-2">
        <RadioGroup label={t('Contract type', 'Tipo de contrato')} options={contracts} value={contract} onValueChange={setContract} />
        <CheckboxGroup label={t('Benefits', 'Beneficios')} options={benefitOptions} value={benefits} onValueChange={setBenefits} />
      </div>
      <RadioGroup label={t('Shift', 'Turno')} inline options={shifts} value={shift} onValueChange={setShift} />
      <p className="docs-demo-output">
        {t('Values:', 'Valores:')} <strong>{contract ?? 'null'}</strong> · <strong>[{benefits.join(', ')}]</strong> ·{' '}
        <strong>{shift}</strong>
      </p>
    </div>
  );
}
