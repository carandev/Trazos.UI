import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SketchArrow, SketchCircle, SketchSquiggle, SketchUnderline } from './Sketch';
import sketchCss from './Sketch.css?raw';
import { expectNoA11yViolations } from '../../../test/a11y';

const sketches = [
  ['SketchUnderline', SketchUnderline, 'var(--trazos-wine)'],
  ['SketchCircle', SketchCircle, 'var(--trazos-lavender-border)'],
  ['SketchArrow', SketchArrow, 'var(--trazos-lavender)'],
  ['SketchSquiggle', SketchSquiggle, 'var(--trazos-border-strong)'],
] as const;

describe.each(sketches)('%s', (_name, Sketch, defaultColor) => {
  it('is decorative and defaults to a token color', () => {
    const { container } = render(<Sketch />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('trazos-sketch');
    for (const path of container.querySelectorAll('path')) {
      expect(path).toHaveAttribute('stroke', defaultColor);
    }
  });

  it('accepts a color and a stroke width', () => {
    const { container } = render(<Sketch color="red" strokeWidth={5} />);
    for (const path of container.querySelectorAll('path')) {
      expect(path).toHaveAttribute('stroke', 'red');
      expect(path).toHaveAttribute('stroke-width', '5');
    }
  });

  it('normalizes path length so the draw-in animation can use it', () => {
    const { container } = render(<Sketch />);
    for (const path of container.querySelectorAll('path')) {
      expect(path).toHaveAttribute('pathLength', '1');
    }
  });

  it('only animates when asked to', () => {
    const { container, rerender } = render(<Sketch />);
    expect(container.querySelector('svg')).not.toHaveClass('trazos-sketch-animated');
    rerender(<Sketch animated />);
    expect(container.querySelector('svg')).toHaveClass('trazos-sketch-animated');
  });

  it('forwards className and native attributes', () => {
    const { container } = render(<Sketch className="extra" data-x="1" />);
    expect(container.querySelector('svg')).toHaveClass('extra');
    expect(container.querySelector('svg')).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Sketch animated />);
    await expectNoA11yViolations(container);
  });
});

describe('Sketch stylesheet', () => {
  it('shows the full stroke with reduced motion', () => {
    const reduced = sketchCss.slice(sketchCss.indexOf('prefers-reduced-motion'));
    expect(reduced).toContain('animation: none');
    expect(reduced).toContain('stroke-dashoffset: 0');
  });
});
