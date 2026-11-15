import { useState } from 'react';
import { Button } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <>
      <Button variant="wine" loading={saving} onClick={save}>
        {saving ? t('Saving…', 'Guardando…') : t('Save changes', 'Guardar cambios')}
      </Button>
      <Button disabled>{t('Disabled', 'Deshabilitado')}</Button>
    </>
  );
}
