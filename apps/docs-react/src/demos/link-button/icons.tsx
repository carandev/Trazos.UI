import { LinkButton } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { ArrowIcon } from '../../icons';

export default function Demo() {
  return (
    <LinkButton href="components/button" variant="outline" trailingIcon={<ArrowIcon />}>
      {t('Read more', 'Leer más')}
    </LinkButton>
  );
}
