import { DataTable, EmptyState } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { UserIcon } from '../../icons';

interface Person {
  name: string;
  group: string;
}

const people: Person[] = [];

export default function Demo() {
  return (
    <div className="docs-stack">
      <DataTable
        items={people}
        tableHeader={
          <>
            <th>{t('Name', 'Nombre')}</th>
            <th>{t('Team', 'Equipo')}</th>
          </>
        }
        rowTemplate={(person) => (
          <>
            <td>{person.name}</td>
            <td>{person.group}</td>
          </>
        )}
        emptyContent={
          <EmptyState
            compact
            title={t('No members found', 'No se encontraron miembros')}
            description={t('Try another filter.', 'Prueba con otro filtro.')}
            icon={<UserIcon />}
          />
        }
      />
    </div>
  );
}
