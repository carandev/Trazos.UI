import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from './Reveal';

type Entry = { target: Element; isIntersecting: boolean };

let created = 0;
let trigger: ((entries: Entry[]) => void) | undefined;
const observe = vi.fn();
const unobserve = vi.fn();

function stubObserver() {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (entries: Entry[]) => void) {
        created += 1;
        trigger = callback;
      }
      observe = observe;
      unobserve = unobserve;
      disconnect = vi.fn();
    },
  );
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches, media: query }));
}

beforeEach(() => {
  created = 0;
  trigger = undefined;
  observe.mockClear();
  unobserve.mockClear();
  stubObserver();
  stubReducedMotion(false);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top: 5000, bottom: 5100 } as DOMRect);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Reveal', () => {
  it('server-renders visible content, so it shows when JavaScript has not run', () => {
    const html = renderToString(<Reveal>Hello</Reveal>);
    expect(html).toContain('Hello');
    expect(html).not.toContain('data-trazos-reveal');
  });

  it('hides content below the fold and shows it when it enters the viewport', () => {
    render(<Reveal>Hello</Reveal>);
    const el = screen.getByText('Hello');
    expect(el).toHaveAttribute('data-trazos-reveal', 'pending');
    expect(getComputedStyle(el).opacity).toBe('0');
    act(() => trigger?.([{ target: el, isIntersecting: true }]));
    expect(el).toHaveAttribute('data-trazos-reveal', 'visible');
    expect(getComputedStyle(el).opacity).toBe('1');
    expect(unobserve).toHaveBeenCalledWith(el);
  });

  it('stays pending while the entry does not intersect', () => {
    render(<Reveal>Hello</Reveal>);
    const el = screen.getByText('Hello');
    act(() => trigger?.([{ target: el, isIntersecting: false }]));
    expect(el).toHaveAttribute('data-trazos-reveal', 'pending');
  });

  it('leaves content already in the viewport alone, so it does not flash', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top: 10, bottom: 100 } as DOMRect);
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello')).not.toHaveAttribute('data-trazos-reveal');
    expect(observe).not.toHaveBeenCalled();
  });

  it('never hides content with prefers-reduced-motion', () => {
    stubReducedMotion(true);
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello')).not.toHaveAttribute('data-trazos-reveal');
    expect(observe).not.toHaveBeenCalled();
  });

  it('never hides content without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello')).not.toHaveAttribute('data-trazos-reveal');
  });

  it('shares one IntersectionObserver between instances', () => {
    render(
      <>
        <Reveal>One</Reveal>
        <Reveal>Two</Reveal>
      </>,
    );
    expect(created).toBe(1);
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it('only reveals the element that intersects', () => {
    render(
      <>
        <Reveal>One</Reveal>
        <Reveal>Two</Reveal>
      </>,
    );
    act(() => trigger?.([{ target: screen.getByText('One'), isIntersecting: true }]));
    expect(screen.getByText('One')).toHaveAttribute('data-trazos-reveal', 'visible');
    expect(screen.getByText('Two')).toHaveAttribute('data-trazos-reveal', 'pending');
  });

  it('creates a new observer after the last instance is gone', () => {
    const { unmount } = render(<Reveal>One</Reveal>);
    unmount();
    render(<Reveal>Two</Reveal>);
    expect(created).toBe(2);
  });

  it('stops observing when it unmounts', () => {
    const { unmount } = render(<Reveal>Hello</Reveal>);
    const el = screen.getByText('Hello');
    unmount();
    expect(unobserve).toHaveBeenCalledWith(el);
  });

  it('stays visible across a re-render that changes className', () => {
    const { rerender } = render(<Reveal className="a">Hello</Reveal>);
    const el = screen.getByText('Hello');
    act(() => trigger?.([{ target: el, isIntersecting: true }]));
    rerender(<Reveal className="b">Hello</Reveal>);
    expect(el).toHaveAttribute('data-trazos-reveal', 'visible');
    expect(el).toHaveClass('b');
  });

  it('exposes delay as a custom property in milliseconds', () => {
    render(<Reveal delay={150}>Hello</Reveal>);
    expect(screen.getByText('Hello').style.getPropertyValue('--trazos-reveal-delay')).toBe('150ms');
  });

  it('forwards native attributes and the ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Reveal ref={ref} id="x" style={{ color: 'red' }}>
        Hello
      </Reveal>,
    );
    const el = screen.getByText('Hello');
    expect(ref.current).toBe(el);
    expect(el).toHaveAttribute('id', 'x');
    expect(el.style.color).toBe('red');
  });
});
