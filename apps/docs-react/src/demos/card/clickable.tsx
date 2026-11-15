import { useState } from 'react';
import { Card } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [clicks, setClicks] = useState(0);

  return (
    <Card variant="interactive" onClick={() => setClicks((c) => c + 1)}>
      <h3 className="trazos-heading">{t('Click me', 'Haz clic aquí')}</h3>
      <p className="docs-muted">
        {t('Clicked', 'Clics:')} {clicks}
        {t(' time(s).', '.')}
      </p>
    </Card>
  );
}
