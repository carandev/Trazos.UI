import { Skeleton } from '@carandev/trazos-ui';

export default function Demo() {
  return (
    <div className="docs-stack">
      <Skeleton variant="text" count={3} />
      <div className="docs-row">
        <Skeleton variant="circular" width="3rem" height="3rem" />
        <Skeleton variant="rounded" width="8rem" height="2.5rem" />
      </div>
      <Skeleton variant="card" height="8rem" />
    </div>
  );
}
