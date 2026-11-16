import { SelectInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div className="docs-grid-2">
      <SelectInput
        label={t('Shift', 'Turno')}
        placeholder={t('Pick a shift', 'Elige un turno')}
        error={t('Choose a shift to continue.', 'Elige un turno para continuar.')}
      >
        <option value="am">{t('Morning', 'Mañana')}</option>
        <option value="pm">{t('Afternoon', 'Tarde')}</option>
      </SelectInput>
      <SelectInput label={t('Disabled', 'Deshabilitado')} placeholder={t('Unavailable', 'No disponible')} disabled />
    </div>
  );
}
