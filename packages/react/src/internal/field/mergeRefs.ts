import type { Ref, RefCallback } from 'react';

/** One ref callback that sets every given ref, so a component can keep its own ref to an element it forwards. */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }
  };
}
