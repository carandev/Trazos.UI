import { Button } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <>
      <Button size="small">{t('Small', 'Pequeño')}</Button>
      <Button size="medium">{t('Medium', 'Mediano')}</Button>
      <Button size="large">{t('Large', 'Grande')}</Button>
    </>
  );
}
