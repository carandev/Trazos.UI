import { Button, ToastProvider, useToast } from '@carandev/trazos-ui';
import { t } from '../../i18n';

// useToast() needs a ToastProvider above this component (AppShell includes one).
function Notify() {
  const toast = useToast();

  return (
    <>
      <Button
        variant="primary"
        onClick={() => toast.showSuccess(t('Your sign-up was saved.', 'Tu inscripción se guardó.'), t('Done', 'Listo'))}
      >
        {t('Success', 'Éxito')}
      </Button>
      <Button
        variant="wine"
        onClick={() => toast.showError(t('We could not reach the server.', 'No pudimos conectar con el servidor.'), t('Error', 'Error'))}
      >
        {t('Error', 'Error')}
      </Button>
      <Button variant="cream" onClick={() => toast.showWarning(t('Only two seats left.', 'Solo quedan dos lugares.'))}>
        {t('Warning', 'Advertencia')}
      </Button>
      <Button
        variant="lavender"
        onClick={() => toast.showInfo(t('The meeting starts at 9:00 am.', 'La reunión comienza a las 9:00 a. m.'))}
      >
        {t('Info', 'Información')}
      </Button>
    </>
  );
}

export default function Demo() {
  return (
    <ToastProvider>
      <Notify />
    </ToastProvider>
  );
}
