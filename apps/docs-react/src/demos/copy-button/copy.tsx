import { CopyButton } from '@carandev/trazos-ui';
import { useState } from 'react';
import { t } from '../../i18n';

export default function Demo() {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div style={{ paddingTop: '2rem' }}>
      <CopyButton
        value="hello@example.com"
        label={t('Copy email', 'Copiar correo')}
        copiedLabel={t('Copied!', '¡Copiado!')}
        errorLabel={t('Could not copy', 'No se pudo copiar')}
        variant="outline"
        onCopied={setCopied}
      />
      <span className="docs-muted" data-testid="copied-value">
        {copied}
      </span>
    </div>
  );
}
