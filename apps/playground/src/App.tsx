import { useEffect, useState } from 'react';
import { demos, groups } from './demos/registry';

type Theme = 'light' | 'dark';

function currentId(): string {
  const id = window.location.hash.replace(/^#\/?/, '');
  return demos.some((d) => d.id === id) ? id : (demos[0]?.id ?? '');
}

export function App() {
  const [id, setId] = useState(currentId);
  // `?theme=dark` opens the playground in dark mode (handy for screenshots and links).
  const [theme, setTheme] = useState<Theme>(() =>
    new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light',
  );

  useEffect(() => {
    const onHash = () => {
      setId(currentId());
    };
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const demo = demos.find((d) => d.id === id);
  const Page = demo?.Page;

  return (
    <div className="pg-layout">
      <aside className="pg-sidebar">
        <div className="pg-brand">
          <span className="trazos-heading">Trazos UI</span>
          <span className="trazos-handwriting">for React</span>
        </div>
        <button
          type="button"
          className="pg-theme-toggle"
          aria-pressed={theme === 'dark'}
          onClick={() => {
            setTheme(theme === 'dark' ? 'light' : 'dark');
          }}
        >
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </button>
        <nav aria-label="Components">
          {groups.map((group) => (
            <div key={group} className="pg-nav-group">
              <p className="pg-nav-group-title">{group}</p>
              <ul>
                {demos
                  .filter((d) => d.group === group)
                  .map((d) => (
                    <li key={d.id}>
                      <a href={`#/${d.id}`} aria-current={d.id === id ? 'page' : undefined}>
                        {d.name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="pg-main">
        {demo !== undefined && Page !== undefined && (
          <>
            <header className="pg-page-header">
              <h1 className="trazos-heading">{demo.name}</h1>
              <p>{demo.summary}</p>
            </header>
            <Page />
          </>
        )}
      </main>
    </div>
  );
}
