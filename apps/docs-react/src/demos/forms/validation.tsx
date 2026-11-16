import { useState, type FormEvent } from 'react';
import { Button, Checkbox, DateInput, NumberInput, SelectInput, TextArea, TextInput, type SelectOption } from '@carandev/trazos-ui';
import { t } from '../../i18n';

type PayFrequency = 'weekly' | 'biweekly' | 'monthly';

interface Employee {
  name: string;
  salary: number | null;
  startDate: string | null;
  frequency: PayFrequency | null;
  notes: string;
  checked: boolean;
}

type Errors = Partial<Record<keyof Employee, string>>;

// One function holds every rule, so the form and the server can share it.
function validate(employee: Employee): Errors {
  const errors: Errors = {};
  if (employee.name.trim() === '') errors.name = t('Enter the full name.', 'Ingresa el nombre completo.');
  if (employee.salary === null || employee.salary < 1) errors.salary = t('Enter the base salary.', 'Ingresa el salario base.');
  if (employee.startDate === null) errors.startDate = t('Enter the start date.', 'Ingresa la fecha de ingreso.');
  if (employee.frequency === null) errors.frequency = t('Choose a pay frequency.', 'Elige una frecuencia de pago.');
  if (employee.notes !== '' && employee.notes.length < 10)
    errors.notes = t('Write at least 10 characters.', 'Escribe al menos 10 caracteres.');
  if (!employee.checked) errors.checked = t('Confirm the data before saving.', 'Confirma los datos antes de guardar.');
  return errors;
}

export default function Demo() {
  const [employee, setEmployee] = useState<Employee>({
    name: '',
    salary: null,
    startDate: null,
    frequency: null,
    notes: '',
    checked: false,
  });
  // Errors show after the first submit, then update on every change.
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const errors = submitted ? validate(employee) : {};

  const set = <K extends keyof Employee>(key: K) => (value: Employee[K]) => {
    setSaved(false);
    setEmployee((current) => ({ ...current, [key]: value }));
  };

  const frequencies: SelectOption<PayFrequency>[] = [
    { value: 'weekly', label: t('Weekly', 'Semanal') },
    { value: 'biweekly', label: t('Biweekly', 'Quincenal') },
    { value: 'monthly', label: t('Monthly', 'Mensual') },
  ];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setSaved(Object.keys(validate(employee)).length === 0);
  };

  return (
    <form className="docs-stack" onSubmit={submit} noValidate>
      <TextInput label={t('Full name', 'Nombre completo')} required value={employee.name} onValueChange={set('name')} error={errors.name} />
      <div className="docs-grid-2">
        <NumberInput
          label={t('Base salary', 'Salario base')}
          required
          mode="currency"
          currency="COP"
          locale="es-CO"
          decimals={0}
          value={employee.salary}
          onValueChange={set('salary')}
          error={errors.salary}
        />
        <DateInput
          label={t('Start date', 'Fecha de ingreso')}
          required
          value={employee.startDate}
          onValueChange={set('startDate')}
          error={errors.startDate}
        />
      </div>
      <SelectInput<PayFrequency>
        label={t('Pay frequency', 'Frecuencia de pago')}
        required
        placeholder={t('Choose', 'Elige')}
        options={frequencies}
        value={employee.frequency}
        onValueChange={set('frequency')}
        error={errors.frequency}
      />
      <TextArea
        label={t('Notes', 'Notas')}
        helperText={t('At least 10 characters.', 'Mínimo 10 caracteres.')}
        value={employee.notes}
        onValueChange={set('notes')}
        error={errors.notes}
      />
      <Checkbox
        label={t('The data was checked against the contract', 'Los datos se revisaron contra el contrato')}
        checked={employee.checked}
        onCheckedChange={set('checked')}
        error={errors.checked}
      />
      <div>
        <Button type="submit">{t('Save', 'Guardar')}</Button>
      </div>
      {saved && (
        <p className="docs-demo-output">
          {t('Saved:', 'Guardado:')} <strong>{employee.name}</strong>
        </p>
      )}
    </form>
  );
}
