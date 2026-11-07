import { describe, expect, it } from 'vitest';

/**
 * Razor scoped CSS isolated every component's classes. In React the CSS is
 * global, so a class defined by two components would leak styles between
 * them. Each component stylesheet must own the classes it defines.
 */
const sheets = import.meta.glob<string>('../components/**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function definedClasses(css: string): Set<string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = withoutComments.match(/[^{}]+(?=\{)/g) ?? [];
  const classes = new Set<string>();
  for (const selector of selectors) {
    if (selector.trim().startsWith('@')) continue;
    for (const match of selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
      if (match[1] !== undefined) classes.add(match[1]);
    }
  }
  return classes;
}

const utilities = import.meta.glob<string>('../../../tokens/utilities.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('component stylesheets', () => {
  it('only define classes with the trazos- prefix, because React CSS is global', () => {
    const unprefixed = Object.values(sheets)
      .flatMap((css) => [...definedClasses(css)])
      .filter((cls) => !cls.startsWith('trazos-'));
    expect([...new Set(unprefixed)].sort()).toEqual([]);
  });

  it('do not redefine the shared utility classes', () => {
    const utilityClasses = new Set(Object.values(utilities).flatMap((css) => [...definedClasses(css)]));
    expect(utilityClasses.size).toBeGreaterThan(0);
    const collisions = Object.values(sheets)
      .flatMap((css) => [...definedClasses(css)])
      .filter((cls) => utilityClasses.has(cls));
    expect(collisions).toEqual([]);
  });

  it('are found', () => {
    expect(Object.keys(sheets).length).toBeGreaterThan(0);
    for (const css of Object.values(sheets)) expect(css.length).toBeGreaterThan(0);
  });

  it('do not define classes owned by another component', () => {
    const owners = new Map<string, string[]>();
    for (const [path, css] of Object.entries(sheets)) {
      const component = path.split('/')[2] ?? path;
      for (const cls of definedClasses(css)) {
        const list = owners.get(cls) ?? [];
        if (!list.includes(component)) list.push(component);
        owners.set(cls, list);
      }
    }
    const shared = [...owners.entries()]
      .filter(([, components]) => components.length > 1)
      .map(([cls, components]) => `${cls}: ${components.join(', ')}`);
    expect(shared).toEqual([]);
  });

  it('do not reuse @keyframes names (Razor scoped them per component too)', () => {
    const owners = new Map<string, string[]>();
    for (const [path, css] of Object.entries(sheets)) {
      const component = path.split('/')[2] ?? path;
      for (const match of css.matchAll(/@keyframes\s+([\w-]+)/g)) {
        const name = match[1];
        if (name === undefined) continue;
        const list = owners.get(name) ?? [];
        if (!list.includes(component)) list.push(component);
        owners.set(name, list);
      }
    }
    const shared = [...owners.entries()]
      .filter(([, components]) => components.length > 1)
      .map(([name, components]) => `${name}: ${components.join(', ')}`);
    expect(shared).toEqual([]);
  });
});
