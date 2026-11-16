import { useState } from 'react';
import { Button, Checkbox, Drawer, SelectInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState('');
  const [upcoming, setUpcoming] = useState(true);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {t('Open drawer', 'Abrir panel')}
      </Button>

      <Drawer open={open} onOpenChange={setOpen} title={t('Filters', 'Filtros')}>
        <div className="docs-stack">
          <SelectInput
            label={t('Team', 'Equipo')}
            placeholder={t('Any', 'Cualquiera')}
            value={team}
            onValueChange={setTeam}
          >
            <option value="design">{t('Design', 'Diseño')}</option>
            <option value="engineering">{t('Engineering', 'Ingeniería')}</option>
          </SelectInput>
          <Checkbox
            label={t('Only upcoming events', 'Solo próximos eventos')}
            checked={upcoming}
            onCheckedChange={setUpcoming}
          />
          <Button onClick={() => setOpen(false)}>{t('Apply', 'Aplicar')}</Button>
        </div>
      </Drawer>
    </>
  );
}
