import { SketchUnderline } from '@carandev/trazos-ui';

export default function Demo() {
  return (
    <div style={{ width: '100%', maxWidth: '20rem' }}>
      <SketchUnderline animated color="var(--trazos-olive)" strokeWidth={4.5} style={{ height: 14 }} />
    </div>
  );
}
