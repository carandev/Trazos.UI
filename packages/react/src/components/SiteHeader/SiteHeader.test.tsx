import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SiteHeader, type SiteHeaderProps } from './SiteHeader';
import { useScrollSpy } from './useScrollSpy';
import { expectNoA11yViolations } from '../../../test/a11y';

const labels = { navLabel: 'Main', openMenuLabel: 'Open menu', closeMenuLabel: 'Close menu' };
const links = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
];

function renderHeader(props: Partial<SiteHeaderProps> = {}) {
  return render(<SiteHeader {...labels} links={links} {...props} />);
}

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
}

beforeEach(() => {
  setScroll(0);
});

describe('SiteHeader', () => {
  it('renders a header landmark with the logo slot, labelled navigation and actions slot', () => {
    renderHeader({ logo: <a href="/">Logo</a>, actions: <button type="button">Action</button> });
    expect(screen.getByRole('banner')).toHaveClass('trazos-site-header');
    expect(screen.getByRole('link', { name: 'Logo' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toContainElement(screen.getByRole('link', { name: 'Work' }));
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('marks the active link with aria-current', () => {
    renderHeader({ activeHref: '#work' });
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
  });

  it('supports aria-current="location" for one-page sites', () => {
    renderHeader({ activeHref: '#work', currentType: 'location' });
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'location');
  });

  it('wires the menu button to the navigation', async () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const nav = screen.getByRole('navigation');
    expect(toggle).toHaveAttribute('aria-controls', nav.id);
    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(nav).toHaveClass('trazos-site-header-nav-open');
    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(nav).not.toHaveClass('trazos-site-header-nav-open');
  });

  it('closes on Escape and returns focus to the menu button', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await userEvent.keyboard('{Escape}');
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('does not take focus on Escape while the menu is closed', async () => {
    renderHeader({ actions: <button type="button">Action</button> });
    screen.getByRole('button', { name: 'Action' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Action' })).toHaveFocus();
  });

  it('closes when a link is followed and still runs the link onClick', async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    renderHeader({ links: [{ href: '#about', label: 'About', onClick }] });
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(screen.getByRole('link', { name: 'About' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('adds the scrolled style only after scrolling', () => {
    renderHeader();
    const header = screen.getByRole('banner');
    expect(header).not.toHaveClass('trazos-site-header-scrolled');
    act(() => {
      setScroll(100);
      fireEvent.scroll(window);
    });
    expect(header).toHaveClass('trazos-site-header-scrolled');
    act(() => {
      setScroll(0);
      fireEvent.scroll(window);
    });
    expect(header).not.toHaveClass('trazos-site-header-scrolled');
  });

  it('is sticky', () => {
    renderHeader();
    expect(getComputedStyle(screen.getByRole('banner')).position).toBe('sticky');
  });

  it('renders on the server, without the scrolled style', () => {
    const html = renderToString(<SiteHeader {...labels} links={links} />);
    expect(html).toContain('About');
    expect(html).not.toContain('trazos-site-header-scrolled');
  });

  it('forwards className and native attributes to the header', () => {
    renderHeader({ className: 'extra', id: 'top' });
    expect(screen.getByRole('banner')).toHaveClass('extra');
    expect(screen.getByRole('banner')).toHaveAttribute('id', 'top');
  });

  it('forwards attributes of each link', () => {
    renderHeader({ links: [{ href: '/cv.pdf', label: 'Resume', target: '_blank' }] });
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('target', '_blank');
  });

  it('has no accessibility violations, open or closed', async () => {
    const { container } = renderHeader({ logo: <a href="/">Logo</a>, activeHref: '#work' });
    await expectNoA11yViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await expectNoA11yViolations(container);
  });
});

describe('useScrollSpy', () => {
  type Entry = { target: Element; isIntersecting: boolean };
  let trigger: ((entries: Entry[]) => void) | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();
  let created = 0;

  beforeEach(() => {
    created = 0;
    observe.mockClear();
    disconnect.mockClear();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: (entries: Entry[]) => void) {
          created += 1;
          trigger = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    document.body.innerHTML = '<section id="a"></section><section id="b"></section>';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('starts with no active section and observes the sections that exist', () => {
    const { result } = renderHook(() => useScrollSpy(['a', 'b', 'missing']));
    expect(result.current).toBeNull();
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it('returns the id of the section that enters the center band', () => {
    const { result } = renderHook(() => useScrollSpy(['a', 'b']));
    act(() => trigger?.([{ target: document.getElementById('b') as Element, isIntersecting: true }]));
    expect(result.current).toBe('b');
  });

  it('ignores sections that leave the band', () => {
    const { result } = renderHook(() => useScrollSpy(['a', 'b']));
    act(() => trigger?.([{ target: document.getElementById('b') as Element, isIntersecting: false }]));
    expect(result.current).toBeNull();
  });

  it('does not rebuild the observer for a new array with the same ids', () => {
    const { rerender } = renderHook(({ ids }) => useScrollSpy(ids), { initialProps: { ids: ['a', 'b'] } });
    rerender({ ids: ['a', 'b'] });
    expect(created).toBe(1);
    rerender({ ids: ['a'] });
    expect(created).toBe(2);
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('returns null without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { result } = renderHook(() => useScrollSpy(['a']));
    expect(result.current).toBeNull();
  });
});
