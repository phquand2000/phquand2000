import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const START = '<!-- guestbook starts -->';
const END = '<!-- guestbook ends -->';
const KEEP = 5;
const MAX = 140;

// Issue bodies are untrusted public input rendered on a public profile page.
// Strip anything that could break out of the list item, inject markup, or
// render as something other than the plain sentence it claims to be.
const clean = (s) =>
  (s || '')
    .normalize('NFKC')
    .replace(/<\/?[a-zA-Z!][^>]*>/g, ' ')
    // GitHub decodes character references at render time, so an entity-encoded
    // bidi control would survive a filter that only looks at literal codepoints.
    .replace(/&(?:#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,31});/g, ' ')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/[\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/[<>`|\\]/g, '')
    .replace(/[[\]()]/g, '')
    .replace(/[*_~#=]/g, '')
    // A bare @name autolinks into a mention that pings a real account.
    .replace(/@/g, ' ')
    .replace(/^[\s>+\-!.\d]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

// Slice by code point: a UTF-16 cut can split an emoji into a lone surrogate.
const clip = (s) => [...s].slice(0, MAX).join('');

const message = clip(clean(process.env.ISSUE_BODY));
const user = (process.env.ISSUE_USER || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 39);

const report = (added, reason) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `added=${added}\n`);
  console.log(reason);
};

// A message of only punctuation survives the filters but renders as noise.
if (!user || !/[\p{L}\p{N}]/u.test(message)) {
  report(false, 'nothing usable in this issue; leaving README untouched');
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
report(true, `added entry from @${user}`);
