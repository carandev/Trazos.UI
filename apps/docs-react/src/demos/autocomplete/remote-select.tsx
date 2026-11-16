import { useState } from 'react';
import { AutocompleteSelect } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface Employee {
  id: number;
  name: string;
}

const directory: Employee[] = [
  { id: 1, name: 'Ana María Restrepo' },
  { id: 2, name: 'Julián Ospina' },
  { id: 3, name: 'Luisa Fernanda Gil' },
  { id: 4, name: 'Tomás Arango' },
];

// Simulates GET /employees?q=… ; the signal aborts stale searches.
const searchEmployees = (query: string, signal: AbortSignal): Promise<Employee[]> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      resolve(directory.filter((e) => e.name.toLowerCase().includes(q)));
    }, 300);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

// Simulates GET /employees/{id} for a value saved earlier.
const loadEmployee = (id: number): Promise<Employee | null> =>
  new Promise((resolve) => setTimeout(() => resolve(directory.find((e) => e.id === id) ?? null), 300));

export default function Demo() {
  const [employeeId, setEmployeeId] = useState<number | null>(3);

  return (
    <div className="docs-stack">
      <AutocompleteSelect<Employee, number>
        label={t('Manager', 'Jefe directo')}
        placeholder={t('Type at least two letters', 'Escribe al menos dos letras')}
        searchFn={searchEmployees}
        resolveItem={loadEmployee}
        itemText={(e) => e.name}
        valueSelector={(e) => e.id}
        minChars={2}
        value={employeeId}
        onValueChange={setEmployeeId}
        noResultsText={t('No results', 'Sin resultados')}
        searchingText={t('Searching…', 'Buscando…')}
        clearText={t('Clear selection', 'Quitar selección')}
      />
      <p className="docs-demo-output">
        {t('Employee id:', 'Id de empleado:')} <strong>{employeeId ?? 'null'}</strong>
      </p>
    </div>
  );
}
