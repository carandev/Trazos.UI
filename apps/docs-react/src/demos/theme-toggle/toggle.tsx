import { ThemeToggle, useTheme } from '@carandev/trazos-ui';
import { t } from '../../i18n';

// The docs site stores its theme under this key, so the demo and the site stay in sync.
const storageKey = 'trazos-docs-theme';

export default function Demo() {
  const { theme } = useTheme({ storageKey });

  return (
    <>
      <ThemeToggle label={t('Toggle theme', 'Cambiar tema')} variant="outline" storageKey={storageKey} />
      <span className="docs-muted" data-testid="current-theme">
        {theme}
      </span>
    </>
  );
}
