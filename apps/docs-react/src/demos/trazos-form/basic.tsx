import { useState } from 'react';
import { Button, TextInput, TrazosForm } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  // Sample-only check: TrazosForm itself validates nothing, it only shows
  // whatever messages you give it through `errors`.
  const submit = () => {
    const next: string[] = [];
    if (name.trim() === '') next.push(t('Enter the full name.', 'Ingresa el nombre completo.'));
    if (email.trim() === '') next.push(t('Enter the email.', 'Ingresa el correo electrónico.'));
    setErrors(next);
    setSaved(next.length === 0);
  };

  return (
    <TrazosForm
      className="docs-stack"
      errors={errors}
      errorSummaryLabel={t('Please fix the following:', 'Corrige lo siguiente:')}
      onSubmit={submit}
    >
      <TextInput label={t('Full name', 'Nombre completo')} value={name} onValueChange={setName} />
      <TextInput label={t('Email', 'Correo electrónico')} type="email" value={email} onValueChange={setEmail} />
      <div>
        <Button type="submit">{t('Save', 'Guardar')}</Button>
      </div>
      {saved && (
        <p className="docs-demo-output">
          {t('Saved:', 'Guardado:')} <strong>{name}</strong>
        </p>
      )}
    </TrazosForm>
  );
}
