// Fails the build when the shipped stylesheet defines a class without the
// `trazos-` prefix. React CSS is global, so such a class would style any host
// element that happens to use the same name.
import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'dist/styles.css';
const css = readFileSync(path, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/@(import|charset)[^;]*;/g, '');

const unprefixed = new Set();
for (const [selector] of css.matchAll(/[^{}]+(?=\{)/g)) {
  if (selector.trim().startsWith('@')) continue;
  for (const match of selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    if (!match[1].startsWith('trazos-')) unprefixed.add(match[1]);
  }
}

if (unprefixed.size > 0) {
  console.error(`${path} defines classes without the trazos- prefix:\n  ${[...unprefixed].sort().join('\n  ')}`);
  process.exit(1);
}
console.log(`${path}: every class starts with trazos-`);
