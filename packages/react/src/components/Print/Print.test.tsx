import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { NoPrint, PrintOnly } from './index';
import utilities from '../../../../tokens/utilities.css?raw';
import '../../styles/foundation.css';

describe('NoPrint and PrintOnly', () => {
  it('wrap their content with the print utility classes', () => {
    render(
      <>
        <NoPrint>
          <button type="button">Print</button>
        </NoPrint>
        <PrintOnly>
          <p>Signature</p>
        </PrintOnly>
      </>,
    );
    const noPrint = screen.getByRole('button', { name: 'Print' }).parentElement;
    expect(noPrint?.tagName).toBe('DIV');
    expect(noPrint).toHaveClass('trazos-no-print');
    const printOnly = screen.getByText('Signature').parentElement;
    expect(printOnly?.tagName).toBe('DIV');
    expect(printOnly).toHaveClass('trazos-print-only');
  });

  it('hides PrintOnly on screen and keeps NoPrint visible', () => {
    render(
      <>
        <NoPrint>Toolbar</NoPrint>
        <PrintOnly>Signature</PrintOnly>
      </>,
    );
    expect(getComputedStyle(screen.getByText('Toolbar')).display).not.toBe('none');
    expect(getComputedStyle(screen.getByText('Signature')).display).toBe('none');
  });

  it('rely on the shared utilities for the print rules', () => {
    const print = utilities.match(/@media print \{[\s\S]*?\n\}/)?.[0];
    expect(print).toMatch(/\.trazos-no-print \{\s*display: none !important;/);
    expect(print).toMatch(/\.trazos-print-only \{\s*display: block !important;/);
  });

  it('forward refs, extra classes and native attributes', () => {
    const noRef = createRef<HTMLDivElement>();
    const onlyRef = createRef<HTMLDivElement>();
    render(
      <>
        <NoPrint ref={noRef} className="a" data-x="1">
          x
        </NoPrint>
        <PrintOnly ref={onlyRef} className="b" data-y="2">
          y
        </PrintOnly>
      </>,
    );
    expect(noRef.current).toHaveClass('trazos-no-print', 'a');
    expect(noRef.current).toHaveAttribute('data-x', '1');
    expect(onlyRef.current).toHaveClass('trazos-print-only', 'b');
    expect(onlyRef.current).toHaveAttribute('data-y', '2');
  });
});
