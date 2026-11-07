import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../components/AppShell';
import { SelectInput } from '../components/Input';
import { Modal } from '../components/Modal';
import { ToastProvider, useToast, type ToastApi } from '../components/Toast';

// The icons the components draw themselves must be sized by the library's
// own CSS, not by Tailwind's `w-*`/`h-*` classes, so they render correctly in
// apps that do not use Tailwind. This suite loads no Tailwind CSS.
// jsdom reports lengths in px (1rem = 16px).

function svgIn(selector: string): SVGElement {
  const svg = document.querySelector(`${selector} svg`);
  if (svg == null) throw new Error(`no icon in ${selector}`);
  return svg as SVGElement;
}

function expectSize(selector: string, px: string) {
  const style = getComputedStyle(svgIn(selector));
  expect(style.width).toBe(px);
  expect(style.height).toBe(px);
}

describe('built-in icon sizes without Tailwind', () => {
  it('sizes the Modal close icon to 1.25rem', () => {
    render(
      <Modal open title="Rename" onOpenChange={() => undefined}>
        Body
      </Modal>,
    );
    expectSize('.trazos-modal-close', '20px');
  });

  it('sizes the SelectInput arrow to 1rem', () => {
    render(
      <SelectInput label="Country">
        <option value="co">Colombia</option>
      </SelectInput>,
    );
    expectSize('.trazos-select-arrow', '16px');
  });

  it('sizes the AppShell menu icon to 1.5rem', () => {
    render(<AppShell brand={<span>Trazos</span>}>Page</AppShell>);
    expectSize('.trazos-hamburger-btn', '24px');
  });

  it('sizes the toast type icon to 1.25rem and its close icon to 1rem', () => {
    let api: ToastApi | undefined;
    function Capture() {
      const toast = useToast();
      useEffect(() => {
        api = toast;
      }, [toast]);
      return null;
    }
    render(
      <ToastProvider>
        <Capture />
      </ToastProvider>,
    );
    act(() => {
      api?.showInfo('Saved');
    });
    expectSize('.trazos-toast-icon', '20px');
    expectSize('.trazos-toast-close', '16px');
  });
});
