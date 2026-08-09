#!/usr/bin/env node
// check-envelope.mjs — does every SKILL.md carry the house envelope?
//
// CONTRIBUTING.md, "The house envelope", is the specification. This walks it: exactly two frontmatter
// keys, and the eight body slots in order, read as a **subsequence**. That reading is the whole point —
// any number of custom headings may sit anywhere among the eight, so a walk that demanded the eight be
// contiguous would reject correct files, and a check that fails on correct files is one people learn to
// ignore.
//
// WHAT IT CANNOT CATCH, and CONTRIBUTING.md says this too. Slot 4 accepts any heading, because fixing
// a wording for the Process is the one thing the envelope refuses to do. So the walk confirms a
// *region* — at least one heading between Inputs and Rationalizations — rather than a position, and it
// cannot tell you which heading in that region is the Process. Two gaps follow, and the second is the
// larger one:
//
//   · It says nothing either way about the Inputs/Process pair. Move `## Inputs` below `## The
//     Increment Cycle` and this still passes.
//   · It cannot see the Process MISSING. Slot 4 consumes whatever heading stands at the cursor, so a
//     file carrying `## Glossary` between Inputs and Rationalizations and no Process at all reports
//     `ok`, and `--list` prints `4:Glossary` as though the slot were filled. Every other slot's
//     absence is caught; slot 4's is not.
//
// Neither is closable here, for one reason. Slot 4 is filled in this tree by `## Core Web Vitals
// Targets`, `## Loading Constraints` and `## Choosing a Browser MCP` — correct files, all three — so
// any rule asking slot 4 to look like a Process would fail them, and a check that fails on correct
// files is one people learn to ignore. That costs more than the gap does. Read the Process yourself:
// is there one, and does it sit after the Inputs? Nothing else asks either question.
//
// Order IS caught. A slot moved past another whose wording it does not match runs the walk out of
// headings and fails; so does any of the other seven going missing. Slot 4 is the single exception.
//
// NOTHING RUNS THIS FOR YOU. .github/workflows/companion-tests.yml is path-filtered to
// skills/frontend-design/scripts/**, so this directory is covered by no job at all. It is on the pre-PR
// list in CONTRIBUTING.md because in a prose repository the checker is a person.
//
//   node scripts/check-envelope.mjs             check, and report every violation
//   node scripts/check-envelope.mjs --list      print every skill's slot walk, and stop
//   node scripts/check-envelope.mjs --root DIR  run against DIR instead of the repository root
//
// Exit codes:  0 nothing to report · 1 something to settle · 2 no skills/ directory to read

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTMATTER_KEYS = ['name', 'description'];

// The eight slots. `match` is tested against the heading's leading words with any qualifier already
// cut off, so `## Red flags — STOP` and `## Process: Threat Model First` each fill their slot.
// The alternates are the ones CONTRIBUTING.md lists as worked examples; it says plainly that the list
// is open, so a heading matching none of them is treated as a custom section and skipped, never as a
// defect on its own.
const SLOTS = [
  { n: 1, name: 'Purpose', match: /^(purpose|overview)\b/i },
  { n: 2, name: 'When to use', match: /^when to (use|skip)\b/i },
  { n: 3, name: 'Inputs', match: /^inputs?\b/i },
  { n: 4, name: 'Process', any: true },
  { n: 5, name: 'Rationalizations', match: /^(common\s+)?rationalizations\b/i },
  { n: 6, name: 'Red flags', match: /^red\s*flags?\b/i },
  { n: 7, name: 'Verification', match: /^verification\b/i },
  { n: 8, name: 'Outputs', match: /^outputs\b/i },
];

const argv = process.argv.slice(2);
const listOnly = argv.includes('--list');
const rootFlag = argv.indexOf('--root');
const ROOT = rootFlag !== -1 && argv[rootFlag + 1]
  ? argv[rootFlag + 1]
  : join(dirname(fileURLToPath(import.meta.url)), '..');

function die(message) {
  console.error(`check-envelope: ${message}`);
  process.exit(2);
}

// A qualifier hung off a slot heading still fills that slot, so cut at the first separator before
// matching: `Red flags — STOP` and `Red flags (STOP)` both reduce to `Red flags`. The slash in
// `When to use / when to skip` is left alone, because that spelling IS the house heading.
function stem(heading) {
  return heading
    .replace(/^#+\s*/, '')
    .replace(/[*`_]/g, '')
    .split(/\s+[—–-]\s+|\s*[(:]/)[0]
    .trim();
}

// Headings inside a fenced block are examples, not structure. The routing tree in `using-agent-skills`
// is a fence full of lines that would otherwise read as content; blanking fences keeps every reported
// line number pointing at the real line.
function headingsOf(body, offset) {
  const lines = body.split('\n');
  const out = [];
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(?:`{3,}|~{3,})/.test(lines[i])) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = lines[i].match(/^##\s+(.*\S)\s*$/);
    if (m) out.push({ text: m[1], stem: stem(m[1]), line: offset + i + 1 });
  }
  return out;
}

// Frontmatter is read as lines rather than parsed as YAML: the envelope's rule is about which keys are
// present, and a dependency to answer that would be its own decision to justify.
function frontmatterOf(source) {
  const lines = source.split('\n');
  if (lines[0].trim() !== '---') return { keys: null, bodyLine: 0, body: source };
  const close = lines.indexOf('---', 1);
  if (close === -1) return { keys: null, bodyLine: 0, body: source };
  const keys = [];
  for (const line of lines.slice(1, close)) {
    const m = line.match(/^([A-Za-z][\w-]*):/);
    if (m) keys.push(m[1]);
  }
  return { keys, bodyLine: close + 1, body: lines.slice(close + 1).join('\n') };
}

// The subsequence walk. Each slot consumes the first heading at or after the cursor that matches it;
// slot 4 matches anything, so it consumes exactly one heading and the walk resumes after it — which is
// how "a region, not a position" is enforced without naming a wording for the Process.
function walk(headings) {
  const filled = [];
  let cursor = 0;
  for (const slot of SLOTS) {
    if (slot.any) {
      if (cursor >= headings.length) return { ok: false, slot, filled, cursor };
      filled.push({ slot, heading: headings[cursor] });
      cursor += 1;
      continue;
    }
    let k = cursor;
    while (k < headings.length && !slot.match.test(headings[k].stem)) k++;
    if (k >= headings.length) return { ok: false, slot, filled, cursor };
    filled.push({ slot, heading: headings[k] });
    cursor = k + 1;
  }
  return { ok: true, filled, cursor };
}

// ---------------------------------------------------------------- run

const skillsDir = join(ROOT, 'skills');
if (!existsSync(skillsDir)) die(`no skills/ directory under ${ROOT}`);

const reports = [];
let scanned = 0;

for (const name of readdirSync(skillsDir).sort()) {
  const path = join(skillsDir, name, 'SKILL.md');
  if (!existsSync(path) || !statSync(path).isFile()) continue;
  scanned++;

  const rel = `skills/${name}/SKILL.md`;
  const source = readFileSync(path, 'utf8');
  const { keys, bodyLine, body } = frontmatterOf(source);
  const faults = [];

  if (keys === null) {
    faults.push({ kind: 'frontmatter', detail: 'the file opens with no `---` frontmatter block' });
  } else {
    const extra = keys.filter(k => !FRONTMATTER_KEYS.includes(k));
    const missing = FRONTMATTER_KEYS.filter(k => !keys.includes(k));
    if (missing.length) faults.push({ kind: 'frontmatter', detail: `missing ${missing.map(k => `\`${k}\``).join(', ')}` });
    if (extra.length) faults.push({ kind: 'frontmatter', detail: `carries ${extra.map(k => `\`${k}\``).join(', ')}, and the envelope is exactly two keys` });
  }

  const headings = headingsOf(body, bodyLine);
  const result = walk(headings);
  if (!result.ok) {
    const got = result.filled.map(f => `${f.slot.n} ${f.heading.text}`);
    faults.push({
      kind: 'slot',
      detail: `slot ${result.slot.n} (${result.slot.name}) has no heading left to match`,
      filled: got,
      rest: headings.slice(result.cursor).map(h => h.text),
    });
  }

  reports.push({ rel, name, headings, result, faults });
}

if (listOnly) {
  for (const r of reports) {
    const cells = r.result.filled.map(f => `${f.slot.n}:${f.heading.text}`).join(' · ');
    console.log(`${r.result.ok && !r.faults.length ? 'ok      ' : 'FAULT   '} ${r.rel}`);
    console.log(`         ${cells || '(no slot matched)'}`);
  }
  console.log(`\n${scanned} skills walked.`);
  process.exit(0);
}

for (const r of reports) {
  for (const f of r.faults) {
    if (f.kind === 'frontmatter') {
      console.log(`FRONTMATTER ${r.rel}`);
      console.log(`            ${f.detail}`);
      console.log(`            The envelope is exactly two keys: \`name\` and \`description\`. See CONTRIBUTING.md, "The house envelope".`);
    } else {
      console.log(`SLOT        ${r.rel}`);
      console.log(`            ${f.detail}.`);
      console.log(`            filled so far: ${f.filled.length ? f.filled.join(' · ') : '(none)'}`);
      console.log(`            headings left: ${f.rest.length ? f.rest.join(' · ') : '(none)'}`);
      console.log(`            A slot is missing, or a slot sits before one it should follow. An unfamiliar`);
      console.log(`            heading is neither — never rename a heading merely because it is unfamiliar.`);
    }
    console.log('');
  }
}

const faulted = reports.filter(r => r.faults.length);
console.log(`${scanned} skills walked · ${SLOTS.length} slots each, read as a subsequence`);
if (!faulted.length) {
  console.log('Every SKILL.md carries two frontmatter keys and all eight slots in order.');
  console.log('Slot 4 accepts any heading, so this says nothing about the Inputs/Process pair — and it');
  console.log('cannot tell a Process from a custom section standing where one should be. Read slot 4.');
  process.exit(0);
}
console.log(`${faulted.length} to settle: ${faulted.map(r => r.name).join(', ')}`);
process.exit(1);
