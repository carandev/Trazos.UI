import { LinkList, LinkListItem } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CheckIcon } from '../../icons';

export default function Demo() {
  return (
    <div style={{ width: '100%', maxWidth: '26rem' }}>
      <LinkList>
        <LinkListItem href="components/button" meta="C#">
          Trazos.UI
        </LinkListItem>
        <LinkListItem href="components/card" meta="2026">
          {t('A very long project name that does not fit on a single line of this list', 'Un nombre de proyecto muy largo que no cabe en una sola línea de esta lista')}
        </LinkListItem>
        <LinkListItem href="components/badge" icon={<CheckIcon />}>
          {t('Custom icon', 'Ícono propio')}
        </LinkListItem>
      </LinkList>
    </div>
  );
}
