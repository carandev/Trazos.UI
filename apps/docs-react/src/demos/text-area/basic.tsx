import { useState } from 'react';
import { TextArea } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [text, setText] = useState('');

  return (
    <div className="docs-stack">
      <TextArea
        label={t('Feedback', 'Comentarios')}
        placeholder={t('Tell us what you think…', 'Cuéntanos qué opinas…')}
        rows={4}
        helperText={text.length + t(' / 280 characters', ' / 280 caracteres')}
        error={text.length > 280 ? t('Keep it under 280 characters.', 'Mantenlo por debajo de 280 caracteres.') : undefined}
        value={text}
        onValueChange={setText}
      />
    </div>
  );
}
