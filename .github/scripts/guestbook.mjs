import { readFileSync, writeFileSync } from 'node:fs';

const START = '<!-- guestbook starts -->';
const END = '<!-- guestbook ends -->';
const KEEP = 5;
const MAX = 140;

// Issue bodies are untrusted public input rendered on a public profile page.
// Strip anything that could break out of the list item or inject markup.
const clean = (s) =>
  (s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[<>`|\\]/g, '')
    .replace(/[[\]()]/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX);

const message = clean(process.env.ISSUE_BODY);
const user = (process.env.ISSUE_USER || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 39);

if (!message || !user) {
  console.log('nothing usable in this issue; leaving README untouched');
  process.exit(0);
}

const readme = readFileSync('README.md', 'utf8');
const a = readme.indexOf(START);
const b = readme.indexOf(END);
if (a === -1 || b === -1) throw new Error('guestbook markers not found in README.md');

const existing = readme
  .slice(a + START.length, b)
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.startsWith('>'));

const entry = `> ${message}\n> <sub>— [@${user}](https://github.com/${user})</sub>`;
const kept = [entry, ...existing.join('\n').split(/\n(?=> (?!<sub))/).filter(Boolean)].slice(0, KEEP);

writeFileSync(
  'README.md',
  readme.slice(0, a + START.length) + '\n\n' + kept.join('\n\n') + '\n\n' + readme.slice(b)
);
console.log(`added entry from @${user}`);
