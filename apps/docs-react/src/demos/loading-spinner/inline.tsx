import { LoadingSpinner } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <>
      <LoadingSpinner />
      <LoadingSpinner message={t('Loading events…', 'Cargando eventos…')} />
    </>
  );
}
