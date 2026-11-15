import { Badge, Button, TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div data-theme="dark" className="docs-theme-island">
      <div className="docs-row">
        <Button variant="primary">{t('Save', 'Guardar')}</Button>
        <Button variant="outline">{t('Cancel', 'Cancelar')}</Button>
        <Badge variant="success">{t('Active', 'Activo')}</Badge>
        <Badge variant="warning">{t('Pending', 'Pendiente')}</Badge>
      </div>
      <TextInput label={t('Email', 'Correo')} placeholder={t('name@example.com', 'nombre@ejemplo.com')} />
    </div>
  );
}
