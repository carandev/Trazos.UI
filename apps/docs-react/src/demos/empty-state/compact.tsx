import { EmptyState } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { InboxIcon } from '../../icons';

export default function Demo() {
  return (
    <EmptyState
      compact
      iconVariant="lavender"
      title={t('Inbox is clear', 'La bandeja está vacía')}
      description={t('New messages will appear here.', 'Los mensajes nuevos aparecerán aquí.')}
      icon={<InboxIcon />}
    />
  );
}
