import { useState } from 'react';
import { Autocomplete, Badge } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface Member {
  name: string;
  group: string;
}

export default function Demo() {
  const [participants, setParticipants] = useState<Member[]>([]);

  const members: Member[] = [
    { name: 'Ana María Restrepo', group: t('Design', 'Diseño') },
    { name: 'Andrés Felipe Mejía', group: t('Engineering', 'Ingeniería') },
    { name: 'Beatriz Londoño', group: t('Marketing', 'Marketing') },
    { name: 'Camilo Henao', group: t('Design', 'Diseño') },
    { name: 'Daniela Zapata', group: t('Missions', 'Misiones') },
    { name: 'Juan Pablo Gómez', group: t('Engineering', 'Ingeniería') },
    { name: 'Julián Ospina', group: t('Missions', 'Misiones') },
    { name: 'Luisa Fernanda Gil', group: t('Marketing', 'Marketing') },
    { name: 'Mariana Duque', group: t('Design', 'Diseño') },
    { name: 'Tomás Arango', group: t('Engineering', 'Ingeniería') },
  ];

  // Simulates a remote API call; the signal aborts stale searches.
  const searchMembers = (query: string, signal: AbortSignal): Promise<Member[]> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const q = query.toLowerCase();
        resolve(members.filter((m) => m.name.toLowerCase().includes(q)));
      }, 350);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });

  const add = (member: Member | null) => {
    if (member) setParticipants((list) => (list.some((p) => p.name === member.name) ? list : [...list, member]));
  };

  return (
    <div className="docs-stack">
      <Autocomplete<Member>
        label={t('Add participants', 'Agregar participantes')}
        placeholder={t('Search by name…', 'Busca por nombre…')}
        searchFn={searchMembers}
        itemText={(m) => m.name}
        clearOnSelect
        onSelectedItemChange={add}
        noResultsText={t('No results', 'Sin resultados')}
        searchingText={t('Searching…', 'Buscando…')}
      />
      <div className="docs-row">
        {participants.map((m) => (
          <Badge key={m.name} variant="lavender">
            {m.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
