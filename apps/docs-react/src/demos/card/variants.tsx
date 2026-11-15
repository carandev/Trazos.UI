import { Card, type CardVariant } from '@carandev/trazos-ui';

const variants: CardVariant[] = ['default', 'white', 'lavender', 'interactive', 'olive', 'gold', 'wine', 'sky'];

export default function Demo() {
  return (
    <div className="docs-grid-2">
      {variants.map((variant) => (
        <Card key={variant} variant={variant}>
          <h3 className="trazos-heading">{variant}</h3>
          <p className="docs-muted">variant=&quot;{variant}&quot;</p>
        </Card>
      ))}
    </div>
  );
}
