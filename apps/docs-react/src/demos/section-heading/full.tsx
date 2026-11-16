import { LinkButton, SectionHeading } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <SectionHeading
      style={{ width: '100%' }}
      eyebrow={t('Lately', 'Últimamente')}
      title={t('Selected work', 'Trabajo seleccionado')}
      as="h3"
      underline
      actions={
        <LinkButton href="components/button" variant="ghost">
          {t('See all', 'Ver todo')}
        </LinkButton>
      }
    />
  );
}
