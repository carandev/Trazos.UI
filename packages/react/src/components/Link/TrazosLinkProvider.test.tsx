import { render, screen } from '@testing-library/react';
import { createRef, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TrazosLinkProvider, type TrazosLinkProps } from './index';
import { Breadcrumbs } from '../Breadcrumbs';
import { LinkButton } from '../Button';
import { LinkList, LinkListItem } from '../LinkList';
import { PageHeader } from '../PageHeader';

/** Stands in for a router's Link: it renders an anchor tagged as routed. */
const RouterLink = vi.fn(({ href, children, ...rest }: TrazosLinkProps) => (
  <a {...rest} href={href} data-router="">
    {children}
  </a>
));

function withRouter(ui: ReactElement) {
  return render(<TrazosLinkProvider component={RouterLink}>{ui}</TrazosLinkProvider>);
}

describe('TrazosLinkProvider', () => {
  it('renders the Breadcrumbs links through the provided component', () => {
    withRouter(<Breadcrumbs items={[{ text: 'Home', href: '/' }, { text: 'Employees', href: '/employees' }, { text: 'Ada' }]} />);
    for (const [name, href] of [['Home', '/'], ['Employees', '/employees']] as const) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('data-router');
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('class', 'trazos-breadcrumbs-link');
    }
    expect(screen.getByText('Ada')).toHaveAttribute('aria-current', 'page');
  });

  it('renders the PageHeader breadcrumbs through the provided component', () => {
    withRouter(<PageHeader title="Ada" breadcrumbs={[{ text: 'Employees', href: '/employees' }, { text: 'Ada' }]} />);
    const link = screen.getByRole('link', { name: 'Employees' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('href', '/employees');
  });

  it('renders the PageHeader back link through the provided component', () => {
    withRouter(<PageHeader title="Ada" backHref="/employees" backLabel="Employees" />);
    const link = screen.getByRole('link', { name: 'Employees' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('href', '/employees');
    expect(link).toHaveAttribute('class', 'trazos-page-header-back');
  });

  it('renders LinkButton through the provided component with its classes and attributes', () => {
    const ref = createRef<HTMLAnchorElement>();
    withRouter(
      <LinkButton ref={ref} href="/new" variant="wine" aria-current="page" title="New">
        New
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: 'New' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('href', '/new');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('title', 'New');
    expect(link).toHaveClass('trazos-btn', 'trazos-btn-wine', 'trazos-btn-md');
    expect(ref.current).toBe(link);
  });

  it('renders LinkListItem through the provided component with its classes and attributes', () => {
    withRouter(
      <LinkList>
        <LinkListItem href="/flows" className="extra" aria-current="page">
          Flows
        </LinkListItem>
      </LinkList>,
    );
    const link = screen.getByRole('link', { name: /Flows/ });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('href', '/flows');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('trazos-link-list-link', 'extra');
  });

  it.each([
    ['target="_blank"', <LinkButton href="/report" target="_blank">Open</LinkButton>],
    ['download', <LinkButton href="/report.pdf" download>Open</LinkButton>],
    ['a mailto: href', <LinkButton href="mailto:ada@example.com">Open</LinkButton>],
    ['an absolute URL', <LinkButton href="https://example.com">Open</LinkButton>],
    ['a protocol-relative URL', <LinkButton href="//example.com">Open</LinkButton>],
  ])('keeps a plain anchor for a link with %s', (_, ui) => {
    withRouter(ui);
    expect(screen.getByRole('link', { name: 'Open' })).not.toHaveAttribute('data-router');
  });

  it('keeps the markup unchanged without a provider', () => {
    const plain = render(
      <>
        <PageHeader title="Ada" breadcrumbs={[{ text: 'Employees', href: '/employees' }, { text: 'Ada' }]} />
        <PageHeader title="Ada" backHref="/employees" />
        <LinkButton href="/new">New</LinkButton>
        <LinkList>
          <LinkListItem href="/flows">Flows</LinkListItem>
        </LinkList>
      </>,
    );
    for (const link of screen.getAllByRole('link')) expect(link).not.toHaveAttribute('data-router');
    expect(plain.container.innerHTML).toMatchInlineSnapshot(`"<header class="trazos-page-header"><nav aria-label="Breadcrumb" class="trazos-breadcrumbs trazos-page-header-breadcrumbs"><ol class="trazos-breadcrumbs-list"><li class="trazos-breadcrumbs-item"><a class="trazos-breadcrumbs-link" href="/employees">Employees</a><svg class="trazos-breadcrumbs-separator" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7"></path></svg></li><li class="trazos-breadcrumbs-item"><span class="trazos-breadcrumbs-current" aria-current="page">Ada</span></li></ol></nav><div class="trazos-page-header-row"><div class="trazos-page-header-text"><h1 class="trazos-heading trazos-page-header-title">Ada</h1></div></div></header><header class="trazos-page-header"><a class="trazos-page-header-back" href="/employees"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"></path></svg>Back</a><div class="trazos-page-header-row"><div class="trazos-page-header-text"><h1 class="trazos-heading trazos-page-header-title">Ada</h1></div></div></header><a href="/new" class="trazos-btn trazos-btn-primary trazos-btn-md"><span class="trazos-btn-text">New</span></a><ul class="trazos-link-list"><li class="trazos-link-list-item"><a href="/flows" class="trazos-link-list-link"><span class="trazos-link-list-name">Flows</span><span class="trazos-link-list-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></span></a></li></ul>"`);
  });
});
