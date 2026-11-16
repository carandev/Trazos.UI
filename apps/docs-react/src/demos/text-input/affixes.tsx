import { useState } from 'react';
import { TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [account, setAccount] = useState('');
  const [site, setSite] = useState('');

  return (
    <div className="docs-grid-2">
      <TextInput label={t('Bank account', 'Cuenta bancaria')} prefix={t('No.', 'N.º')} value={account} onValueChange={setAccount} />
      <TextInput label={t('Website', 'Sitio web')} prefix="https://" suffix=".com" value={site} onValueChange={setSite} />
    </div>
  );
}
