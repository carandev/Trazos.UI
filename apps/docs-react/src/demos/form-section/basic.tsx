import { useState } from 'react';
import { Checkbox, FormSection, TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState(false);

  return (
    <div className="docs-stack">
      <FormSection
        step={1}
        title={t('About you', 'Sobre ti')}
        description={t('We use this to identify you at the door.', 'Lo usamos para identificarte en la entrada.')}
      >
        <div className="docs-grid-2">
          <TextInput label={t('First name', 'Nombre')} value={first} onValueChange={setFirst} />
          <TextInput label={t('Last name', 'Apellido')} value={last} onValueChange={setLast} />
        </div>
      </FormSection>
      <FormSection
        step={2}
        title={t('Contact', 'Contacto')}
        description={t('Only used for event reminders.', 'Solo se usa para recordatorios de eventos.')}
      >
        <TextInput label={t('Email', 'Correo electrónico')} type="email" value={email} onValueChange={setEmail} />
      </FormSection>
      <FormSection title={t('Without a number', 'Sin número')}>
        <Checkbox
          label={t('Subscribe to the newsletter', 'Suscribirme al boletín')}
          checked={newsletter}
          onCheckedChange={setNewsletter}
        />
      </FormSection>
    </div>
  );
}
