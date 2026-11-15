import { Badge, Button, Card, TextInput, ToastProvider, useToast } from '@carandev/trazos-ui';
import { useState } from 'react';
import { t } from '../../i18n';

function KickoffCard() {
  const [name, setName] = useState('');
  const toast = useToast();

  function save() {
    toast.showSuccess(
      name.trim() === '' ? t('Saved without a name.', 'Guardado sin nombre.') : t('Saved, ', 'Guardado, ') + name + '.',
      t('Done', 'Listo'),
    );
  }

  return (
    <Card
      className="docs-taste"
      header={
        <div className="docs-row">
          <h3 className="trazos-heading">{t('Project kickoff', 'Inicio del proyecto')}</h3>
          <Badge variant="success">{t('Open', 'Abierta')}</Badge>
        </div>
      }
      footer={
        <>
          <Button variant="primary" onClick={save}>
            {t('Save', 'Guardar')}
          </Button>
          <Button variant="ghost" onClick={() => setName('')}>
            {t('Clear', 'Limpiar')}
          </Button>
        </>
      }
    >
      <TextInput
        label={t('Your name', 'Tu nombre')}
        placeholder={t('Write your full name…', 'Escribe tu nombre completo…')}
        value={name}
        onValueChange={setName}
      />
    </Card>
  );
}

// The app root usually provides ToastProvider once; AppShell already includes it.
export default function Demo() {
  return (
    <ToastProvider>
      <KickoffCard />
    </ToastProvider>
  );
}
