import lint, { tree } from './p.mjs';
import * as fs from 'fs';
import * as YAML from '@stoplight/yaml';

const input = YAML.parse(fs.readFileSync('./pmmwvt2t3v.yaml', 'utf8'));

debugger;
console.time('woop');
lint(
  input,
  Object.fromEntries(
    ['$', '$.paths', '$.paths[*][get,put,post,delete,options,head,patch,trace]', ...Object.keys(tree)].map(k => [
      k,
      () => {},
    ]),
  ),
);
console.timeEnd('woop');
