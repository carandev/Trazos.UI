import { Button, EmptyState } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CalendarIcon, PlusIcon } from '../../icons';

export default function Demo() {
  return (
    <EmptyState
      title={t('No events yet', 'Aún no hay eventos')}
      description={t('Create the first event of the month so your community can sign up.', 'Crea el primer evento del mes para que tu comunidad pueda inscribirse.')}
      icon={<CalendarIcon />}
      actions={<Button leadingIcon={<PlusIcon />}>{t('Create event', 'Crear evento')}</Button>}
    />
  );
}
