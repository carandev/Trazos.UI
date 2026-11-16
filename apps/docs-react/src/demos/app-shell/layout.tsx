import { AppShell } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CalendarIcon, HomeIcon } from '../../icons';

export default function Demo() {
  return (
    // Framed for the docs preview: in an app, AppShell is the root of the page.
    <div style={{ width: '100%', height: '24rem', overflow: 'auto', transform: 'translateZ(0)' }}>
      <AppShell
        brand={<strong>{t('My app', 'Mi app')}</strong>}
        topBar={<span>{t('Hi, Ana', 'Hola, Ana')}</span>}
        sidebar={
          <nav aria-label={t('Main', 'Principal')} className="docs-stack" style={{ padding: '1rem' }}>
            <a href="#home">
              <HomeIcon /> {t('Home', 'Inicio')}
            </a>
            <a href="#events">
              <CalendarIcon /> {t('Events', 'Eventos')}
            </a>
          </nav>
        }
        isDevelopment
        environmentName="DEV"
      >
        <p>{t('Page content goes here.', 'Aquí va el contenido de la página.')}</p>
      </AppShell>
    </div>
  );
}
