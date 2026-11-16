import { useState } from 'react';
import { Button, Stepper, type StepperStep } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [step, setStep] = useState(1);
  const steps: StepperStep[] = [
    { title: t('Personal data', 'Datos personales') },
    { title: t('Contract', 'Contrato'), description: t('Type and dates', 'Tipo y fechas') },
    { title: t('Payment', 'Pago'), description: t('Bank and frequency', 'Banco y frecuencia') },
    { title: t('Review', 'Revisión') },
  ];

  return (
    <div className="docs-stack">
      <Stepper steps={steps} current={step} label={t('New employee', 'Nuevo empleado')} completedLabel={t('Completed', 'Completado')} />
      <div>
        <Button variant="outline" size="small" onClick={() => setStep((s) => (s >= 3 ? 0 : s + 1))}>
          {t('Next step', 'Siguiente paso')}
        </Button>
      </div>
    </div>
  );
}
