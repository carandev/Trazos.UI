import { SkipLink } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <>
      <SkipLink href="components/skip-link#skip-link-target">{t('Skip to content', 'Saltar al contenido')}</SkipLink>
      <p id="skip-link-target" tabIndex={-1}>
        {t('The skip link lands here.', 'El enlace llega hasta aquí.')}
      </p>
    </>
  );
}
