import { AuthLayout, Button, TextInput } from '@carandev/trazos-ui';
import { useState } from 'react';
import { t } from '../../i18n';

export default function Demo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    // Framed for the docs preview: in an app, AuthLayout is the root of the page.
    <div style={{ width: '100%', height: '30rem', overflow: 'auto', transform: 'translateZ(0)' }}>
      <AuthLayout
        brand={<strong>Trazos</strong>}
        title={t('Sign in', 'Iniciar sesión')}
        subtitle={t('Welcome back, please enter your details.', 'Bienvenido de nuevo, ingresa tus datos.')}
        footer={<a href="#forgot-password">{t('Forgot your password?', '¿Olvidaste tu contraseña?')}</a>}
      >
        <div className="docs-stack">
          <TextInput label={t('Email', 'Correo electrónico')} value={email} onValueChange={setEmail} />
          <TextInput label={t('Password', 'Contraseña')} type="password" value={password} onValueChange={setPassword} />
          <Button type="submit">{t('Sign in', 'Iniciar sesión')}</Button>
        </div>
      </AuthLayout>
    </div>
  );
}
