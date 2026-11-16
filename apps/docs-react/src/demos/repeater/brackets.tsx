import { useState, type CSSProperties } from 'react';
import { NumberInput, Repeater, TextInput } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface Bracket {
  from: number;
  to: number | null;
  rate: number;
}

const columns = { '--trazos-repeater-columns': '1fr 1fr 8rem' } as CSSProperties;

export default function Demo() {
  const [brackets, setBrackets] = useState<Bracket[]>([
    { from: 0, to: 95, rate: 0 },
    { from: 95, to: 150, rate: 0.19 },
    { from: 150, to: null, rate: 0.28 },
  ]);

  // Rows are immutable: replace the edited row with a copy.
  const update = (index: number, patch: Partial<Bracket>) => {
    setBrackets((list) => list.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  // A new tier starts 100 UVT after the last one.
  const createBracket = (items: readonly Bracket[]): Bracket => ({ from: (items.at(-1)?.from ?? -100) + 100, to: null, rate: 0 });

  // When a tier stops being the last one, it gets an upper bound: the start of the next tier.
  const closeTiers = (items: Bracket[]) =>
    items.map((b, i) => {
      const next = items[i + 1];
      return next && b.to === null ? { ...b, to: next.from } : b;
    });

  return (
    <div className="docs-stack">
      <Repeater<Bracket>
        items={brackets}
        onItemsChange={(next) => {
          setBrackets(closeTiers(next));
        }}
        createItem={createBracket}
        minItems={1}
        maxItems={6}
        label={t('Withholding brackets', 'Tramos de retención')}
        addText={t('Add bracket', 'Agregar tramo')}
        removeLabelFormat={t('Remove bracket {0}', 'Quitar tramo {0}')}
        style={columns}
        header={
          <>
            <span>{t('From (UVT)', 'Desde (UVT)')}</span>
            <span>{t('To (UVT)', 'Hasta (UVT)')}</span>
            <span>{t('Rate', 'Tarifa')}</span>
          </>
        }
        renderItem={({ item, index, isLast }) => (
          <>
            <NumberInput
              decimals={0}
              min={0}
              aria-label={t('From', 'Desde')}
              value={item.from}
              onValueChange={(v) => {
                update(index, { from: v ?? 0 });
              }}
            />
            {isLast ? (
              <TextInput aria-label={t('To', 'Hasta')} value={t('and above', 'en adelante')} readOnly />
            ) : (
              <NumberInput
                decimals={0}
                min={0}
                aria-label={t('To', 'Hasta')}
                value={item.to}
                onValueChange={(v) => {
                  update(index, { to: v });
                }}
              />
            )}
            <NumberInput
              mode="percent"
              min={0}
              max={1}
              aria-label={t('Rate', 'Tarifa')}
              value={item.rate}
              onValueChange={(v) => {
                update(index, { rate: v ?? 0 });
              }}
            />
          </>
        )}
      />
      <p className="docs-demo-output">
        {t('Brackets:', 'Tramos:')} <strong>{brackets.length}</strong>
      </p>
    </div>
  );
}
