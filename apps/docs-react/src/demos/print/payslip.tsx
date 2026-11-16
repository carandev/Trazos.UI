import { Button, Card, DescriptionItem, DescriptionList, NoPrint, PrintOnly, Ribbon } from '@carandev/trazos-ui';
import { t } from '../../i18n';

export default function Demo() {
  return (
    <div className="docs-stack">
      {/* The Ribbon is absolutely positioned: its parent needs position: relative. */}
      <Card style={{ position: 'relative' }} className="trazos-print-avoid-break">
        <Ribbon text={t('Paid', 'Pagado')} />
        <h3 className="trazos-heading">{t('Payslip · November 2026', 'Desprendible · Noviembre 2026')}</h3>
        <DescriptionList columns={2}>
          <DescriptionItem label={t('Employee', 'Empleado')} value="Ana María Restrepo" />
          <DescriptionItem label={t('Net pay', 'Neto a pagar')} value="$ 3.210.000" />
        </DescriptionList>
        <PrintOnly>
          <p>{t('Signature: ______________________', 'Firma: ______________________')}</p>
        </PrintOnly>
      </Card>
      <NoPrint>
        <Button variant="outline" onClick={() => window.print()}>
          {t('Print', 'Imprimir')}
        </Button>
      </NoPrint>
    </div>
  );
}
