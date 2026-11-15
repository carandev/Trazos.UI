import { useState } from 'react';
import { Button, Modal, TextArea, TextInput, ToastProvider, useToast, type ModalSize } from '@carandev/trazos-ui';
import { t } from '../../i18n';

// The toast after saving needs a ToastProvider above this component (AppShell includes one).
function EditEvent() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<ModalSize>('medium');
  const [name, setName] = useState(t('Team meeting', 'Reunión de equipo'));
  const [description, setDescription] = useState('');

  const sizes: [ModalSize, string][] = [
    ['small', t('small', 'pequeño')],
    ['medium', t('medium', 'mediano')],
    ['large', t('large', 'grande')],
  ];

  const save = () => {
    setOpen(false);
    toast.showSuccess(t('The event was updated.', 'El evento se actualizó.'), t('Saved', 'Guardado'));
  };

  return (
    <>
      {sizes.map(([value, label]) => (
        <Button
          key={value}
          variant="outline"
          onClick={() => {
            setSize(value);
            setOpen(true);
          }}
        >
          {t('Open', 'Abrir')} {label}
        </Button>
      ))}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={t('Edit event', 'Editar evento')}
        size={size}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('Cancel', 'Cancelar')}
            </Button>
            <Button onClick={save}>{t('Save', 'Guardar')}</Button>
          </>
        }
      >
        <div className="docs-stack">
          <TextInput label={t('Name', 'Nombre')} value={name} onValueChange={setName} />
          <TextArea
            label={t('Description', 'Descripción')}
            rows={3}
            value={description}
            onValueChange={setDescription}
          />
        </div>
      </Modal>
    </>
  );
}

export default function Demo() {
  return (
    <ToastProvider>
      <EditEvent />
    </ToastProvider>
  );
}
