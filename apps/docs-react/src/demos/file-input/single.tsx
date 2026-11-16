import { useState, type FormEvent } from 'react';
import { Button, FileInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const contract = files[0];
    if (contract === undefined) return;
    // Read or upload the file here, for example with FormData and fetch.
    setSent(contract.name);
  };

  return (
    <form className="docs-stack" onSubmit={submit} noValidate>
      <FileInput
        label={t('Signed contract', 'Contrato firmado')}
        required
        accept=".pdf"
        maxFileSize={2 * 1024 * 1024}
        hint={t('One PDF, up to 2 MB', 'Un PDF, hasta 2 MB')}
        error={submitted && files.length === 0 ? t('Attach the signed contract.', 'Adjunta el contrato firmado.') : undefined}
        value={files}
        onValueChange={setFiles}
      />
      <div>
        <Button type="submit">{t('Send', 'Enviar')}</Button>
      </div>
      {sent && (
        <p className="docs-demo-output">
          {t('Sent:', 'Enviado:')} <strong>{sent}</strong>
        </p>
      )}
    </form>
  );
}
