import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { PageStack } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('PageStack', () => {
  it('renders its children in a trazos-page-stack container', () => {
    render(
      <PageStack>
        <p>First</p>
        <p>Second</p>
      </PageStack>,
    );
    const root = screen.getByText('First').parentElement;
    expect(root).toHaveClass('trazos-page-stack');
    expect(root?.children).toHaveLength(2);
  });

  it('forwards the ref, classes and native attributes to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<PageStack ref={ref} className="extra" data-x="1" />);
    expect(ref.current).toHaveClass('trazos-page-stack', 'extra');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PageStack>
        <h1>Page</h1>
        <p>Content</p>
      </PageStack>,
    );
    await expectNoA11yViolations(container);
  });
});
