import { useState } from 'react';
import { TabItem, Tabs } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CalendarIcon, UserIcon } from '../../icons';

export default function Demo() {
  const [activeKey, setActiveKey] = useState('members');

  return (
    <div className="docs-stack">
      <Tabs activeKey={activeKey} onActiveKeyChange={setActiveKey}>
        <TabItem tabKey="calendar" title={t('Calendar', 'Calendario')} icon={<CalendarIcon />}>
          <p>{t('Calendar view.', 'Vista de calendario.')}</p>
        </TabItem>
        <TabItem tabKey="members" title={t('Members', 'Miembros')} icon={<UserIcon />}>
          <p>{t('Members view.', 'Vista de miembros.')}</p>
        </TabItem>
      </Tabs>
      <p className="docs-demo-output">
        activeKey: <strong>{activeKey}</strong>
      </p>
    </div>
  );
}
