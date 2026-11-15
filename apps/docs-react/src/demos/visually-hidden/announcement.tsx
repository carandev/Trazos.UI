import { VisuallyHidden } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <span>
      {t('Saved', 'Guardado')}
      <VisuallyHidden role="status" aria-live="polite">
        {t('Your changes were saved', 'Tus cambios se guardaron')}
      </VisuallyHidden>
    </span>
  );
}
