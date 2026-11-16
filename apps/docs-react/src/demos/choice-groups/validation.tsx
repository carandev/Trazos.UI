import { useState, type FormEvent } from 'react';
import { Button, CheckboxGroup, RadioGroup, type ChoiceOption } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [shift, setShift] = useState<string | null>(null);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const shifts: ChoiceOption<string>[] = [
    { value: 'am', label: t('Morning', 'Mañana') },
    { value: 'pm', label: t('Afternoon', 'Tarde') },
  ];

  const benefitOptions: ChoiceOption<string>[] = [
    { value: 'food', label: t('Food allowance', 'Auxilio de alimentación') },
    { value: 'transport', label: t('Transport allowance', 'Auxilio de transporte') },
  ];

  // Errors appear only after the first submit, then follow every change.
  const shiftError = submitted && shift === null ? t('Choose a shift.', 'Elige un turno.') : undefined;
  const benefitsError =
    submitted && benefits.length === 0 ? t('Choose at least one benefit.', 'Elige al menos un beneficio.') : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setSaved(shift !== null && benefits.length > 0);
  };

  return (
    <form className="docs-stack" onSubmit={submit} noValidate>
      <RadioGroup
        label={t('Shift', 'Turno')}
        required
        inline
        helperText={t('You can change it every month.', 'Puedes cambiarlo cada mes.')}
        options={shifts}
        value={shift}
        onValueChange={setShift}
        error={shiftError}
      />
      <CheckboxGroup
        label={t('Benefits', 'Beneficios')}
        required
        options={benefitOptions}
        value={benefits}
        onValueChange={setBenefits}
        error={benefitsError}
      />
      <div>
        <Button type="submit">{t('Save', 'Guardar')}</Button>
      </div>
      {saved && <p className="docs-demo-output">{t('Saved.', 'Guardado.')}</p>}
    </form>
  );
}
