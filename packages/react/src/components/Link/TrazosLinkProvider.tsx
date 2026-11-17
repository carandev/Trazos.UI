import { createContext, createElement, useContext, type ComponentPropsWithRef, type ComponentType, type ReactNode } from 'react';

/** Props the link component receives: every anchor attribute, with a required `href`. */
export type TrazosLinkProps = ComponentPropsWithRef<'a'> & { href: string };

/** The element that renders a navigational link, such as a router's `Link`. */
export type TrazosLinkComponent = ComponentType<TrazosLinkProps>;

export interface TrazosLinkProviderProps {
  /**
   * Renders every navigational link of the library. It receives `href`,
   * `className`, `aria-current`, `children`, `ref` and the remaining anchor
   * attributes, for example `({ href, ...rest }) => <Link to={href} {...rest} />`.
   */
  component: TrazosLinkComponent;
  children?: ReactNode;
}

const LinkComponentContext = createContext<TrazosLinkComponent | null>(null);

/**
 * Lets a single-page app render the library's links through its router, so
 * `Breadcrumbs`, `PageHeader`, `LinkButton` and `LinkListItem` navigate in place
 * instead of reloading the page. Without it they render a plain `<a>`.
 */
export function TrazosLinkProvider({ component, children }: TrazosLinkProviderProps) {
  return <LinkComponentContext.Provider value={component}>{children}</LinkComponentContext.Provider>;
}

// A scheme (https:, mailto:, tel:) or a protocol-relative URL leaves the app.
const EXTERNAL_HREF = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

function isExternal({ href, target, download }: Omit<TrazosLinkProps, 'children'>): boolean {
  return (
    EXTERNAL_HREF.test(href) ||
    (target != null && target !== '' && target !== '_self') ||
    (download != null && download !== false)
  );
}

/**
 * Internal: the anchor every navigational component renders. It goes through
 * the provided link component, except for links that leave the app (another
 * tab, a download, a URL with a scheme), which stay plain anchors.
 */
export function TrazosLink({ children, ...props }: TrazosLinkProps) {
  const component = useContext(LinkComponentContext);
  if (component == null || isExternal(props)) return <a {...props}>{children}</a>;
  // The component comes from the provider, so it keeps its identity between renders.
  return createElement(component, props, children);
}
