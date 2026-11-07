import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('keeps content in the accessibility tree while clipping it visually', () => {
    render(<VisuallyHidden>Saved</VisuallyHidden>);
    const el = screen.getByText('Saved');
    expect(el.tagName).toBe('SPAN');
    const style = getComputedStyle(el);
    expect(style.position).toBe('absolute');
    expect(style.width).toBe('1px');
    expect(style.height).toBe('1px');
    expect(style.overflow).toBe('hidden');
    expect(style.display).not.toBe('none');
    expect(style.visibility).not.toBe('hidden');
  });

  it('forwards attributes for aria-live regions', () => {
    render(
      <VisuallyHidden aria-live="polite" className="extra">
        Saved
      </VisuallyHidden>,
    );
    expect(screen.getByText('Saved')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Saved')).toHaveClass('trazos-visually-hidden', 'extra');
  });
});
