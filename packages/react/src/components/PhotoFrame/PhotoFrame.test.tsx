import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhotoFrame } from './PhotoFrame';
import photoCss from './PhotoFrame.css?raw';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('PhotoFrame', () => {
  it('renders a figure with the image', () => {
    render(<PhotoFrame src="/me.jpg" alt="Portrait" />);
    expect(screen.getByRole('figure')).toHaveClass('trazos-photo-frame');
    expect(screen.getByAltText('Portrait')).toHaveAttribute('src', '/me.jpg');
  });

  it('renders a handwritten caption only when given', () => {
    const { container, rerender } = render(<PhotoFrame src="/me.jpg" alt="Portrait" />);
    expect(container.querySelector('figcaption')).toBeNull();
    rerender(<PhotoFrame src="/me.jpg" alt="Portrait" caption="Hi there" />);
    expect(screen.getByText('Hi there').tagName).toBe('FIGCAPTION');
    expect(screen.getByText('Hi there')).toHaveClass('trazos-handwriting');
  });

  it('shows tape only when asked, and passes its options on', () => {
    const { container, rerender } = render(<PhotoFrame src="/me.jpg" alt="Portrait" />);
    expect(container.querySelector('.trazos-tape')).toBeNull();
    rerender(<PhotoFrame src="/me.jpg" alt="Portrait" tape />);
    expect(container.querySelector('.trazos-tape')).not.toBeNull();
    rerender(<PhotoFrame src="/me.jpg" alt="Portrait" tape={{ position: 'top-left' }} />);
    expect(container.querySelector('.trazos-tape')).toHaveClass('trazos-tape-top-left');
  });

  it('passes image attributes through imgProps', () => {
    render(<PhotoFrame src="/me.jpg" alt="Portrait" imgProps={{ loading: 'lazy', width: 300 }} />);
    expect(screen.getByAltText('Portrait')).toHaveAttribute('loading', 'lazy');
    expect(screen.getByAltText('Portrait')).toHaveAttribute('width', '300');
  });

  it('forwards className and native attributes to the figure', () => {
    render(<PhotoFrame src="/me.jpg" alt="Portrait" className="extra" data-x="1" />);
    expect(screen.getByRole('figure')).toHaveClass('extra');
    expect(screen.getByRole('figure')).toHaveAttribute('data-x', '1');
  });

  it('only tilts on hover without reduced motion', () => {
    const block = photoCss.slice(photoCss.indexOf('prefers-reduced-motion: no-preference'));
    expect(block).toContain(':hover');
    expect(block).toContain('rotate');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PhotoFrame src="/me.jpg" alt="Portrait" caption="Hi" tape />);
    await expectNoA11yViolations(container);
  });
});
