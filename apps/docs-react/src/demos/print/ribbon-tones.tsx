import { Card, Ribbon, type RibbonTone } from '@carandev/trazos-ui';

const tones: RibbonTone[] = ['olive', 'wine', 'gold', 'sky', 'neutral'];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {tones.map((tone, i) => (
        <Card key={tone} style={{ position: 'relative', width: '11rem', height: '7rem' }}>
          <Ribbon text={tone} tone={tone} position={i % 2 === 0 ? 'top-left' : 'top-right'} />
        </Card>
      ))}
    </div>
  );
}
