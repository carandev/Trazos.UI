import { TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div className="docs-grid-2">
      <TextInput
        label={t('Disabled', 'Deshabilitado')}
        defaultValue={t('Not editable', 'No editable')}
        disabled
      />
      <TextInput
        label={t('Read-only', 'Solo lectura')}
        defaultValue={t('Selectable, not editable', 'Seleccionable, no editable')}
        readOnly
      />
    </div>
  );
}
