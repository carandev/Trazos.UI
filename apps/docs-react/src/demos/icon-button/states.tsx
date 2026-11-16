import { IconButton } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { PlusIcon } from '../../icons';

export default function Demo() {
  return (
    <>
      <IconButton label={t('Add', 'Agregar')} variant="outline">
        <PlusIcon />
      </IconButton>
      <IconButton label={t('Add', 'Agregar')} variant="outline" size="large">
        <PlusIcon />
      </IconButton>
      <IconButton label={t('Saving', 'Guardando')} variant="outline" loading>
        <PlusIcon />
      </IconButton>
      <IconButton label={t('Add', 'Agregar')} variant="outline" disabled>
        <PlusIcon />
      </IconButton>
    </>
  );
}
