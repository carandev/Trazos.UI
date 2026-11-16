import { useState } from 'react';
import { RadioCardGroup, type RadioCardOption } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { HomeIcon, UserIcon } from '../../icons';

export default function Demo() {
  const [visibility, setVisibility] = useState('public');

  const options: RadioCardOption<string>[] = [
    {
      value: 'public',
      title: t('Public', 'Público'),
      description: t('Anyone can see it on the shared calendar.', 'Cualquier persona puede verlo en el calendario compartido.'),
      icon: <HomeIcon />,
    },
    {
      value: 'members',
      title: t('Members only', 'Solo miembros'),
      description: t('Only registered members can see it.', 'Solo los miembros registrados pueden verlo.'),
      icon: <UserIcon />,
    },
  ];

  return (
    <div className="docs-stack">
      <RadioCardGroup
        label={t('Event visibility', 'Visibilidad del evento')}
        helperText={t('You can change it later.', 'Puedes cambiarla más adelante.')}
        options={options}
        value={visibility}
        onValueChange={setVisibility}
      />
      <p className="docs-demo-output">
        {t('Value:', 'Valor:')} <strong>{visibility}</strong>
      </p>
    </div>
  );
}
