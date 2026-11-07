import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { FormSection } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('FormSection', () => {
  it('renders a section labelled by its h4 title', () => {
    const { container } = render(
      <FormSection title="Contact">
        <span>fields</span>
      </FormSection>,
    );
    const section = screen.getByRole('region', { name: 'Contact' });
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveClass('trazos-form-section');
    const heading = screen.getByRole('heading', { level: 4, name: 'Contact' });
    expect(heading).toHaveClass('trazos-form-section-title');
    expect(heading.id).toMatch(/^trazos-form-section-/);
    expect(section).toHaveAttribute('aria-labelledby', heading.id);
    expect(container.querySelector('.trazos-form-section-header .trazos-form-section-heading')).toContainElement(heading);
    const body = container.querySelector('.trazos-form-section-body');
    expect(body).toHaveTextContent('fields');
    expect(body).not.toHaveClass('trazos-form-section-has-step');
    expect(container.querySelector('.trazos-form-section-step')).toBeNull();
    expect(container.querySelector('.trazos-form-section-description')).toBeNull();
  });

  it('gives each section a unique title id', () => {
    render(
      <>
        <FormSection title="One" />
        <FormSection title="Two" />
      </>,
    );
    const [one, two] = screen.getAllByRole('heading', { level: 4 });
    expect(one?.id).not.toBe(two?.id);
  });

  it.each([1, 0])('renders step %i as a decorative badge and marks the body', (step) => {
    const { container } = render(<FormSection title="Step" step={step} />);
    const badge = container.querySelector('.trazos-form-section-step');
    expect(badge).toHaveTextContent(String(step));
    expect(badge).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.trazos-form-section-body')).toHaveClass('trazos-form-section-has-step');
  });

  it('renders the description when non-empty', () => {
    const { container, rerender } = render(<FormSection title="T" description="Help text" />);
    expect(container.querySelector('.trazos-form-section-description')).toHaveTextContent('Help text');
    rerender(<FormSection title="T" description="" />);
    expect(container.querySelector('.trazos-form-section-description')).toBeNull();
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLElement>();
    render(<FormSection ref={ref} title="T" className="extra" data-x="1" />);
    const section = screen.getByRole('region', { name: 'T' });
    expect(ref.current).toBe(section);
    expect(section).toHaveClass('trazos-form-section', 'extra');
    expect(section).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FormSection title="Contact" description="How we reach you" step={1}>
        <label>
          Email <input type="email" />
        </label>
      </FormSection>,
    );
    await expectNoA11yViolations(container);
  });
});
