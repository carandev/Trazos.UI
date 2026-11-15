import { Button, Card } from '@carandev/trazos-ui';
import { t } from '../../i18n';

const cover = <img src="favicon.svg" alt="" width={64} height={64} style={{ width: '4rem', margin: '1rem auto' }} />;

export default function Demo() {
  return (
    <div className="docs-grid-2">
      <Card fill variant="sky" media={cover}>
        <h3 className="trazos-heading">{t('Short', 'Corta')}</h3>
        <div style={{ marginTop: 'auto' }}>
          <Button size="small">{t('Open', 'Abrir')}</Button>
        </div>
      </Card>
      <Card fill variant="gold" media={cover}>
        <h3 className="trazos-heading">{t('Longer', 'Más larga')}</h3>
        <p>{t('This card has more text, and both buttons still line up.', 'Esta tarjeta tiene más texto, y los dos botones siguen alineados.')}</p>
        <div style={{ marginTop: 'auto' }}>
          <Button size="small">{t('Open', 'Abrir')}</Button>
        </div>
      </Card>
    </div>
  );
}
