import { Button, Card } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <Card
      className="docs-card-demo"
      header={<h3 className="trazos-heading">{t('Design team', 'Equipo de diseño')}</h3>}
      footer={
        <>
          <Button size="small">{t('Join', 'Unirme')}</Button>
          <Button size="small" variant="ghost">
            {t('Details', 'Detalles')}
          </Button>
        </>
      }
    >
      <p>{t('Reviews new work every Friday at 4:00 pm.', 'Revisa el trabajo nuevo todos los viernes a las 4:00 p. m.')}</p>
    </Card>
  );
}
