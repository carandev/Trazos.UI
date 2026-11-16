import { useState } from 'react';
import { Alert, Button, Modal } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="wine" onClick={() => setOpen(true)}>
        {t('Delete employee', 'Eliminar empleado')}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        size="small"
        title={t('Delete Ana María Restrepo?', '¿Eliminar a Ana María Restrepo?')}
        closeButtonAriaLabel={t('Close', 'Cerrar')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('Cancel', 'Cancelar')}
            </Button>
            <Button variant="wine" onClick={() => setOpen(false)}>
              {t('Delete', 'Eliminar')}
            </Button>
          </>
        }
      >
        <Alert tone="danger" title={t('This cannot be undone', 'Esta acción no se puede deshacer')}>
          {t('Her payslips and novelties will be deleted too.', 'También se eliminarán sus desprendibles y novedades.')}
        </Alert>
      </Modal>
    </>
  );
}
