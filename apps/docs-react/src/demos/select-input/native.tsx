import { useState } from 'react';
import { SelectInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [country, setCountry] = useState('');

  // <option> children keep the native select: phones open their own picker.
  return (
    <div className="docs-stack">
      <SelectInput
        label={t('Country', 'País')}
        placeholder={t('Choose a country', 'Elige un país')}
        value={country}
        onValueChange={setCountry}
      >
        <option value="co">Colombia</option>
        <option value="mx">{t('Mexico', 'México')}</option>
        <option value="pe">{t('Peru', 'Perú')}</option>
      </SelectInput>
      <p className="docs-demo-output">
        {t('Value:', 'Valor:')} <strong>{JSON.stringify(country)}</strong>
      </p>
    </div>
  );
}
