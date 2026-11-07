import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tape } from './Tape';
import tapeCss from './Tape.css?raw';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('Tape', () => {
  it('is decorative by default', () => {
    const { container } = render(<Tape />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('can stop being decorative', () => {
    const { container } = render(<Tape aria-hidden={false} aria-label="Pinned" role="img" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'false');
  });

  it('exposes color and rotation as custom properties', () => {
    const { container } = render(<Tape color="red" rotate={7} />);
    const style = (container.firstElementChild as HTMLElement).style;
    expect(style.getPropertyValue('--trazos-tape-color')).toBe('red');
    expect(style.getPropertyValue('--trazos-tape-rotate')).toBe('7deg');
  });

  it('leaves the defaults to the stylesheet', () => {
    const { container } = render(<Tape />);
    const style = (container.firstElementChild as HTMLElement).style;
    expect(style.getPropertyValue('--trazos-tape-color')).toBe('');
    expect(style.getPropertyValue('--trazos-tape-rotate')).toBe('');
  });

  it.each(['top', 'top-left', 'top-right'] as const)('maps position %s to a class', (position) => {
    const { container } = render(<Tape position={position} />);
    expect(container.firstElementChild).toHaveClass(`trazos-tape-${position}`);
  });

  it('keeps a style passed by the host', () => {
    const { container } = render(<Tape rotate={2} style={{ opacity: 0.5 }} />);
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe('0.5');
  });

  it('tilts on parent hover, except with reduced motion', () => {
    expect(tapeCss).toMatch(/:hover > \.trazos-tape/);
    expect(tapeCss).toMatch(/prefers-reduced-motion: no-preference/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Tape />);
    await expectNoA11yViolations(container);
  });
});
