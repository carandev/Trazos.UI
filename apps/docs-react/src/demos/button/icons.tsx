import { Button } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { ArrowIcon, PlusIcon } from '../../icons';

export default function Demo() {
  return (
    <>
      <Button variant="primary" leadingIcon={<PlusIcon />}>
        {t('New event', 'Nuevo evento')}
      </Button>
      <Button variant="outline" trailingIcon={<ArrowIcon />}>
        {t('Continue', 'Continuar')}
      </Button>
    </>
  );
}
