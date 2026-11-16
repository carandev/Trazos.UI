import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './index';
import type { BreadcrumbItem } from '../Breadcrumbs';
import { expectNoA11yViolations } from '../../../test/a11y';
import pageHeaderCss from './PageHeader.css?raw';

const trail: BreadcrumbItem[] = [
  { text: 'Home', href: '/' },
  { text: 'Employees', href: '/employees' },
  { text: 'Ada Lovelace' },
];

describe('PageHeader', () => {
  it('renders the title, level, subtitle, back link and actions', () => {
    render(
      <PageHeader
        title="Payroll run"
        subtitle="November 2026"
        level={2}
        backHref="/payroll"
        backLabel="Volver"
        actions={<button type="button">Approve</button>}
      />,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Payroll run' });
    expect(heading).toHaveClass('trazos-heading', 'trazos-page-header-title');
    expect(screen.getByText('November 2026')).toHaveClass('trazos-page-header-subtitle');
    const back = screen.getByRole('link', { name: 'Volver' });
    expect(back).toHaveAttribute('href', '/payroll');
    expect(back).toHaveClass('trazos-page-header-back');
    expect(back.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Approve' }).parentElement).toHaveClass('trazos-page-header-actions');
  });

  it('defaults to an h1 and shows breadcrumbs instead of the back link', () => {
    const { container } = render(<PageHeader title="Ada Lovelace" breadcrumbs={trail} backHref="/employees" />);
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ada Lovelace');
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveClass('trazos-breadcrumbs', 'trazos-page-header-breadcrumbs');
    expect(container.querySelector('.trazos-page-header-back')).toBeNull();
    expect(container.querySelector('.trazos-page-header-actions')).toBeNull();
  });

  it('passes breadcrumbsLabel to the breadcrumb landmark', () => {
    render(<PageHeader title="Ada" breadcrumbs={trail} breadcrumbsLabel="Ruta" />);
    expect(screen.getByRole('navigation', { name: 'Ruta' })).toBeInTheDocument();
  });

  it('labels the back link "Back" by default', () => {
    render(<PageHeader title="Detail" backHref="/list" />);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/list');
  });

  it('ignores an empty breadcrumb list and shows the back link', () => {
    render(<PageHeader title="Detail" breadcrumbs={[]} backHref="/list" />);
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.getByRole('link', { name: 'Back' })).toBeInTheDocument();
  });

  it.each([
    [0, 1],
    [9, 6],
  ])('clamps level %i to h%i', (level, expected) => {
    render(<PageHeader title="Title" level={level} />);
    expect(screen.getByRole('heading', { level: expected })).toBeInTheDocument();
  });

  it('renders meta under the title and children below the header row', () => {
    const { container } = render(
      <PageHeader title="Run" meta={<span>Draft</span>}>
        <div>Tabs</div>
      </PageHeader>,
    );
    expect(screen.getByText('Draft').parentElement).toHaveClass('trazos-page-header-meta');
    expect(container.querySelector('.trazos-page-header-text')).toContainElement(screen.getByText('Draft'));
    const header = container.querySelector('header');
    expect(header?.lastElementChild).toHaveTextContent('Tabs');
    expect(header?.lastElementChild?.previousElementSibling).toHaveClass('trazos-page-header-row');
  });

  it('renders no subtitle, meta or back link when they are not given', () => {
    const { container } = render(<PageHeader title="Run" />);
    expect(container.querySelector('.trazos-page-header-subtitle')).toBeNull();
    expect(container.querySelector('.trazos-page-header-meta')).toBeNull();
    expect(container.querySelector('.trazos-page-header-back')).toBeNull();
  });

  it('makes the actions full width on phones', () => {
    const phone = pageHeaderCss.match(/@media \(max-width: 640px\) \{[\s\S]*?\n\}/)?.[0];
    expect(phone).toMatch(/\.trazos-page-header-actions \{\s*width: 100%;/);
    expect(phone).toMatch(/\.trazos-page-header-actions > \* \{\s*flex: 1 1 auto;/);
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<PageHeader ref={ref} title="Run" className="extra" data-x="1" />);
    const header = container.querySelector('header');
    expect(ref.current).toBe(header);
    expect(header).toHaveClass('trazos-page-header', 'extra');
    expect(header).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PageHeader title="Ada Lovelace" subtitle="Engineer" breadcrumbs={trail} actions={<button type="button">Edit</button>} />,
    );
    await expectNoA11yViolations(container);
  });
});
