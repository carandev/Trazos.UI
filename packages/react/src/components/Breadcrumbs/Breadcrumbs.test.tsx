import { render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs, type BreadcrumbItem } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

const trail: BreadcrumbItem[] = [
  { text: 'Home', href: '/' },
  { text: 'Employees', href: '/employees' },
  { text: 'Ada Lovelace' },
];

describe('Breadcrumbs', () => {
  it('links every item but the current page', () => {
    const { container } = render(<Breadcrumbs items={trail} label="Ruta" />);
    const nav = screen.getByRole('navigation', { name: 'Ruta' });
    expect(nav).toHaveClass('trazos-breadcrumbs');
    const [home, employees, current] = within(nav).getAllByRole('listitem') as [HTMLElement, HTMLElement, HTMLElement];
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    expect(within(home).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(employees).getByRole('link', { name: 'Employees' })).toHaveAttribute('href', '/employees');
    expect(within(current).queryByRole('link')).toBeNull();
    expect(within(current).getByText('Ada Lovelace')).toHaveAttribute('aria-current', 'page');
    expect(container.querySelectorAll('.trazos-breadcrumbs-separator[aria-hidden="true"]')).toHaveLength(2);
  });

  it('does not link the last item even when it has an href', () => {
    render(<Breadcrumbs items={[{ text: 'Home', href: '/' }, { text: 'Here', href: '/here' }]} />);
    expect(screen.queryByRole('link', { name: 'Here' })).toBeNull();
    expect(screen.getByText('Here')).toHaveClass('trazos-breadcrumbs-current');
  });

  it('shows an item without href as plain text', () => {
    render(<Breadcrumbs items={[{ text: 'Settings' }, { text: 'Users' }]} />);
    expect(screen.getByText('Settings')).toHaveClass('trazos-breadcrumbs-text');
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('names the landmark "Breadcrumb" by default', () => {
    render(<Breadcrumbs items={trail} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumbs ref={ref} items={trail} className="extra" data-x="1" />);
    const nav = screen.getByRole('navigation');
    expect(ref.current).toBe(nav);
    expect(nav).toHaveClass('trazos-breadcrumbs', 'extra');
    expect(nav).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Breadcrumbs items={trail} />);
    await expectNoA11yViolations(container);
  });
});
