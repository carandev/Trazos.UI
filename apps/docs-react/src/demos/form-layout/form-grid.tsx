import { Button, DateInput, Divider, FormActions, FormGrid, NumberInput, TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div className="docs-stack">
      <FormGrid columns={3}>
        <TextInput label={t('First name', 'Nombres')} />
        <TextInput label={t('Last name', 'Apellidos')} />
        <DateInput label={t('Birth date', 'Fecha de nacimiento')} />
        <TextInput label={t('Address', 'Dirección')} className="trazos-form-full" />
      </FormGrid>
      <Divider label={t('Payment', 'Pago')} />
      <FormGrid>
        <NumberInput label={t('Base salary', 'Salario base')} mode="currency" currency="COP" locale="es-CO" decimals={0} />
        <TextInput label={t('Bank account', 'Cuenta bancaria')} />
      </FormGrid>
      <FormActions align="between" sticky>
        <Button variant="ghost">{t('Cancel', 'Cancelar')}</Button>
        <Button variant="outline">{t('Save draft', 'Guardar borrador')}</Button>
        <Button>{t('Save', 'Guardar')}</Button>
      </FormActions>
    </div>
  );
}
