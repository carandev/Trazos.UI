import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core against a rendered container and fails with the rule ids
 * and offending markup when there are violations.
 * Color contrast is skipped: jsdom does not compute styles.
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`,
  );
  expect(summary).toEqual([]);
}
