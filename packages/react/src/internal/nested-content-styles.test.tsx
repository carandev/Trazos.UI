import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '../components/EmptyState';
import { IconBox } from '../components/IconBox';
import { RadioCardGroup } from '../components/RadioCardGroup';
import { TabItem, Tabs } from '../components/Tabs';

// Rules that style content passed in by the consumer (icons, nested
// components). The Razor stylesheets reach it with `::deep`; the React
// stylesheets are global, so a plain descendant selector is enough.
// jsdom reports lengths in px (1rem = 16px).

const sheets = import.meta.glob<string>('../components/**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function icon() {
  return <svg data-testid="icon" aria-hidden="true" />;
}

function iconIn(container: HTMLElement): SVGElement {
  const svg = container.querySelector('svg');
  if (svg == null) throw new Error('icon not rendered');
  return svg;
}

describe('styles for nested content', () => {
  it('uses no `:deep()` selector, which browsers drop as invalid', () => {
    const offenders = Object.entries(sheets)
      .filter(([, css]) => css.includes(':deep('))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it.each([
    ['small', '18px'],
    ['medium', '24px'],
    ['large', '30px'],
  ] as const)('sizes the IconBox %s icon to %s', (size, length) => {
    const { container } = render(<IconBox size={size}>{icon()}</IconBox>);
    const style = getComputedStyle(iconIn(container));
    expect(style.width).toBe(length);
    expect(style.height).toBe(length);
  });

  it.each([
    [false, '16px'],
    [true, '12px'],
  ] as const)('spaces the EmptyState icon (compact: %s) by %s', (compact, margin) => {
    const { container } = render(<EmptyState title="Nothing" icon={icon()} compact={compact} />);
    const box = container.querySelector('.trazos-empty-state-icon');
    if (box == null) throw new Error('icon box not rendered');
    expect(getComputedStyle(box).marginBottom).toBe(margin);
  });

  it('sizes the RadioCardGroup option icon to 1.15rem (18.4px)', () => {
    const { container } = render(
      <RadioCardGroup label="Plan" options={[{ value: 'a', title: 'A', icon: icon() }]} />,
    );
    const style = getComputedStyle(iconIn(container));
    expect(style.width).toBe('18.4px');
    expect(style.height).toBe('18.4px');
  });

  it('sizes the tab icon to 1rem (16px)', () => {
    const { container } = render(
      <Tabs>
        <TabItem title="Flows" icon={icon()}>
          Panel
        </TabItem>
      </Tabs>,
    );
    const style = getComputedStyle(iconIn(container));
    expect(style.width).toBe('16px');
    expect(style.height).toBe('16px');
  });
});
