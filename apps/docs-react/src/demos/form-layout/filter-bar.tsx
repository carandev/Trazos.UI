import { useState } from 'react';
import { Button, FilterBar, SearchInput, SelectInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');

  const reset = () => {
    setQuery('');
    setArea('');
  };

  return (
    <div className="docs-stack">
      <FilterBar
        label={t('Filter employees', 'Filtrar empleados')}
        actions={
          <Button variant="ghost" onClick={reset}>
            {t('Reset', 'Limpiar')}
          </Button>
        }
      >
        <SearchInput
          ariaLabel={t('Name or document', 'Nombre o documento')}
          clearLabel={t('Clear search', 'Limpiar búsqueda')}
          placeholder={t('Name or document', 'Nombre o documento')}
          value={query}
          onValueChange={setQuery}
        />
        <SelectInput aria-label={t('Area', 'Área')} placeholder={t('Area', 'Área')} value={area} onValueChange={setArea}>
          <option value="it">{t('Technology', 'Tecnología')}</option>
          <option value="hr">{t('People', 'Gestión humana')}</option>
        </SelectInput>
      </FilterBar>
      <p className="docs-demo-output">
        {t('Filters:', 'Filtros:')} <strong>{JSON.stringify({ query, area })}</strong>
      </p>
    </div>
  );
}
