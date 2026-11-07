import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinkList, LinkListItem } from './LinkList';
import { expectNoA11yViolations } from '../../../test/a11y';

describe('LinkList', () => {
  it('renders a semantic list of links', () => {
    render(
      <LinkList>
        <LinkListItem href="/a">Alpha</LinkListItem>
        <LinkListItem href="/b">Beta</LinkListItem>
      </LinkList>,
    );
    expect(screen.getByRole('list')).toHaveClass('trazos-link-list');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Alpha' })).toHaveAttribute('href', '/a');
  });

  it('truncates the name instead of wrapping', () => {
    render(
      <LinkList>
        <LinkListItem href="/a">Alpha</LinkListItem>
      </LinkList>,
    );
    const style = getComputedStyle(screen.getByText('Alpha'));
    expect(style.overflow).toBe('hidden');
    expect(style.textOverflow).toBe('ellipsis');
    expect(style.whiteSpace).toBe('nowrap');
  });

  it('renders metadata only when given', () => {
    const { container, rerender } = render(<LinkListItem href="/a">Alpha</LinkListItem>);
    expect(container.querySelector('.trazos-link-list-meta')).toBeNull();
    rerender(
      <LinkListItem href="/a" meta="C# · 2024">
        Alpha
      </LinkListItem>,
    );
    expect(screen.getByText('C# · 2024')).toHaveClass('trazos-link-list-meta');
  });

  it('draws a decorative arrow by default and accepts another icon', () => {
    const { container, rerender } = render(<LinkListItem href="/a">Alpha</LinkListItem>);
    expect(container.querySelector('.trazos-link-list-icon svg')).toHaveAttribute('aria-hidden', 'true');
    rerender(
      <LinkListItem href="/a" icon={<svg data-testid="own" />}>
        Alpha
      </LinkListItem>,
    );
    expect(screen.getByTestId('own')).toBeInTheDocument();
  });

  it('forwards anchor attributes to the link', () => {
    render(
      <LinkListItem href="/a" target="_blank" rel="noopener" className="extra">
        Alpha
      </LinkListItem>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('trazos-link-list-link', 'extra');
  });

  it('forwards attributes on the list', () => {
    render(<LinkList className="extra" aria-label="Other projects" />);
    expect(screen.getByRole('list', { name: 'Other projects' })).toHaveClass('extra');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <LinkList>
        <LinkListItem href="/a" meta="2024">
          Alpha
        </LinkListItem>
      </LinkList>,
    );
    await expectNoA11yViolations(container);
  });
});
