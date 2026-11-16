import { SectionHeading, SiteHeader, ThemeToggle, useScrollSpy } from '@carandev/trazos-ui';
import { t } from '../../i18n';

const ids = ['about', 'work', 'contact'];
const links = ids.map((id) => ({ href: `components/site-header#${id}`, label: id }));

export default function Demo() {
  const active = useScrollSpy(ids);

  return (
    <div style={{ width: '100%' }}>
      <SiteHeader
        links={links}
        navLabel={t('Main', 'Principal')}
        openMenuLabel={t('Open menu', 'Abrir menú')}
        closeMenuLabel={t('Close menu', 'Cerrar menú')}
        activeHref={active === null ? undefined : `components/site-header#${active}`}
        currentType="location"
        logo={<strong className="trazos-heading">Trazos</strong>}
        actions={<ThemeToggle label={t('Toggle theme', 'Cambiar tema')} storageKey="trazos-docs-theme" />}
      />
      {ids.map((id) => (
        <section key={id} id={id} style={{ minHeight: '80vh', paddingTop: '1rem' }}>
          <SectionHeading title={id} as="h3" />
        </section>
      ))}
    </div>
  );
}
