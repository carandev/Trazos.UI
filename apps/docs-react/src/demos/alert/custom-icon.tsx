import { Alert } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CalendarIcon } from '../../icons';

export default function Demo() {
  return (
    <Alert icon={<CalendarIcon />} title={t('Closing date', 'Fecha de cierre')}>
      <p>{t('Payroll closes on November 25 at 6:00 pm.', 'La nómina cierra el 25 de noviembre a las 6:00 p. m.')}</p>
      <p>{t('Novelties added later go to the next period.', 'Las novedades registradas después pasan al siguiente periodo.')}</p>
    </Alert>
  );
}
