import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SidebarNav } from './SidebarNav';
import { SidebarNavSection } from './SidebarNavSection';
import { SidebarNavItem } from './SidebarNavItem';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('SidebarNavSection', () => {
  it('renders its title visibly and as the accessible name', () => {
    render(
      <SidebarNavSection title="Main">
        <p>Item</p>
      </SidebarNavSection>,
    );
    expect(screen.getByText('Main')).toHaveClass('trazos-sidebar-nav-section-title');
    expect(screen.getByText('Main')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByLabelText('Main')).toHaveClass('trazos-sidebar-nav-section');
  });
});

describe('SidebarNavItem', () => {
  it('renders the icon, label and href', () => {
    render(
      <SidebarNavItem href="/employees" icon={<svg data-testid="icon" />}>
        Employees
      </SidebarNavItem>,
    );
    const link = screen.getByRole('link', { name: 'Employees' });
    expect(link).toHaveAttribute('href', '/employees');
    expect(screen.getByTestId('icon').parentElement).toHaveClass('trazos-sidebar-nav-item-icon');
    expect(screen.getByText('Employees')).toHaveClass('trazos-sidebar-nav-item-label');
  });

  it('sets aria-current and the active class only when active', () => {
    const { rerender } = render(<SidebarNavItem href="/a">Alpha</SidebarNavItem>);
    const link = screen.getByRole('link', { name: 'Alpha' });
    expect(link).not.toHaveAttribute('aria-current');
    expect(link).not.toHaveClass('trazos-sidebar-nav-item-active');

    rerender(
      <SidebarNavItem href="/a" active>
        Alpha
      </SidebarNavItem>,
    );
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('trazos-sidebar-nav-item', 'trazos-sidebar-nav-item-active');
  });
});

describe('SidebarNav', () => {
  it('renders its items in a scrollable wrapper', () => {
    render(
      <SidebarNav>
        <SidebarNavItem href="/a">Alpha</SidebarNavItem>
      </SidebarNav>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('trazos-sidebar-nav');
    expect(nav.querySelector('.trazos-sidebar-nav-items')).toContainElement(screen.getByRole('link'));
  });

  it('renders the footer after the items, as a sibling of the items wrapper', () => {
    render(
      <SidebarNav footer={<button type="button">Settings</button>}>
        <SidebarNavItem href="/a">Alpha</SidebarNavItem>
      </SidebarNav>,
    );
    const nav = screen.getByRole('navigation');
    const items = nav.querySelector('.trazos-sidebar-nav-items');
    const footer = screen.getByRole('button', { name: 'Settings' });
    expect(items).not.toBeNull();
    expect(items).not.toContainElement(footer);
    expect(footer.parentElement).toBe(nav);
    expect(Array.from(nav.children).indexOf(items as Element)).toBeLessThan(
      Array.from(nav.children).indexOf(footer),
    );
  });

  it('forwards className and native attributes to the nav', () => {
    render(<SidebarNav className="extra" aria-label="Sidebar" />);
    expect(screen.getByRole('navigation', { name: 'Sidebar' })).toHaveClass('trazos-sidebar-nav', 'extra');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SidebarNav footer={<button type="button">Settings</button>}>
        <SidebarNavSection title="Main">
          <SidebarNavItem href="/a" active>
            Alpha
          </SidebarNavItem>
          <SidebarNavItem href="/b">Beta</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>,
    );
    await expectNoA11yViolations(container);
  });
});
