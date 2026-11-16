import { useState } from 'react';
import { Alert, Button } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // The alert hides itself; the key remounts it so it can be shown again.
  const [visible, setVisible] = useState(true);
  const [round, setRound] = useState(0);

  if (!visible) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          setRound((r) => r + 1);
          setVisible(true);
        }}
      >
        {t('Show again', 'Mostrar de nuevo')}
      </Button>
    );
  }

  return (
    <Alert
      key={round}
      tone="warning"
      title={t('This will cancel the payroll run', 'Esto anulará la liquidación')}
      dismissible
      dismissLabel={t('Dismiss', 'Cerrar')}
      onDismiss={() => setVisible(false)}
      actions={
        <>
          <Button variant="wine" size="small">
            {t('Cancel run', 'Anular liquidación')}
          </Button>
          <Button variant="ghost" size="small">
            {t('Review first', 'Revisar primero')}
          </Button>
        </>
      }
    >
      {t('Payslips already sent will not be recalled.', 'Los desprendibles ya enviados no se recuperan.')}
    </Alert>
  );
}
