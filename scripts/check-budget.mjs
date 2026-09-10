#!/usr/bin/env node
// check-budget.mjs — does every file fit the size budget the ADRs set?
//
// v2's size rules are numbers, so a script owns them instead of a reviewer's eye. v2 sets the
// skill ceilings and makes this counter the DEFINITION of an instruction rather than a measurement of
// one; v2 also sets the reference and command ceilings.
//
//   skills/<name>/SKILL.md                     ≤40 instructions · ≤300 body lines · description ≤400 chars
//   the suite                                  Σ SKILL.md words ≤65,000  (reported always; enforced on a whole-tree run)
//   references/*.md and skills/*/references/*.md   ≤150 lines each
//   references/ at the top level               Σ words ≤5,000
//   commands/*.md                              ≤150 words, frontmatter excluded
//
// Every ceiling is INCLUSIVE: 40 instructions passes and 41 fails; a 400-character description passes
// and 401 fails (acceptance V2-A11, V2-A12).
//
// WHAT IT CANNOT DO. It counts; it cannot read. Forty vague instructions pass and forty-one sharp ones
// fail — a budget is not a grade. The instruction counter is a rule about sentence SHAPE: a rule
// phrased as a question ("Is the test red?") is not counted, and a narrative sentence that happens to
// open with a listed verb is. That is why the list below is the definition and not an approximation of
// one. The mean description length is printed and never enforced — V2-A12 wants ~250 as an aim.
//
// THE INSTRUCTION COUNT READS THE WHOLE FILE, frontmatter included, because that is what
// research/codebase/measure.mjs did when it produced the defB numbers the 40 was set against, and
// two counters that disagree about what they measure cannot be compared. So `name: <x>` is itself one
// instruction — `name` is a verb on the list — and a directive description costs a few more. Every
// skill pays that overhead, and the ceiling was calibrated with it paid. Body LINES and description
// CHARACTERS are measured separately and exclude what the other one covers.
//
//   node scripts/check-budget.mjs                     the whole tree
//   node scripts/check-budget.mjs skills/a skills/b   those skills only (suite total reported, not enforced)
//   node scripts/check-budget.mjs --json              one JSON object instead of the rows
//   node scripts/check-budget.mjs --root DIR          run against DIR instead of the repository root
//
// A whole-tree run needs all three of `skills/`, `references/` and `commands/`; it exits 2 rather than
// quietly reporting a budget for a directory it never read.
//
// Exit codes:  0 everything fits · 1 something is over · 2 a directory named here is not there

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------- the definition

// EDITING THIS LIST CHANGES EVERY COUNT IN THE TREE. An instruction is a sentence whose first token is
// one of these verbs, or that carries a modal below; add a verb and skills that were inside the budget
// can go over it without a word of their prose changing. It is alphabetised so a duplicate is visible.
// `dont` / `don’t` are both here because the tokenizer strips a straight apostrophe and not a curly one.
const VERBS = new Set([
  'add', 'always', 'announce', 'append', 'apply', 'ask', 'build', 'call', 'check', 'choose', 'cite',
  'close', 'commit', 'compare', 'confirm', 'copy', 'count', 'create', 'cut', 'decide', 'delete',
  'derive', 'describe', 'dispatch', 'do', 'dont', 'don’t', 'draft', 'edit', 'emit', 'end', 'ensure',
  'fix', 'flip', 'follow', 'generate', 'grade', 'grep', 'hand', 'identify', 'include', 'invoke',
  'keep', 'list', 'load', 'log', 'mark', 'measure', 'merge', 'move', 'name', 'never', 'note', 'open',
  'pick', 'place', 'present', 'produce', 'prove', 'pull', 'push', 'put', 're-run', 'read', 'record',
  'refuse', 'remove', 'rename', 'repeat', 'replace', 'report', 'rerun', 'return', 'review', 'rewrite',
  'run', 'save', 'scan', 'select', 'send', 'set', 'show', 'sign', 'skip', 'split', 'start', 'state',
  'stop', 'summarise', 'summarize', 'test', 'trace', 'treat', 'update', 'use', 'verify', 'wait',
  'walk', 'watch', 'write',
]);

// The other half of the definition: a sentence carrying one of these is an instruction whatever it
// opens with, because it binds behaviour rather than describing it.
const MODAL = /\b(?:must|never|always|do not|don['’]t|refuse[sd]?|only|required|forbidden|stop)\b/i;

const CEILINGS = {
  instructions: 40,
  bodyLines: 300,
  descriptionChars: 400,
  suiteWords: 65000,
  referenceLines: 150,
  referenceWords: 5000,
  commandWords: 150,
};

// Reported, never enforced (V2-A12).
const MEAN_DESCRIPTION_AIM = 250;

// ---------------------------------------------------------------- shared measurement helpers
//
// Lifted from research/codebase/measure.mjs so the v2 numbers are commensurable with the v1 survey
// that set the ceilings. Change one of these and the two stop measuring the same thing.

/** Mark every line inside a ``` fence (the fence lines themselves are marked too). */
function fenceMask(lines) {
  const mask = new Array(lines.length).fill(false);
  let open = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { mask[i] = true; open = !open; continue; }
    mask[i] = open;
  }
  return mask;
}

const isTableLine = (l) => /^\s*\|/.test(l);

/** Parse YAML frontmatter; handles inline, wrapped-plain, and folded/literal block scalars. */
function parseFrontmatter(lines) {
  if (lines[0] !== '---') return { fm: {}, endLine: -1 };
  let end = -1;
  for (let i = 1; i < lines.length; i++) if (lines[i] === '---') { end = i; break; }
  if (end === -1) return { fm: {}, endLine: -1 };
  const fm = {};
  let key = null, buf = [];
  const flush = () => {
    if (key === null) return;
    fm[key] = buf.join(' ').replace(/\s+/g, ' ').trim();
    key = null; buf = [];
  };
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (m && !/^\s/.test(line)) {
      flush();
      key = m[1];
      const v = m[2];
      if (v === '>' || v === '>-' || v === '|' || v === '|-' || v === '') buf = [];
      else buf = [v.replace(/^["']|["']$/g, '')];
    } else if (key !== null && line.trim() !== '') {
      buf.push(line.trim());
    }
  }
  flush();
  return { fm, endLine: end };
}

/** Strip markdown leading syntax so a sentence's first token is its first word. */
function stripLead(l) {
  return l
    .replace(/^\s*>+\s*/, '')
    .replace(/^\s*#{1,6}\s+/, '')
    .replace(/^\s*([-*+])\s+\[[ xX]\]\s*/, '')
    .replace(/^\s*([-*+])\s+/, '')
    .replace(/^\s*\d+[.)]\s+/, '')
    .replace(/^\s*\*\*/, '')
    .trim();
}

const firstToken = (s) =>
  (s.replace(/[`*_"'“‘(\[]/g, '').trim().split(/[\s,.;:!?]+/)[0] || '').toLowerCase();

/** Sentences outside code fences and tables. */
function sentences(lines, mask) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (mask[i]) continue;
    const raw = lines[i];
    if (isTableLine(raw)) continue;
    const s = stripLead(raw);
    if (!s) continue;
    for (const part of s.split(/(?<=[.!?])[\s ]+/)) {
      const t = part.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

/** `wc -l` semantics: a trailing newline does not open a further line. */
const lineCount = (text) => {
  const n = text.split('\n').length;
  return text.endsWith('\n') ? n - 1 : n;
};

const wordCount = (text) => (text.match(/\S+/g) || []).length;

function countInstructions(lines, mask) {
  let n = 0;
  for (const s of sentences(lines, mask)) {
    if (MODAL.test(s) || VERBS.has(firstToken(s))) n++;
  }
  return n;
}

// ---------------------------------------------------------------- per-file measurement

function measureSkill(rel, text) {
  const lines = text.split('\n');
  const mask = fenceMask(lines);
  const { fm, endLine } = parseFrontmatter(lines);
  const total = lineCount(text);
  return {
    path: rel,
    kind: 'skill',
    instructions: countInstructions(lines, mask),
    bodyLines: endLine >= 0 ? total - (endLine + 1) : total,
    descriptionChars: (fm.description || '').length,
    words: wordCount(text),
  };
}

function measureReference(rel, text, scope) {
  return { path: rel, kind: 'reference', scope, lines: lineCount(text), words: wordCount(text) };
}

function measureCommand(rel, text) {
  const lines = text.split('\n');
  const { endLine } = parseFrontmatter(lines);
  const body = endLine >= 0 ? lines.slice(endLine + 1).join('\n') : text;
  return { path: rel, kind: 'command', words: wordCount(body), lines: lineCount(text) };
}

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const rootFlag = argv.indexOf('--root');
const ROOT = rootFlag !== -1 && argv[rootFlag + 1]
  ? argv[rootFlag + 1]
  : join(dirname(fileURLToPath(import.meta.url)), '..');

const targets = argv.filter((a, i) => !a.startsWith('--') && !(rootFlag !== -1 && i === rootFlag + 1));

function die(message) {
  console.error(`check-budget: ${message}`);
  process.exit(2);
}

const read = (abs) => readFileSync(abs, 'utf8');
const isFile = (abs) => existsSync(abs) && statSync(abs).isFile();
const isDir = (abs) => existsSync(abs) && statSync(abs).isDirectory();

// ---------------------------------------------------------------- collect

const rows = [];

function addSkill(name) {
  const rel = `skills/${name}/SKILL.md`;
  const abs = join(ROOT, rel);
  if (!isFile(abs)) die(`${rel} does not exist under ${ROOT}`);
  rows.push(measureSkill(rel, read(abs)));
  const refDir = join(ROOT, 'skills', name, 'references');
  if (!isDir(refDir)) return;
  for (const f of readdirSync(refDir).sort()) {
    if (!f.endsWith('.md')) continue;
    const r = `skills/${name}/references/${f}`;
    if (isFile(join(ROOT, r))) rows.push(measureReference(r, read(join(ROOT, r)), 'skill'));
  }
}

let mode;
if (targets.length) {
  mode = 'targets';
  for (const t of targets) {
    // `skills/<name>` and `skills/<name>/SKILL.md` both name the same skill.
    const m = /^skills[/\\]([^/\\]+)(?:[/\\]SKILL\.md)?[/\\]?$/.exec(t);
    if (!m) die(`\`${t}\` is not a skill path — pass \`skills/<name>\``);
    if (!isDir(join(ROOT, 'skills', m[1]))) die(`no skills/${m[1]} directory under ${ROOT}`);
    addSkill(m[1]);
  }
} else {
  mode = 'tree';
  const skillsDir = join(ROOT, 'skills');
  if (!isDir(skillsDir)) die(`no skills/ directory under ${ROOT}`);
  for (const name of readdirSync(skillsDir).sort()) {
    if (isFile(join(skillsDir, name, 'SKILL.md'))) addSkill(name);
  }
  // A whole-tree run that quietly skips a directory that is not there would report a budget it never
  // measured — the exact silence the other checks in this directory die on. So it dies too.
  const refDir = join(ROOT, 'references');
  if (!isDir(refDir)) die(`no references/ directory under ${ROOT}`);
  for (const f of readdirSync(refDir).sort()) {
    if (!f.endsWith('.md')) continue;
    const rel = `references/${f}`;
    if (isFile(join(ROOT, rel))) rows.push(measureReference(rel, read(join(ROOT, rel)), 'top'));
  }
  const cmdDir = join(ROOT, 'commands');
  if (!isDir(cmdDir)) die(`no commands/ directory under ${ROOT}`);
  for (const f of readdirSync(cmdDir).sort()) {
    if (!f.endsWith('.md')) continue;
    const rel = `commands/${f}`;
    if (isFile(join(ROOT, rel))) rows.push(measureCommand(rel, read(join(ROOT, rel))));
  }
}

// ---------------------------------------------------------------- compare

const breaches = [];
const over = (path, measure, value, ceiling) => breaches.push({ path, measure, value, ceiling });

for (const r of rows) {
  if (r.kind === 'skill') {
    if (r.instructions > CEILINGS.instructions) over(r.path, 'instructions', r.instructions, CEILINGS.instructions);
    if (r.bodyLines > CEILINGS.bodyLines) over(r.path, 'body-lines', r.bodyLines, CEILINGS.bodyLines);
    if (r.descriptionChars > CEILINGS.descriptionChars) over(r.path, 'description-chars', r.descriptionChars, CEILINGS.descriptionChars);
  } else if (r.kind === 'reference') {
    if (r.lines > CEILINGS.referenceLines) over(r.path, 'lines', r.lines, CEILINGS.referenceLines);
  } else if (r.kind === 'command') {
    if (r.words > CEILINGS.commandWords) over(r.path, 'words', r.words, CEILINGS.commandWords);
  }
}

const skills = rows.filter((r) => r.kind === 'skill');
const references = rows.filter((r) => r.kind === 'reference');
const commands = rows.filter((r) => r.kind === 'command');

const suiteWords = skills.reduce((n, r) => n + r.words, 0);
const topReferenceWords = references.filter((r) => r.scope === 'top').reduce((n, r) => n + r.words, 0);
const meanDescription = skills.length
  ? Math.round(skills.reduce((n, r) => n + r.descriptionChars, 0) / skills.length)
  : 0;

// A run over some skills has not read the suite, so its total is a partial one and enforcing it would
// pass anything. Reported in both modes, enforced only when the whole tree was walked.
if (mode === 'tree') {
  if (suiteWords > CEILINGS.suiteWords) over('skills/*/SKILL.md', 'suite-words', suiteWords, CEILINGS.suiteWords);
  if (topReferenceWords > CEILINGS.referenceWords) over('references/*.md', 'reference-words', topReferenceWords, CEILINGS.referenceWords);
}

// ---------------------------------------------------------------- report

if (asJson) {
  console.log(JSON.stringify({
    root: ROOT,
    mode,
    ceilings: CEILINGS,
    files: rows,
    totals: {
      skills: skills.length,
      references: references.length,
      commands: commands.length,
      suiteWords,
      suiteWordsEnforced: mode === 'tree',
      topReferenceWords,
      meanDescriptionChars: meanDescription,
      meanDescriptionAim: MEAN_DESCRIPTION_AIM,
    },
    breaches,
    exit: breaches.length ? 1 : 0,
  }, null, 2));
  process.exit(breaches.length ? 1 : 0);
}

const pad = (s, n) => String(s).padEnd(n);
const num = (n) => String(n).padStart(4);

for (const r of rows) {
  if (r.kind === 'skill') {
    console.log(`${pad(r.path, 52)} instructions ${num(r.instructions)}/${CEILINGS.instructions}  body ${num(r.bodyLines)}/${CEILINGS.bodyLines}  desc ${num(r.descriptionChars)}/${CEILINGS.descriptionChars}  words ${num(r.words)}`);
  } else if (r.kind === 'reference') {
    console.log(`${pad(r.path, 52)} lines ${num(r.lines)}/${CEILINGS.referenceLines}  words ${num(r.words)}`);
  } else {
    console.log(`${pad(r.path, 52)} words ${num(r.words)}/${CEILINGS.commandWords}`);
  }
}

if (rows.length) console.log('');

for (const b of breaches) console.log(`OVER  ${b.path}  ${b.measure} ${b.value} / ${b.ceiling}`);
if (breaches.length) console.log('');

const suiteNote = mode === 'tree'
  ? `suite ${suiteWords}/${CEILINGS.suiteWords} words · top-level references ${topReferenceWords}/${CEILINGS.referenceWords} words`
  : `suite ${suiteWords} words (partial run — reported, not enforced)`;
console.log(
  `${skills.length} skills · ${references.length} references · ${commands.length} commands · ` +
  `${suiteNote} · mean description ${meanDescription} chars (aim ~${MEAN_DESCRIPTION_AIM}, not enforced) · ` +
  `${breaches.length} over`,
);

if (!breaches.length) {
  console.log('Every ceiling is inclusive, and nothing is past one. A budget is not a grade — read the prose too.');
  process.exit(0);
}
console.log(`${breaches.length} to settle: ${[...new Set(breaches.map((b) => b.path))].join(', ')}`);
process.exit(1);
