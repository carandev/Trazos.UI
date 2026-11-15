import { SketchArrow, SketchCircle, SketchSquiggle, SketchUnderline } from '@carandev/trazos-ui';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '20rem' }}>
      <SketchUnderline style={{ height: 14 }} />
      <SketchCircle style={{ height: 60 }} />
      <SketchArrow style={{ width: 80 }} />
      <SketchSquiggle style={{ height: 20 }} />
    </div>
  );
}
