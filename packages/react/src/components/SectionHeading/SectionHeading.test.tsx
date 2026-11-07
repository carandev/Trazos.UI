import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionHeading } from './SectionHeading';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('SectionHeading', () => {
  it('renders an h2 by default in the display font', () => {
    render(<SectionHeading title="Projects" />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Projects' });
    expect(heading).toHaveClass('trazos-heading');
  });

  it.each([1, 3, 6] as const)('renders heading level %i through as', (level) => {
    render(<SectionHeading title="Projects" as={`h${level}`} />);
    expect(screen.getByRole('heading', { level })).toBeInTheDocument();
  });

  it('renders the eyebrow in the handwritten font, outside the heading', () => {
    render(<SectionHeading title="Projects" eyebrow="What I build" />);
    const eyebrow = screen.getByText('What I build');
    expect(eyebrow).toHaveClass('trazos-handwriting');
    expect(screen.getByRole('heading')).not.toContainElement(eyebrow);
  });

  it('omits eyebrow, underline and actions by default', () => {
    const { container } = render(<SectionHeading title="Projects" />);
    expect(container.querySelector('.trazos-section-heading-eyebrow')).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('.trazos-section-heading-actions')).toBeNull();
  });

  it('adds a decorative sketch underline when asked', () => {
    const { container } = render(<SectionHeading title="Projects" underline />);
    expect(container.querySelector('svg.trazos-sketch')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the actions slot', () => {
    render(<SectionHeading title="Projects" actions={<button type="button">All</button>} />);
    expect(screen.getByRole('button', { name: 'All' }).parentElement).toHaveClass('trazos-section-heading-actions');
  });

  it('forwards className and native attributes to the root', () => {
    const { container } = render(<SectionHeading title="Projects" className="extra" id="projects" />);
    expect(container.firstElementChild).toHaveClass('trazos-section-heading', 'extra');
    expect(container.firstElementChild).toHaveAttribute('id', 'projects');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SectionHeading title="Projects" eyebrow="Work" underline actions={<a href="/">All</a>} />);
    await expectNoA11yViolations(container);
  });
});
