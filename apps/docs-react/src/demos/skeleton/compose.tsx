import { Card, Skeleton } from '@carandev/trazos-ui';

export default function Demo() {
  return (
    <div className="docs-grid-2">
      {[0, 1].map((i) => (
        <Card key={i}>
          <div className="docs-row">
            <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
            <Skeleton variant="text" width="60%" />
          </div>
          <Skeleton variant="text" count={2} className="docs-skeleton-gap" />
        </Card>
      ))}
    </div>
  );
}
