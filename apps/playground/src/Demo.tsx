import type { ReactNode } from 'react';

interface DemoProps {
  title: string;
  description?: string;
  code?: string;
  children: ReactNode;
}

/** One example: a live preview with an optional usage snippet. */
export function Demo({ title, description, code, children }: DemoProps) {
  return (
    <section className="pg-demo">
      <h3 className="pg-demo-title">{title}</h3>
      {description !== undefined && <p className="pg-demo-description">{description}</p>}
      <div className="pg-demo-preview">{children}</div>
      {code !== undefined && (
        <pre className="pg-demo-code">
          <code>{code.trim()}</code>
        </pre>
      )}
    </section>
  );
}

/** Lays out several small previews in a wrapping row. */
export function Row({ children }: { children: ReactNode }) {
  return <div className="pg-row">{children}</div>;
}
