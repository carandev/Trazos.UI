import { SidebarNav, SidebarNavSection, SidebarNavItem } from '@carandev/trazos-ui';
import { t } from '../../i18n';

const homeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const userIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const settingsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
  </svg>
);

export default function Demo() {
  return (
    <div style={{ width: '100%', maxWidth: '16rem', height: '20rem', border: '1.5px solid var(--trazos-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <SidebarNav
        footer={
          <SidebarNavItem href="#" icon={settingsIcon}>
            {t('Settings', 'Configuración')}
          </SidebarNavItem>
        }
      >
        <SidebarNavSection title={t('Main', 'Principal')}>
          <SidebarNavItem href="#" active icon={homeIcon}>
            {t('Dashboard', 'Panel')}
          </SidebarNavItem>
          <SidebarNavItem href="#" icon={userIcon}>
            {t('Employees', 'Empleados')}
          </SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>
    </div>
  );
}
