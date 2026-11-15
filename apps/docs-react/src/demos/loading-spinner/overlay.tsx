import { useState } from 'react';
import { Button, LoadingSpinner } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [saving, setSaving] = useState(false);

  const showOverlay = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  return (
    <>
      <Button variant="outline" onClick={showOverlay}>
        {t('Show overlay', 'Mostrar superposición')}
      </Button>
      {saving && <LoadingSpinner overlay message={t('Saving…', 'Guardando…')} />}
    </>
  );
}
