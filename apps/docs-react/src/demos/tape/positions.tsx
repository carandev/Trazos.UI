import { Card, Tape } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div className="docs-grid-2">
      <Card style={{ position: 'relative' }}>
        <Tape />
        top
      </Card>
      <Card style={{ position: 'relative' }}>
        <Tape position="top-left" />
        top-left
      </Card>
      <Card style={{ position: 'relative' }}>
        <Tape position="top-right" rotate={4.5} />
        top-right
      </Card>
      <Card style={{ position: 'relative' }}>
        <Tape color="color-mix(in srgb, var(--trazos-sky-border) 70%, transparent)" />
        {t('Custom color', 'Color propio')}
      </Card>
    </div>
  );
}
