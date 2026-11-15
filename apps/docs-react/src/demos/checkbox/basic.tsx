import { useState } from 'react';
import { Checkbox } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [reminders, setReminders] = useState(true);
  const [terms, setTerms] = useState(false);

  return (
    <div className="docs-stack">
      <Checkbox
        label={t('Send me reminders before each event', 'Envíame recordatorios antes de cada evento')}
        checked={reminders}
        onCheckedChange={setReminders}
      />
      <Checkbox
        checked={terms}
        onCheckedChange={setTerms}
        error={terms ? undefined : t('You must accept to continue.', 'Debes aceptar para continuar.')}
      >
        {t('I accept the', 'Acepto las')} <a href="installation">{t('community guidelines', 'normas de la comunidad')}</a>
      </Checkbox>
      <Checkbox label={t('Disabled option', 'Opción deshabilitada')} disabled defaultChecked />
      <p className="docs-demo-output">
        {t('Reminders:', 'Recordatorios:')} <strong>{String(reminders)}</strong> · {t('Terms:', 'Términos:')}{' '}
        <strong>{String(terms)}</strong>
      </p>
    </div>
  );
}
