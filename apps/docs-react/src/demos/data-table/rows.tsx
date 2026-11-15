import { useState } from 'react';
import { Badge, Button, DataTable } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface Person {
  name: string;
  group: string;
  active: boolean;
}

const seed = (): Person[] => [
  { name: 'Ana María Restrepo', group: t('Design', 'Diseño'), active: true },
  { name: 'Julián Ospina', group: t('Engineering', 'Ingeniería'), active: true },
  { name: 'Luisa Fernanda Gil', group: t('Marketing', 'Marketing'), active: false },
  { name: 'Tomás Arango', group: t('Design', 'Diseño'), active: true },
];

export default function Demo() {
  const [people, setPeople] = useState(seed);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Person | null>(null);

  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div className="docs-stack">
      <div className="docs-row">
        <Button size="small" variant="outline" onClick={reload}>
          {t('Simulate loading', 'Simular carga')}
        </Button>
        <Button size="small" variant="ghost" onClick={() => setPeople(people.length === 0 ? seed() : [])}>
          {people.length === 0 ? t('Restore rows', 'Restaurar filas') : t('Clear rows', 'Vaciar filas')}
        </Button>
      </div>

      <DataTable
        items={people}
        loading={loading}
        getRowKey={(person) => person.name}
        onRowClick={setSelected}
        tableHeader={
          <>
            <th>{t('Name', 'Nombre')}</th>
            <th>{t('Team', 'Equipo')}</th>
            <th>{t('Status', 'Estado')}</th>
          </>
        }
        rowTemplate={(person) => (
          <>
            <td>{person.name}</td>
            <td>{person.group}</td>
            <td>
              <Badge variant={person.active ? 'success' : 'neutral'}>
                {person.active ? t('Active', 'Activo') : t('Inactive', 'Inactivo')}
              </Badge>
            </td>
          </>
        )}
      />

      <p className="docs-demo-output">
        {t('Selected row:', 'Fila seleccionada:')} <strong>{selected?.name ?? t('none', 'ninguna')}</strong>
      </p>
    </div>
  );
}
