import { PhotoFrame } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '16rem' }}>
      <PhotoFrame
        src="favicon.svg"
        alt={t('The Trazos logo', 'El logo de Trazos')}
        tape
        caption={t('Hand drawn', 'Hecho a mano')}
        imgProps={{ loading: 'lazy' }}
      />
    </div>
  );
}
