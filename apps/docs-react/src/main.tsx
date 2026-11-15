import { StrictMode, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { setLanguage, type Lang } from './i18n';
import { toDisplaySource } from './source';

// No foundation CSS here: the docs page already loads the same tokens and
// utilities (_content/Trazos.UI/trazos.css). Each component chunk brings its own CSS.

// Every file under demos/ is one demo: demos/<page>/<demo>.tsx, id "<page>/<demo>",
// with the demo component as its default export. Both maps load lazily, so a
// page only downloads its own demos.
const modules = import.meta.glob<{ default: ComponentType }>('./demos/**/*.tsx');
const sources = import.meta.glob<string>('./demos/**/*.tsx', { query: '?raw', import: 'default' });

const roots = new Map<Element, Root>();
// The latest mount request per host: a newer mount or an unmount cancels an older one still loading.
const requests = new Map<Element, symbol>();

const path = (id: string): string => `./demos/${id}.tsx`;

/** Whether a demo with this id exists. */
export function has(id: string): boolean {
  return path(id) in modules;
}

/**
 * Renders the demo into `host`, replacing whatever React rendered there before.
 * Resolves to false, rendering nothing, when the demo does not exist.
 */
export async function mount(host: Element, id: string, lang: Lang): Promise<boolean> {
  const load = modules[path(id)];
  if (load === undefined) return false;

  const request = Symbol(id);
  requests.set(host, request);
  const { default: Demo } = await load();
  if (requests.get(host) !== request) return false;

  roots.get(host)?.unmount();
  setLanguage(lang);
  const root = createRoot(host);
  roots.set(host, root);
  root.render(
    <StrictMode>
      <Demo />
    </StrictMode>,
  );
  return true;
}

/** Removes the demo rendered into `host` and cancels a mount still loading. */
export function unmount(host: Element): void {
  requests.delete(host);
  roots.get(host)?.unmount();
  roots.delete(host);
}

/** The code the docs show for a demo, or null when it does not exist. */
export async function source(id: string, lang: Lang): Promise<string | null> {
  const load = sources[path(id)];
  return load === undefined ? null : toDisplaySource(await load(), lang);
}
