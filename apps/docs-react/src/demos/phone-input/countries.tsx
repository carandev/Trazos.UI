import { useState } from 'react';
import { PhoneInput, type PhoneCountry } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [phone, setPhone] = useState<string | null>(null);

  // Your own list, translated and in the order your users expect.
  const countries: PhoneCountry[] = [
    { dialCode: '+57', name: 'Colombia' },
    { dialCode: '+1', name: t('United States', 'Estados Unidos') },
    { dialCode: '+34', name: t('Spain', 'España') },
  ];

  return (
    <div className="docs-stack">
      <PhoneInput
        label={t('Phone', 'Teléfono')}
        countries={countries}
        defaultDialCode="+34"
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
