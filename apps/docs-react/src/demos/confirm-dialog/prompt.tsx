import { useState } from 'react';
import { Button, ConfirmDialogProvider, usePrompt } from '@carandev/trazos-ui';
import { t } from '../../i18n';

// usePrompt() shares the ConfirmDialogProvider of useConfirm() (AppShell includes one).
function PayrollReview() {
  const prompt = usePrompt();
  const [result, setResult] = useState('—');

  const reject = async () => {
    const answer = await prompt({
      message: t('The payroll goes back to draft and the analyst is notified.', 'La nómina vuelve a borrador y se notifica al analista.'),
      title: t('Reject payroll', 'Rechazar nómina'),
      inputLabel: t('Reason', 'Motivo'),
      confirmText: t('Reject', 'Rechazar'),
      cancelText: t('Cancel', 'Cancelar'),
      confirmVariant: 'wine',
      minLength: 10,
      requiredMessage: t('Write the reason.', 'Escribe el motivo.'),
      minLengthMessage: t('Write at least {0} characters.', 'Escribe al menos {0} caracteres.'),
    });
    // Required text: when confirmed, answer.text is the trimmed reason.
    setResult(answer.confirmed ? (answer.text ?? '') : t('cancelled', 'cancelado'));
  };

  const approve = async () => {
    const answer = await prompt({
      message: t('The payroll is sent to the bank.', 'La nómina se envía al banco.'),
      title: t('Approve payroll', 'Aprobar nómina'),
      inputLabel: t('Comment (optional)', 'Comentario (opcional)'),
      placeholder: t('Anything the analyst should know', 'Algo que el analista deba saber'),
      confirmText: t('Approve', 'Aprobar'),
      cancelText: t('Cancel', 'Cancelar'),
      required: false,
      maxLength: 200,
    });
    if (!answer.confirmed) {
      setResult(t('cancelled', 'cancelado'));
      return;
    }
    // Optional text: an empty comment comes back as null.
    setResult(answer.text ?? t('approved without comment', 'aprobada sin comentario'));
  };

  return (
    <div className="docs-stack">
      <div className="docs-row">
        <Button variant="wine" onClick={() => void reject()}>
          {t('Reject payroll', 'Rechazar nómina')}
        </Button>
        <Button variant="primary" onClick={() => void approve()}>
          {t('Approve payroll', 'Aprobar nómina')}
        </Button>
      </div>
      <p className="docs-demo-output">
        {t('Result:', 'Resultado:')} <strong>{result}</strong>
      </p>
    </div>
  );
}

export default function Demo() {
  return (
    <ConfirmDialogProvider>
      <PayrollReview />
    </ConfirmDialogProvider>
  );
}
