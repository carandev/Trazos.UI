import { Badge, TabItem, Tabs } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div className="docs-stack">
      <Tabs variant="pills">
        <TabItem title={t('Overview', 'Resumen')}>
          <p>{t('General information about the event.', 'Información general del evento.')}</p>
        </TabItem>
        <TabItem title={t('Attendees', 'Asistentes')} badge={<Badge variant="lavender">24</Badge>}>
          <p>{t('Twenty-four people signed up.', 'Se inscribieron veinticuatro personas.')}</p>
        </TabItem>
        <TabItem title={t('Archived', 'Archivado')} disabled>
          <p>{t('Unavailable.', 'No disponible.')}</p>
        </TabItem>
      </Tabs>
    </div>
  );
}
