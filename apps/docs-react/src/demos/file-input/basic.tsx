import { useState } from 'react';
import { FileInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="docs-stack">
      <FileInput
        label={t('Supporting documents', 'Soportes')}
        multiple
        accept=".pdf,image/*"
        maxFileSize={5 * 1024 * 1024}
        buttonText={t('Choose files', 'Elige archivos')}
        dropText={t('or drag them here', 'o arrástralos aquí')}
        hint={t('PDF or images, up to 5 MB each', 'PDF o imágenes, hasta 5 MB cada uno')}
        removeLabelFormat={t('Remove {0}', 'Quitar {0}')}
        tooLargeMessage={t('{0} is larger than {1}.', '{0} pesa más de {1}.')}
        notAcceptedMessage={t('{0} is not an accepted file type.', '{0} no es un tipo de archivo permitido.')}
        tooManyMessage={t('{0} was not added: the limit is {1} files.', '{0} no se agregó: el límite es de {1} archivos.')}
        value={files}
        onValueChange={setFiles}
      />
      <p className="docs-demo-output">
        {t('Files:', 'Archivos:')} <strong>{files.length}</strong>
      </p>
    </div>
  );
}
