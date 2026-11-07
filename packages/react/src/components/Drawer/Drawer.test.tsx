import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

function getDrawer(container: HTMLElement): HTMLElement {
  const aside = container.querySelector('aside.trazos-drawer');
  if (!(aside instanceof HTMLElement)) throw new Error('drawer missing');
  return aside;
}

describe('Drawer', () => {
  it('renders closed, hidden and inert by default with no overlay', () => {
    const { container } = render(<Drawer title="Menu">Links</Drawer>);
    const aside = getDrawer(container);
    expect(aside.parentElement).toHaveClass('trazos-touch-area');
    expect(aside).not.toHaveClass('trazos-drawer-is-open');
    expect(aside).toHaveAttribute('aria-hidden', 'true');
    expect(aside).toHaveAttribute('inert');
    expect(container.querySelector('.trazos-drawer-overlay')).toBeNull();
    expect(container.querySelector('.trazos-drawer-header .trazos-drawer-title')).toHaveTextContent('Menu');
    expect(container.querySelector('.trazos-drawer-body')).toHaveTextContent('Links');
  });

  it('renders open, labelled by its title, with overlay and the default close label', () => {
    const { container } = render(
      <Drawer open title="Menu">
        Links
      </Drawer>,
    );
    const drawer = screen.getByRole('complementary', { name: 'Menu' });
    expect(drawer).toHaveClass('trazos-drawer', 'trazos-drawer-is-open');
    expect(drawer).toHaveAttribute('aria-hidden', 'false');
    expect(drawer).not.toHaveAttribute('inert');
    expect(container.querySelector('.trazos-drawer-overlay')).toBeInTheDocument();
    const close = screen.getByRole('button', { name: 'Cerrar menú' });
    expect(close).toHaveClass('trazos-drawer-close');
  });

  it('renders the custom header instead of the title and can hide the close button', () => {
    const { container } = render(
      <Drawer open title="Ignored" header={<span>Brand</span>} showCloseButton={false}>
        Links
      </Drawer>,
    );
    expect(container.querySelector('.trazos-drawer-title')).toBeNull();
    expect(container.querySelector('.trazos-drawer-header')).toHaveTextContent('Brand');
    expect(container.querySelector('.trazos-drawer-close')).toBeNull();
  });

  it('closes from the close button and overlay, calling onOpenChange(false) then onClose', async () => {
    const calls: string[] = [];
    const { container, rerender } = render(
      <Drawer
        open
        title="Menu"
        onOpenChange={(open) => calls.push(`change:${String(open)}`)}
        onClose={() => calls.push('close')}
      >
        Links
      </Drawer>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(calls).toEqual(['change:false', 'close']);
    calls.length = 0;
    rerender(
      <Drawer open title="Menu" onOpenChange={(open) => calls.push(`change:${String(open)}`)} onClose={() => calls.push('close')}>
        Links
      </Drawer>,
    );
    const overlay = container.querySelector('.trazos-drawer-overlay');
    if (!(overlay instanceof HTMLElement)) throw new Error('overlay missing');
    await userEvent.click(overlay);
    expect(calls).toEqual(['change:false', 'close']);
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Menu" onClose={onClose}>
        Links
      </Drawer>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('works uncontrolled with defaultOpen', async () => {
    const { container } = render(
      <Drawer defaultOpen title="Menu">
        Links
      </Drawer>,
    );
    expect(getDrawer(container)).toHaveClass('trazos-drawer-is-open');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(getDrawer(container)).not.toHaveClass('trazos-drawer-is-open');
  });

  it('opens on a right swipe of more than 100px from the touch area', () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Drawer title="Menu" onOpenChange={onOpenChange}>
        Links
      </Drawer>,
    );
    const area = container.querySelector('.trazos-touch-area');
    if (!(area instanceof HTMLElement)) throw new Error('touch area missing');
    fireEvent.touchStart(area, { touches: [{ clientX: 0 }] });
    fireEvent.touchMove(area, { touches: [{ clientX: 80 }] });
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.touchMove(area, { touches: [{ clientX: 120 }] });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(getDrawer(container)).toHaveClass('trazos-drawer-is-open');
    fireEvent.touchEnd(area);
  });

  it('ignores swipes after touchend', () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Drawer title="Menu" onOpenChange={onOpenChange}>
        Links
      </Drawer>,
    );
    const area = container.querySelector('.trazos-touch-area');
    if (!(area instanceof HTMLElement)) throw new Error('touch area missing');
    fireEvent.touchStart(area, { touches: [{ clientX: 0 }] });
    fireEvent.touchEnd(area);
    fireEvent.touchMove(area, { touches: [{ clientX: 200 }] });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('adds the trazos-drawer-open body class while open and removes it on close and unmount', () => {
    const { rerender, unmount } = render(<Drawer title="Menu">Links</Drawer>);
    expect(document.body).not.toHaveClass('trazos-drawer-open');
    rerender(
      <Drawer open title="Menu">
        Links
      </Drawer>,
    );
    expect(document.body).toHaveClass('trazos-drawer-open');
    rerender(<Drawer title="Menu">Links</Drawer>);
    expect(document.body).not.toHaveClass('trazos-drawer-open');
    rerender(
      <Drawer open title="Menu">
        Links
      </Drawer>,
    );
    unmount();
    expect(document.body).not.toHaveClass('trazos-drawer-open');
  });

  it('moves focus in, traps Tab and restores focus on close', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            Open
          </button>
          <Drawer open={open} onOpenChange={setOpen} title="Menu">
            <a href="#home">Home</a>
          </Drawer>
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(opener);
    const close = screen.getByRole('button', { name: 'Cerrar menú' });
    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(opener).toHaveFocus();
  });

  it('forwards the ref, classes and native attributes to the aside', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <Drawer ref={ref} title="Menu" className="extra" data-x="1" closeButtonAriaLabel="Close menu">
        Links
      </Drawer>,
    );
    const aside = getDrawer(container);
    expect(ref.current).toBe(aside);
    expect(aside).toHaveClass('trazos-drawer', 'extra');
    expect(aside).toHaveAttribute('data-x', '1');
    expect(aside.querySelector('[aria-label="Close menu"]')).toBeInTheDocument();
  });

  it('has no accessibility violations open or closed', async () => {
    const { container, rerender } = render(
      <Drawer open title="Menu">
        <a href="#home">Home</a>
      </Drawer>,
    );
    await expectNoA11yViolations(container);
    rerender(
      <Drawer title="Menu">
        <a href="#home">Home</a>
      </Drawer>,
    );
    await expectNoA11yViolations(container);
  });
});
