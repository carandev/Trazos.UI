import { SelectInput, type SelectOption } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const shifts: SelectOption[] = [
    { value: 'am', label: t('Morning', 'Mañana') },
    { value: 'pm', label: t('Afternoon', 'Tarde') },
  ];

  return (
    <div className="docs-grid-2">
      <SelectInput
        label={t('Shift', 'Turno')}
        placeholder={t('Pick a shift', 'Elige un turno')}
        options={shifts}
        error={t('Choose a shift to continue.', 'Elige un turno para continuar.')}
      />
      <SelectInput
        label={t('Disabled', 'Deshabilitado')}
        placeholder={t('Unavailable', 'No disponible')}
        options={shifts}
        disabled
      />
    </div>
  );
}
