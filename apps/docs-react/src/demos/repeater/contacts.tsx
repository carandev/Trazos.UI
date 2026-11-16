import { useState } from 'react';
import { Repeater, SelectInput, TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface Contact {
  name: string;
  relation: string;
}

export default function Demo() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const update = (index: number, patch: Partial<Contact>) => {
    setContacts((list) => list.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  return (
    <div className="docs-stack">
      <Repeater<Contact>
        items={contacts}
        onItemsChange={setContacts}
        createItem={() => ({ name: '', relation: '' })}
        maxItems={3}
        label={t('Emergency contacts', 'Contactos de emergencia')}
        addText={t('Add contact', 'Agregar contacto')}
        removeLabelFormat={t('Remove contact {0}', 'Quitar contacto {0}')}
        emptyContent={t('No emergency contacts yet.', 'Aún no hay contactos de emergencia.')}
        renderItem={({ item, index }) => (
          <>
            <TextInput
              label={t('Name', 'Nombre')}
              value={item.name}
              onValueChange={(name) => {
                update(index, { name });
              }}
            />
            <SelectInput
              label={t('Relation', 'Parentesco')}
              placeholder={t('Choose', 'Elige')}
              value={item.relation}
              onValueChange={(relation) => {
                update(index, { relation });
              }}
            >
              <option value="partner">{t('Partner', 'Pareja')}</option>
              <option value="parent">{t('Parent', 'Padre o madre')}</option>
              <option value="friend">{t('Friend', 'Amigo')}</option>
            </SelectInput>
          </>
        )}
      />
      <p className="docs-demo-output">
        {t('Contacts:', 'Contactos:')} <strong>{contacts.length}</strong> / 3
      </p>
    </div>
  );
}
