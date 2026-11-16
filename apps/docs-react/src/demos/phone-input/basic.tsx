import { useState } from 'react';
import { PhoneInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [phone, setPhone] = useState<string | null>('+57 3001234567');

  return (
    <div className="docs-stack">
      <PhoneInput
        label={t('Mobile phone', 'Celular')}
        placeholder="300 123 4567"
        countryLabel={t('Country code', 'Indicativo')}
        value={phone}
        onValueChange={setPhone}
      />
      <p className="docs-demo-output">
        {t('Value:', 'Valor:')} <strong>{JSON.stringify(phone)}</strong>
      </p>
    </div>
  );
}
