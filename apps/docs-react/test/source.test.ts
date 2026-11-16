import { toDisplaySource } from '../src/source';

const raw = `import { Badge } from '@carandev/trazos-ui';
import { t } from '../../i18n';
import { CheckIcon } from '../../icons';

export default function Demo() {
  return (
    <Badge variant="success" title={t('Status', 'Estado')} leadingIcon={<CheckIcon />}>
      {t('Confirmed', 'Confirmado')}
    </Badge>
  );
}
`;

describe('toDisplaySource', () => {
  it('drops the i18n import and points local helpers at ./', () => {
    const code = toDisplaySource(raw, 'en');
    expect(code).not.toContain('i18n');
    expect(code).toContain(`import { CheckIcon } from './icons';`);
  });

  it('writes each t() call as plain text in the chosen language', () => {
    expect(toDisplaySource(raw, 'en')).toContain(`title="Status"`);
    expect(toDisplaySource(raw, 'en')).toContain(`\n      Confirmed\n`);
    expect(toDisplaySource(raw, 'es')).toContain(`title="Estado"`);
    expect(toDisplaySource(raw, 'es')).toContain(`\n      Confirmado\n`);
  });

  it('keeps t() inside expressions as a string literal', () => {
    const code = toDisplaySource(`const label = t('It\\'s on', 'Está activo');\n`, 'en');
    expect(code).toBe(`const label = 'It\\'s on';`);
  });

  it('falls back to an expression when an attribute value has a double quote', () => {
    const code = toDisplaySource(`<Badge title={t('Say "hi"', 'Di "hola"')} />`, 'en');
    expect(code).toBe(`<Badge title={'Say "hi"'} />`);
  });

  it('escapes braces and angle brackets in JSX text', () => {
    const code = toDisplaySource(`<p>{t('Use {name} < 3', 'Usa {name} < 3')}</p>`, 'en');
    expect(code).toBe(`<p>{'Use {name} < 3'}</p>`);
  });

  it('accepts t() calls split over several lines', () => {
    const code = toDisplaySource(`<p>{t(\n  'A long sentence',\n  'Una frase larga',\n)}</p>`, 'es');
    expect(code).toBe(`<p>Una frase larga</p>`);
  });
});
