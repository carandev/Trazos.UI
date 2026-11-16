import { useState } from 'react';
import { SelectInput, type SelectOption } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  const [team, setTeam] = useState<string | null>(null);

  // Typed options render the library list: it follows the theme, dark mode included.
  const teams: SelectOption[] = [
    { value: 'design', label: t('Design', 'Diseño') },
    { value: 'engineering', label: t('Engineering', 'Ingeniería') },
    { value: 'marketing', label: t('Marketing', 'Marketing') },
    { value: 'legal', label: t('Legal (no openings)', 'Legal (sin vacantes)'), disabled: true },
  ];

  return (
    <div className="docs-stack">
      <SelectInput
        label={t('Team', 'Equipo')}
        placeholder={t('Choose a team', 'Elige un equipo')}
        helperText={t('Open it with a click, or focus it and press the down arrow.', 'Ábrelo con un clic, o enfócalo y presiona la flecha hacia abajo.')}
        required
        options={teams}
        value={team}
        onValueChange={setTeam}
      />
      <p className="docs-demo-output">
        {t('Value:', 'Valor:')} <strong>{JSON.stringify(team)}</strong>
      </p>
    </div>
  );
}
