import { DescriptionItem, DescriptionList } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  // Up to four columns, each at least 10rem wide: the grid drops columns as the space shrinks.
  return (
    <DescriptionList columns={4} minItemWidth="10rem">
      <DescriptionItem label={t('Document', 'Documento')} value="CC 1.020.304.050" />
      <DescriptionItem label={t('Contract', 'Contrato')} value={t('Open-ended', 'Indefinido')} />
      <DescriptionItem label={t('Schedule', 'Jornada')} value={t('Full time', 'Tiempo completo')} />
      <DescriptionItem label={t('Cost center', 'Centro de costo')} value="FIN-204" />
      <DescriptionItem
        label={t('Health insurer', 'EPS')}
        value={t('Health insurer with a very long registered name, S.A.S.', 'Entidad promotora de salud con un nombre registrado muy largo S.A.S.')}
        span={2}
      />
      <DescriptionItem label={t('Pension fund', 'Fondo de pensiones')} value="Protección" />
      <DescriptionItem label={t('Risk class', 'Clase de riesgo')} value="I" />
      <DescriptionItem
        label={t('Notes', 'Notas')}
        value={t(
          'Works remotely on Fridays. Approved by the finance manager in the January review.',
          'Trabaja en remoto los viernes. Aprobado por la gerencia financiera en la revisión de enero.',
        )}
        fullWidth
      />
    </DescriptionList>
  );
}
