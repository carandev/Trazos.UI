import { useState } from 'react';
import { SearchInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

const names = ['Ana María Restrepo', 'Julián Ospina', 'Luisa Fernanda Gil', 'Tomás Arango', 'Valentina Ríos'];

export default function Demo() {
  // Updated once the user pauses typing (debounce, 300 ms by default).
  const [query, setQuery] = useState('');
  const visible = names.filter((name) => name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return (
    <div className="docs-stack">
      <SearchInput
        placeholder={t('Search employees', 'Buscar empleados')}
        ariaLabel={t('Search employees', 'Buscar empleados')}
        clearLabel={t('Clear search', 'Limpiar búsqueda')}
        value={query}
        onValueChange={setQuery}
      />
      <ul>
        {visible.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
