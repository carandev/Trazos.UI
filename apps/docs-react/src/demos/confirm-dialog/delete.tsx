import { useState } from 'react';
import { Button, ConfirmDialogProvider, useConfirm } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { TrashIcon } from '../../icons';

// useConfirm() needs a ConfirmDialogProvider above this component (AppShell includes one).
function DeleteEvent() {
  const confirm = useConfirm();
  const [answer, setAnswer] = useState<'none' | 'confirmed' | 'cancelled'>('none');

  const remove = async () => {
    const confirmed = await confirm({
      message: t('This removes the event and its sign-ups. It cannot be undone.', 'Esto elimina el evento y sus inscripciones. No se puede deshacer.'),
      title: t('Delete event?', '¿Eliminar evento?'),
      confirmText: t('Delete', 'Eliminar'),
      cancelText: t('Keep it', 'Conservarlo'),
      confirmVariant: 'wine',
    });
    setAnswer(confirmed ? 'confirmed' : 'cancelled');
  };

  const labels = {
    none: t('none', 'ninguna'),
    confirmed: t('confirmed', 'confirmado'),
    cancelled: t('cancelled', 'cancelado'),
  };

  return (
    <div className="docs-stack">
      <div className="docs-row">
        <Button variant="wine" leadingIcon={<TrashIcon />} onClick={() => void remove()}>
          {t('Delete event', 'Eliminar evento')}
        </Button>
      </div>
      <p className="docs-demo-output">
        {t('Last answer:', 'Última respuesta:')} <strong>{labels[answer]}</strong>
      </p>
    </div>
  );
}

export default function Demo() {
  return (
    <ConfirmDialogProvider>
      <DeleteEvent />
    </ConfirmDialogProvider>
  );
}
