import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const START = '<!-- guestbook starts -->';
const END = '<!-- guestbook ends -->';
const KEEP = 5;
const MAX = 140;
const PLACEHOLDER = 'write your message here. it will appear on my profile with your username.';

// Issue bodies are untrusted public input rendered on a public profile page.
// Strip anything that could break out of the entry or render as something other
// than the plain sentence it claims to be, then escape whatever is left.
const clean = (s) =>
  (s || '')
    .normalize('NFKC')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<![^>]*>/g, ' ')
    // Only real tag shapes, so a bare "x<y, but z >0" keeps its words.
    .replace(/<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^<>]*)?\/?>/g, ' ')
    // GitHub decodes character references at render time, so an entity-encoded
    // bidi control would survive a filter that only looks at literal codepoints.
    .replace(/&(?:#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,31});/g, ' ')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    // Every format character - bidi overrides, zero widths, ALM, interlinear
    // annotation - except ZWNJ/ZWJ, load-bearing in Persian, Hindi and emoji.
    .replace(/[^\P{Cf}\u200C\u200D]/gu, '')
    // Invisible but not Cf: Hangul fillers and Khmer inherent vowels render blank.
    .replace(/[\u115F\u1160\u3164\uFFA0\u17B4\u17B5]/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/[`|\\]/g, '')
    .replace(/[[\]()]/g, '')
    .replace(/[*_~#=]/g, '')
    // A bare @name autolinks into a mention that pings a real account.
    .replace(/@/g, ' ')
    .replace(/^(?:[\s>+\-!.]+|\d+[.)]\s*)+/, '')
    .replace(/\s+/g, ' ')
    .trim();

// Angle brackets and ampersands stay as text, so no tag or entity can re-form.
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Slice by grapheme: a code-point cut still splits flags and ZWJ sequences.
const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
const clip = (s) => [...seg.segment(s)].slice(0, MAX).map((g) => g.segment).join('');

const message = clip(clean(process.env.ISSUE_BODY));
const user = (process.env.ISSUE_USER || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 39);
const issue = (process.env.ISSUE_NUMBER || '').replace(/\D/g, '');

const report = (added, reason) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `added=${added}\n`);
  console.log(reason);
};

// A message of only punctuation survives the filters but renders as noise, and
// the prefilled body is an instruction to the visitor, not something to publish.
if (!user || !/[\p{L}\p{N}]/u.test(message) || message.toLowerCase() === PLACEHOLDER) {
  report(false, 'nothing usable in this issue; leaving README untouched');
  process.exit(0);
}

const readme = readFileSync('README.md', 'utf8');
const a = readme.indexOf(START);
const b = readme.indexOf(END);
if (a === -1 || b === -1) throw new Error('guestbook markers not found in README.md');

const region = readme.slice(a + START.length, b);
const tag = issue ? `<!-- gb:${issue} -->` : '';

// A rerun after a push that already landed must not prepend the same entry twice.
if (tag && region.includes(tag)) {
  report(false, `issue ${issue} is already in the guestbook`);
  process.exit(0);
}

const existing = region
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.startsWith('>'));

const entry = `> ${escape(message)}\n> <sub>— [@${user}](https://github.com/${user})</sub>${tag}`;
const kept = [entry, ...existing.join('\n').split(/\n(?=> (?!<sub))/).filter(Boolean)].slice(0, KEEP);

writeFileSync(
  'README.md',
  readme.slice(0, a + START.length) + '\n\n' + kept.join('\n\n') + '\n\n' + readme.slice(b)
);
report(true, `added entry from @${user}`);
