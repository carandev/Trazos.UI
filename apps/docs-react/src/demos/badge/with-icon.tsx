import { Badge } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CalendarIcon, CheckIcon } from '../../icons';

export default function Demo() {
  return (
    <>
      <Badge variant="success" leadingIcon={<CheckIcon />}>
        {t('Confirmed', 'Confirmado')}
      </Badge>
      <Badge variant="lavender" leadingIcon={<CalendarIcon />}>
        {t('Weekly', 'Semanal')}
      </Badge>
    </>
  );
}
