import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cx } from '../../internal/cx';
import './Sketch.css';

export interface SketchProps extends Omit<ComponentPropsWithRef<'svg'>, 'color'> {
  /** Any CSS color. Each sketch defaults to a token, so it follows the theme. */
  color?: string;
  strokeWidth?: number;
  /** Draws the stroke in when it mounts. Reduced motion shows it complete. */
  animated?: boolean;
}

interface Stroke {
  d: string;
  /** Starts after the previous stroke, in seconds. */
  delay?: number;
}

interface SketchShape {
  viewBox: string;
  color: string;
  strokeWidth: number;
  /** Stretches to its box instead of keeping the drawn proportions. */
  stretch: boolean;
  strokes: Stroke[];
}

function renderSketch(shape: SketchShape, { color, strokeWidth, animated = false, className, ...rest }: SketchProps) {
  return (
    <svg
      viewBox={shape.viewBox}
      preserveAspectRatio={shape.stretch ? 'none' : undefined}
      {...rest}
      aria-hidden="true"
      className={cx('trazos-sketch', animated && 'trazos-sketch-animated', className)}
    >
      {shape.strokes.map((stroke) => (
        <path
          key={stroke.d}
          d={stroke.d}
          pathLength={1}
          stroke={color ?? shape.color}
          strokeWidth={strokeWidth ?? shape.strokeWidth}
          style={
            stroke.delay === undefined ? undefined : ({ '--trazos-sketch-delay': `${stroke.delay}s` } as CSSProperties)
          }
        />
      ))}
    </svg>
  );
}

const underline: SketchShape = {
  viewBox: '0 0 220 14',
  color: 'var(--trazos-wine)',
  strokeWidth: 3,
  stretch: true,
  strokes: [{ d: 'M3 9 C 40 2, 80 13, 120 7 S 190 3, 217 8' }],
};

const circle: SketchShape = {
  viewBox: '0 0 160 60',
  color: 'var(--trazos-lavender-border)',
  strokeWidth: 3,
  stretch: true,
  strokes: [{ d: 'M20 8 C 70 -2, 150 6, 154 28 C 158 52, 60 58, 18 50 C -6 44, 4 14, 34 9' }],
};

const arrow: SketchShape = {
  viewBox: '0 0 80 60',
  color: 'var(--trazos-lavender)',
  strokeWidth: 2.5,
  stretch: false,
  strokes: [{ d: 'M8 8 C 20 40, 40 50, 70 46' }, { d: 'M60 38 L71 46 L60 53', delay: 0.8 }],
};

const squiggle: SketchShape = {
  viewBox: '0 0 720 20',
  color: 'var(--trazos-border-strong)',
  strokeWidth: 2,
  stretch: true,
  strokes: [{ d: 'M2 10 C 120 4, 240 16, 360 9 S 600 4, 718 11' }],
};

export function SketchUnderline(props: SketchProps) {
  return renderSketch(underline, props);
}

export function SketchCircle(props: SketchProps) {
  return renderSketch(circle, props);
}

export function SketchArrow(props: SketchProps) {
  return renderSketch(arrow, props);
}

export function SketchSquiggle(props: SketchProps) {
  return renderSketch(squiggle, props);
}
