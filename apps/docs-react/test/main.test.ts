import { act } from 'react';
import { has, mount, source, unmount } from '../src/main';

// React only flushes updates inside act() when the environment says so.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('docs React demos', () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.append(host);
  });

  afterEach(() => {
    unmount(host);
    host.remove();
  });

  it('knows which demos exist', () => {
    expect(has('badge/variants')).toBe(true);
    expect(has('badge/nope')).toBe(false);
  });

  it('mounts the real React component and unmounts it', async () => {
    let mounted = false;
    await act(async () => {
      mounted = await mount(host, 'badge/variants', 'en');
    });
    expect(mounted).toBe(true);
    expect(host.querySelectorAll('.trazos-badge-box')).toHaveLength(7);

    act(() => {
      unmount(host);
    });
    expect(host.innerHTML).toBe('');
  });

  it('renders demo text in the docs language', async () => {
    await act(async () => {
      await mount(host, 'badge/with-icon', 'es');
    });
    expect(host.textContent).toContain('Confirmado');
  });

  it('returns false and renders nothing for an unknown demo', async () => {
    await expect(mount(host, 'badge/nope', 'en')).resolves.toBe(false);
    expect(host.innerHTML).toBe('');
  });

  it('skips a mount that was cancelled while the demo was loading', async () => {
    const pending = mount(host, 'badge/variants', 'en');
    unmount(host);
    await act(async () => {
      await pending;
    });
    expect(host.innerHTML).toBe('');
  });

  it('serves the display source in the docs language', async () => {
    const code = await source('badge/with-icon', 'es');
    expect(code).toContain('Confirmado');
    expect(code).not.toContain('i18n');
    await expect(source('badge/nope', 'en')).resolves.toBeNull();
  });
});
