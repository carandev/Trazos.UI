import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './index';
import { useConfirm } from '../ConfirmDialog';
import { useToast } from '../Toast';
import { expectNoA11yViolations } from '../../../test/a11y';

function getDrawer(container: HTMLElement): HTMLElement {
  const aside = container.querySelector('aside.trazos-drawer');
  if (!(aside instanceof HTMLElement)) throw new Error('drawer missing');
  return aside;
}

describe('AppShell', () => {
  it('renders the Razor layout structure', () => {
    const { container } = render(
      <AppShell brand={<span>Trazos</span>} sidebar={<a href="#a">A</a>} topBar={<span>User</span>} containerClass="wide">
        <p>Page</p>
      </AppShell>,
    );
    const root = container.firstElementChild;
    expect(root).toHaveClass('trazos-app-shell');
    const sidebar = screen.getByRole('complementary', { name: 'Navegación principal' });
    expect(sidebar).toHaveClass('trazos-shell-sidebar');
    expect(sidebar).toHaveTextContent('A');
    expect(container.querySelector('.trazos-shell-main-wrapper header.trazos-shell-topbar')).toBeInTheDocument();
    expect(container.querySelector('.trazos-shell-topbar-left .trazos-shell-brand')).toHaveTextContent('Trazos');
    expect(container.querySelector('.trazos-shell-topbar-right')).toHaveTextContent('User');
    const shellContainer = container.querySelector('main.trazos-shell-content > .trazos-shell-container');
    expect(shellContainer).toHaveClass('wide');
    expect(shellContainer).toHaveTextContent('Page');
    const children = [...(root?.children ?? [])].map((el) => el.className);
    expect(children).toEqual([
      'trazos-shell-sidebar',
      'trazos-shell-main-wrapper',
      'trazos-touch-area',
      'trazos-toast-container',
    ]);
  });

  it('uses the brand and sidebar in the drawer by default', () => {
    const { container } = render(
      <AppShell brand={<span>Trazos</span>} sidebar={<a href="#a">A</a>}>
        Page
      </AppShell>,
    );
    const drawer = getDrawer(container);
    expect(drawer.querySelector('.trazos-drawer-header .trazos-shell-brand')).toHaveTextContent('Trazos');
    expect(drawer.querySelector('.trazos-drawer-body')).toHaveTextContent('A');
  });

  it('prefers drawerHeader and drawerContent when given', () => {
    const { container } = render(
      <AppShell brand="Brand" sidebar="Side" drawerHeader="DH" drawerContent="DC">
        Page
      </AppShell>,
    );
    const drawer = getDrawer(container);
    expect(drawer.querySelector('.trazos-drawer-header')).toHaveTextContent('DH');
    expect(drawer.querySelector('.trazos-drawer-header .trazos-shell-brand')).toBeNull();
    expect(drawer.querySelector('.trazos-drawer-body')).toHaveTextContent('DC');
  });

  it('toggles the drawer from the hamburger and closes it from the drawer', async () => {
    const { container } = render(<AppShell sidebar={<a href="#a">A</a>}>Page</AppShell>);
    // The hamburger is display:none above the 768px breakpoint (as in Razor), so it has no
    // computed accessible name in jsdom; query it by class and check its label attribute.
    const hamburger = container.querySelector('button.trazos-hamburger-btn');
    if (!(hamburger instanceof HTMLElement)) throw new Error('hamburger missing');
    expect(hamburger).toHaveAttribute('aria-label', 'Abrir menú de navegación');
    await userEvent.click(hamburger);
    expect(getDrawer(container)).toHaveClass('trazos-drawer-is-open');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(getDrawer(container)).not.toHaveClass('trazos-drawer-is-open');
  });

  it('hides the environment badge by default', () => {
    const { container } = render(<AppShell>Page</AppShell>);
    expect(container.querySelector('.trazos-env-badge')).toBeNull();
  });

  it('shows a DEV badge in development', () => {
    const { container } = render(<AppShell isDevelopment>Page</AppShell>);
    const badge = container.querySelector('.trazos-shell-topbar-left .trazos-env-badge');
    expect(badge).toHaveTextContent('DEV');
    expect(badge).toHaveAttribute('title', 'Running in Development mode');
  });

  it('shows the environment name in the badge', () => {
    const { container } = render(
      <AppShell isDevelopment environmentName="STAGING">
        Page
      </AppShell>,
    );
    const badge = container.querySelector('.trazos-env-badge');
    expect(badge).toHaveTextContent('STAGING');
    expect(badge).toHaveAttribute('title', 'Running in STAGING mode');
  });

  it('hides the badge when showEnvironmentBadge is false', () => {
    const { container } = render(
      <AppShell isDevelopment showEnvironmentBadge={false}>
        Page
      </AppShell>,
    );
    expect(container.querySelector('.trazos-env-badge')).toBeNull();
  });

  it('provides toasts and confirm dialogs to its content', async () => {
    function Content() {
      const toast = useToast();
      const confirm = useConfirm();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              toast.showSuccess('Saved');
            }}
          >
            Toast
          </button>
          <button type="button" onClick={() => void confirm('Sure?')}>
            Confirm
          </button>
        </>
      );
    }
    const { container } = render(
      <AppShell>
        <Content />
      </AppShell>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Toast' }));
    expect(container.querySelector('.trazos-app-shell > .trazos-toast-container .trazos-toast-message')).toHaveTextContent('Saved');
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    const backdrop = container.querySelector('.trazos-app-shell > .trazos-modal-backdrop');
    expect(backdrop).toHaveTextContent('Sure?');
  });

  it('forwards the ref, classes and native attributes to the root', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <AppShell ref={ref} className="extra" data-x="1">
        Page
      </AppShell>,
    );
    const root = container.firstElementChild;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('trazos-app-shell', 'extra');
    expect(root).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AppShell brand="Trazos" sidebar={<a href="#a">A</a>} isDevelopment>
        <h1>Page</h1>
      </AppShell>,
    );
    await expectNoA11yViolations(container);
  });
});
