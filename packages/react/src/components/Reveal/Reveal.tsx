import { useImperativeHandle, useLayoutEffect, useRef, type ComponentPropsWithRef, type CSSProperties } from 'react';
import { cx } from '../../internal/cx';
import { watchEntry } from './revealObserver';
import './Reveal.css';

const STATE = 'data-trazos-reveal';

export interface RevealProps extends ComponentPropsWithRef<'div'> {
  /** Milliseconds to wait before the entrance starts, to stagger siblings. */
  delay?: number;
}

function canAnimate(): boolean {
  if (typeof IntersectionObserver === 'undefined') return false;
  return typeof matchMedia !== 'function' || !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isInViewport(element: Element): boolean {
  const { top, bottom } = element.getBoundingClientRect();
  return top < window.innerHeight && bottom > 0;
}

/**
 * Fades and raises its content when it scrolls into view.
 *
 * Only JavaScript hides the content, and only when it is below the fold, so the
 * server's HTML is always visible: without JavaScript nothing is hidden, and
 * content already on screen does not flash while hydrating. The state lives in
 * an attribute React does not manage, so re-renders cannot reset it.
 */
export function Reveal({ delay = 0, className, style, ref, ...rest }: RevealProps) {
  const element = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => element.current as HTMLDivElement, []);

  useLayoutEffect(() => {
    const el = element.current;
    if (el === null || !canAnimate()) return;
    const state = el.getAttribute(STATE);
    if (state === 'visible' || (state === null && isInViewport(el))) return;
    el.setAttribute(STATE, 'pending');
    return watchEntry(el, () => { el.setAttribute(STATE, 'visible'); });
  }, []);

  return (
    <div
      {...rest}
      ref={element}
      className={cx('trazos-reveal', className)}
      style={{ '--trazos-reveal-delay': `${delay}ms`, ...style } as CSSProperties}
    />
  );
}
