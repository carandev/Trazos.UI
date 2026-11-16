import { useState } from 'react';
import { TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [name, setName] = useState('');

  return (
    <div className="docs-stack">
      <TextInput
        label={t('Full name', 'Nombre completo')}
        placeholder="Ana María Restrepo"
        helperText={t('As it appears on your ID.', 'Tal como aparece en tu documento de identidad.')}
        value={name}
        onValueChange={setName}
      />
      <p className="docs-demo-output">
        {t('Value:', 'Valor:')} <strong>{JSON.stringify(name)}</strong>
      </p>
    </div>
  );
}
