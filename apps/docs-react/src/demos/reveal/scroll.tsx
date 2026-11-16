import { Card, Reveal } from '@carandev/trazos-ui';

export default function Demo() {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: '110vh' }} className="docs-muted">
        ↓
      </div>
      <div className="docs-grid-2">
        <Reveal>
          <Card>
            <p>Delay 0</p>
          </Card>
        </Reveal>
        <Reveal delay={200}>
          <Card>
            <p>Delay 200</p>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
