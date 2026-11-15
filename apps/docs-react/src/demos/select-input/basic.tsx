import { useState } from 'react';
import { SelectInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [team, setTeam] = useState('');

  return (
    <div className="docs-stack">
      <SelectInput
        label={t('Team', 'Equipo')}
        placeholder={t('Choose a team', 'Elige un equipo')}
        required
        value={team}
        onValueChange={setTeam}
      >
        <option value="design">{t('Design', 'Diseño')}</option>
        <option value="engineering">{t('Engineering', 'Ingeniería')}</option>
        <option value="marketing">{t('Marketing', 'Marketing')}</option>
      </SelectInput>
      <p className="docs-demo-output">
        {t('Value:', 'Valor:')} <strong>{JSON.stringify(team)}</strong>
      </p>
    </div>
  );
}
