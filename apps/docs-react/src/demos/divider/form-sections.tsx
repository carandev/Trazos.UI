import { Divider, TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // A labeled divider names the next group of fields; screen readers read the label as the separator's name.
  return (
    <div className="docs-stack">
      <TextInput label={t('Full name', 'Nombre completo')} />
      <Divider label={t('Payment', 'Pago')} />
      <TextInput label={t('Bank', 'Banco')} />
      <TextInput label={t('Account number', 'Número de cuenta')} />
    </div>
  );
}
