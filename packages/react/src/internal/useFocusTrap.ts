import { useCallback, useEffect, useRef } from 'react';
import type { Ref, RefCallback } from 'react';

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Active traps, innermost last: only the innermost one handles keys. */
const trapStack: object[] = [];

function focusableIn(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.tabIndex >= 0 && el.closest('[inert]') === null,
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref != null) ref.current = value;
}

export interface FocusTrapOptions<T extends HTMLElement> {
  /** Called when Escape is pressed while this trap is the innermost active one. */
  onEscape?: () => void;
  /** A consumer ref to forward the container element to. */
  forwardedRef?: Ref<T> | undefined;
}

/**
 * Keeps keyboard focus inside a dialog-like container while `active`:
 * focuses the first focusable element (or the container) on activation,
 * wraps Tab / Shift+Tab, calls `onEscape` on Escape and restores focus to the
 * previously focused element on deactivation or unmount.
 * Returns a callback ref for the container that also forwards to `forwardedRef`.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  { onEscape, forwardedRef }: FocusTrapOptions<T> = {},
): RefCallback<T> {
  const nodeRef = useRef<T | null>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  const setRef = useCallback(
    (node: T | null) => {
      nodeRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  useEffect(() => {
    const container = nodeRef.current;
    if (!active || container === null) return;

    const token = {};
    trapStack.push(token);
    const previouslyFocused = document.activeElement;

    const [first] = focusableIn(container);
    (first ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (trapStack[trapStack.length - 1] !== token) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusableIn(container);
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (firstItem === undefined || lastItem === undefined) {
        event.preventDefault();
        container.focus();
        return;
      }
      const current = document.activeElement;
      const outside = current === null || !container.contains(current);
      if (event.shiftKey && (outside || current === firstItem || current === container)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && (outside || current === lastItem)) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const index = trapStack.indexOf(token);
      if (index !== -1) trapStack.splice(index, 1);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [active]);

  return setRef;
}
