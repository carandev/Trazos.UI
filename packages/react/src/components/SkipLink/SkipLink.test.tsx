import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkipLink } from './SkipLink';
import skipLinkCss from './SkipLink.css?raw';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('SkipLink', () => {
  it('links to #main by default', () => {
    render(<SkipLink>Skip to content</SkipLink>);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });

  it('accepts another target and forwards attributes', () => {
    render(
      <SkipLink href="#content" className="extra">
        Skip
      </SkipLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#content');
    expect(link).toHaveClass('trazos-skip-link', 'extra');
  });

  it('stays out of view until focused', () => {
    const base = skipLinkCss.match(/^\.trazos-skip-link \{[^}]*\}/m)?.[0];
    const focused = skipLinkCss.match(/^\.trazos-skip-link:focus \{[^}]*\}/m)?.[0];
    expect(base).toContain('translateY(-200%)');
    expect(focused).toContain('transform: none');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <SkipLink>Skip</SkipLink>
        <main id="main">Content</main>
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
