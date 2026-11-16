import { useState } from 'react';
import { Autocomplete } from '@carandev/trazos-ui';
import { t } from '../../i18n';

const cities = ['Barranquilla', 'Bogotá', 'Bucaramanga', 'Cali', 'Cartagena', 'Manizales', 'Medellín', 'Pereira'];

export default function Demo() {
  const [city, setCity] = useState<string | null>(null);

  return (
    <div className="docs-stack">
      <Autocomplete<string>
        label={t('City', 'Ciudad')}
        placeholder={t('Type a letter…', 'Escribe una letra…')}
        items={cities}
        itemText={(c) => c}
        minChars={1}
        debounceMs={0}
        selectedItem={city}
        onSelectedItemChange={setCity}
        noResultsText={t('No results', 'Sin resultados')}
        clearText={t('Clear selection', 'Quitar selección')}
      />
      <p className="docs-demo-output">
        {t('Selected:', 'Seleccionado:')} <strong>{city ?? t('none', 'ninguno')}</strong>
      </p>
    </div>
  );
}
