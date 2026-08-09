#!/usr/bin/env node
// check-enumerations.mjs — does every stated count match the tree it counts?
//
// "The 39 skills", "the 5 fresh-context personas", "Twelve slash commands". Each is a fact about the
// repository written down in prose, and nothing keeps it true. This recomputes each one and diffs it
// against every place that states it.
//
// WHY IT EXISTS, and it is not a hypothetical. Every hand-priced enumeration in the v2 build measured
// wrong — nine of them, every one short, and the shortfall was never noticed by anyone reading the
// sentence. One said seven sections where there were eight, which would have shipped a duplicated
// registry section into the block a cold agent reads first. Another said 39 skills against a measured
// 40, in one of two twin files, while the twin already said 40. A reader does not recount; a reader
// reads "39" and moves on. This is the check that recounts.
//
// IT COUNTS THE TOTAL, NOT A SUBSET, and telling them apart is the whole difficulty. "Six skills end
// with a `## Subagents` pointer" and "The 40 skills" are the same three words in the same order; only
// one is a claim about the whole tree. A first version matched both and reported ten hits, every one of
// them false — which is worse than reporting nothing, because a check that only ever cries wolf is one
// people learn to skip.
//
// So a total is recognised by its *frame*, not by its noun. Two frames state one in this repository and
// nothing else uses either: a definite article with the number immediately after it (`The 40 skills`),
// and a structure-block arrow (`skills/ → 40 skills`). Every subset claim in the tree fails both —
// "eight skills carry one", "the other four personas", "two or three skills" — because English does not
// front a subset with a bare definite article. A total worded some third way goes unchecked, and the
// completeness assertion below is what keeps that from being silent: each registry must be claimed
// somewhere, so deleting the only sentence that states a count fails rather than passes.
//
// WHAT IT DOES NOT REACH. Only the three registries below, because only these three are countable from
// the tree without being told what to count. A sentence pricing something else — the sections in a
// block, the rows in a table, the steps in a process — is invisible here and has to be measured by
// hand. Those are exactly the ones that went wrong most often, so measure them: do not read a count in
// this repository without running the command that produces it.
//
// NOTHING RUNS THIS FOR YOU. .github/workflows/companion-tests.yml is path-filtered to
// skills/frontend-design/scripts/**, so this directory is covered by no job at all. It is on the pre-PR
// list in CONTRIBUTING.md because in a prose repository the checker is a person.
//
//   node scripts/check-enumerations.mjs             check, and report every mismatch
//   node scripts/check-enumerations.mjs --list      print every claim found and its verdict, and stop
//   node scripts/check-enumerations.mjs --root DIR  run against DIR instead of the repository root
//
// Exit codes:  0 nothing to report · 1 a stated count is wrong · 2 the tree cannot be counted

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Prose here spells small numbers out, so both spellings have to be read. Reading only digits missed
// "Twelve slash commands" entirely.
const WORDS = new Map(Object.entries({
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
}));
const NUMBER = `(\\d+|${[...WORDS.keys()].join('|')})`;

function valueOf(token) {
  const lower = token.toLowerCase();
  return WORDS.has(lower) ? WORDS.get(lower) : Number(token);
}

// A directory is skipped whole. `.claude` holds a second checkout of this repository at a different
// commit: counting there prices a tree that is not the one shipping.
const SKIP = new Set(['.git', '.claude', '.handoff', '.gauntlet', 'node_modules']);

const argv = process.argv.slice(2);
const listOnly = argv.includes('--list');
const rootFlag = argv.indexOf('--root');
const ROOT = rootFlag !== -1 && argv[rootFlag + 1]
  ? argv[rootFlag + 1]
  : join(dirname(fileURLToPath(import.meta.url)), '..');

function die(message) {
  console.error(`check-enumerations: ${message}`);
  process.exit(2);
}

function countDirsWith(dir, file) {
  const path = join(ROOT, dir);
  if (!existsSync(path)) die(`no ${dir}/ directory under ${ROOT}`);
  return readdirSync(path).filter(name => existsSync(join(path, name, file))).length;
}

function countFiles(dir, suffix) {
  const path = join(ROOT, dir);
  if (!existsSync(path)) die(`no ${dir}/ directory under ${ROOT}`);
  return readdirSync(path).filter(name => name.endsWith(suffix)).length;
}

// The two frames that state a total, and nothing else. `The` has to sit immediately before the number:
// "the other four personas" is a subset and stays one, because the number does not follow the article.
const FRAME = `(?:\\bthe\\s+|→\\s*)`;

// Each registry: what it counts, how to count it, and the noun phrase that states the total, always
// behind a frame. The adjective group is closed on purpose — see the header.
const REGISTRIES = [
  {
    label: 'skills',
    measure: () => countDirsWith('skills', 'SKILL.md'),
    source: 'skills/*/SKILL.md',
    rx: new RegExp(`${FRAME}${NUMBER}\\s+skills\\b`, 'gi'),
  },
  {
    label: 'personas',
    measure: () => countFiles('agents', '.md'),
    source: 'agents/*.md',
    rx: new RegExp(`${FRAME}${NUMBER}\\s+(?:review\\s+|fresh-context\\s+)?personas\\b`, 'gi'),
  },
  {
    label: 'commands',
    measure: () => countFiles('commands', '.md'),
    source: 'commands/*.md',
    rx: new RegExp(`${FRAME}${NUMBER}\\s+(?:slash\\s+)?commands\\b`, 'gi'),
  },
];

// A partition has to add back up to its whole. Two spellings are in the tree: the compact
// "9 lifecycle + 3 standalone", and the prose "nine lifecycle commands … three standalone commands"
// spread across a sentence. Both are read against the command count.
const PARTITIONS = [
  {
    label: 'commands',
    rx: new RegExp(`\\b${NUMBER}\\s+lifecycle\\s*\\+\\s*${NUMBER}\\s+standalone\\b`, 'gi'),
    parts: m => [valueOf(m[1]), valueOf(m[2])],
  },
  {
    label: 'commands',
    rx: new RegExp(`\\b${NUMBER}\\s+lifecycle\\s+commands\\b[\\s\\S]{0,240}?\\b${NUMBER}\\s+standalone\\s+commands\\b`, 'gi'),
    parts: m => [valueOf(m[1]), valueOf(m[2])],
  },
];

function markdownFiles(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) markdownFiles(path, out);
    else if (name.endsWith('.md')) out.push(path);
  }
  return out;
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

// ---------------------------------------------------------------- run

const measured = new Map();
for (const reg of REGISTRIES) measured.set(reg.label, reg.measure());

const claims = [];
for (const path of markdownFiles(ROOT)) {
  const rel = relative(ROOT, path);
  const source = readFileSync(path, 'utf8');

  for (const reg of REGISTRIES) {
    const rx = new RegExp(reg.rx.source, reg.rx.flags);
    let m;
    while ((m = rx.exec(source)) !== null) {
      const stated = valueOf(m[1]);
      claims.push({
        rel, line: lineOf(source, m.index), label: reg.label, source: reg.source,
        stated, actual: measured.get(reg.label), text: m[0].replace(/\s+/g, ' '),
        ok: stated === measured.get(reg.label),
      });
    }
  }

  for (const part of PARTITIONS) {
    const rx = new RegExp(part.rx.source, part.rx.flags);
    let m;
    while ((m = rx.exec(source)) !== null) {
      const [a, b] = part.parts(m);
      const total = measured.get(part.label);
      claims.push({
        rel, line: lineOf(source, m.index), label: `${part.label} (partition)`,
        source: `${a} + ${b}`, stated: a + b, actual: total,
        text: m[0].replace(/\s+/g, ' ').slice(0, 90), ok: a + b === total,
      });
    }
  }
}

if (listOnly) {
  for (const c of claims) {
    console.log(`${c.ok ? 'ok     ' : 'WRONG  '} ${c.rel}:${c.line}\t${c.label}\tsays ${c.stated}, is ${c.actual}\t"${c.text}"`);
  }
  console.log(`\n${claims.length} claims across ${new Set(claims.map(c => c.rel)).size} files.`);
  for (const [label, n] of measured) console.log(`  ${label}: ${n}`);
  process.exit(0);
}

// A registry nobody states is a registry this check cannot keep true. Without this, deleting the one
// sentence that prices a tree turns a failing check green — the quietest way there is to pass.
const unclaimed = REGISTRIES.filter(reg => !claims.some(c => c.label === reg.label));
for (const reg of unclaimed) {
  console.log(`UNSTATED    no file states a total for ${reg.label}`);
  console.log(`            ${reg.source} measures ${measured.get(reg.label)}, and nothing in the tree says so.`);
  console.log(`            A count this check cannot find is a count it cannot keep true. State it, in`);
  console.log(`            the form "The N ${reg.label}" or a structure-block arrow, or this stays silent forever.`);
  console.log('');
}

const wrong = claims.filter(c => !c.ok);
for (const c of wrong) {
  console.log(`WRONG       ${c.rel}:${c.line} — "${c.text}"`);
  console.log(`            states ${c.stated} ${c.label}; ${c.source} measures ${c.actual}.`);
  console.log(`            Correct the sentence, and look for its twin: a count is almost never written once.`);
  console.log('');
}

const parts = [...measured].map(([label, n]) => `${n} ${label}`).join(' · ');
console.log(`${claims.length} stated counts checked across ${new Set(claims.map(c => c.rel)).size} files · measured ${parts}`);
if (!wrong.length && !unclaimed.length) {
  console.log('Every stated count matches the tree it counts.');
  console.log('Counts outside these three registries are unreachable from here. Measure those by hand.');
  process.exit(0);
}
if (wrong.length) console.log(`${wrong.length} wrong: ${[...new Set(wrong.map(c => `${c.rel}:${c.line}`))].join(', ')}`);
if (unclaimed.length) console.log(`${unclaimed.length} unstated: ${unclaimed.map(r => r.label).join(', ')}`);
process.exit(1);
