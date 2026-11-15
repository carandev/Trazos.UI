import { useState } from 'react';
import { TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { MailIcon } from '../../icons';

export default function Demo() {
  const [email, setEmail] = useState('not-an-email');
  const emailError =
    email === '' || email.includes('@')
      ? undefined
      : t('Enter a valid email address.', 'Ingresa un correo electrónico válido.');

  return (
    <div className="docs-stack">
      <TextInput
        label={t('Email', 'Correo electrónico')}
        type="email"
        required
        placeholder={t('name@example.com', 'nombre@ejemplo.com')}
        leadingIcon={<MailIcon />}
        value={email}
        onValueChange={setEmail}
        error={emailError}
      />
    </div>
  );
}
