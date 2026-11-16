import { useState } from 'react';
import { AutocompleteSelect } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface Company {
  id: string;
  name: string;
}

// Loaded once, for example from GET /companies.
const companies: Company[] = [
  { id: '0b5b3c1e-0001', name: 'Acme S.A.S.' },
  { id: '0b5b3c1e-0002', name: 'Globex Ltda.' },
  { id: '0b5b3c1e-0003', name: 'Initech Colombia' },
  { id: '0b5b3c1e-0004', name: 'Umbrella Andina' },
];

export default function Demo() {
  const [companyId, setCompanyId] = useState<string | null>(null);

  return (
    <div className="docs-stack">
      <AutocompleteSelect<Company, string>
        label={t('Company', 'Empresa')}
        placeholder={t('Type to filter', 'Escribe para filtrar')}
        items={companies}
        itemText={(c) => c.name}
        valueSelector={(c) => c.id}
        value={companyId}
        onValueChange={setCompanyId}
        noResultsText={t('No results', 'Sin resultados')}
        clearText={t('Clear selection', 'Quitar selección')}
      />
      <p className="docs-demo-output">
        {t('Company id:', 'Id de empresa:')} <strong>{companyId ?? 'null'}</strong>
      </p>
    </div>
  );
}
