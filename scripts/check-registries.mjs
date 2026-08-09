#!/usr/bin/env node
// check-registries.mjs — is everything that ships listed everywhere it has to be listed?
//
// A skill, a command and a persona are each enumerated in more than one file, and the lists are
// maintained by hand. Adding one means remembering every list; renaming one means remembering them
// twice. The miss is always the same shape and always the same cause — the list nobody remembered —
// and it is invisible to a reader, because each list reads perfectly well while being incomplete.
// This build spent a whole commit propagating two artifacts through the places that enumerate them,
// and still left `skills/using-agent-skills/SKILL.md` naming one of the three.
//
// It checks both directions, and the second is the one hand-review never does:
//   · MISSING — something in the tree that a registry does not list.
//   · PHANTOM — something a registry lists that is not in the tree. This is what a rename leaves
//     behind, and it is worse than a missing row: it sends a reader to a file that is not there.
//
// HOW IT FINDS A REGISTRY. Not by heading text, which drifts. A registry is a markdown table whose
// header row names the kind — a column called `Skill`, `Command` or `Persona` — and the entries are
// the backticked tokens in that column. The routing tree in `using-agent-skills` is not a table, so it
// is read as the union of that file's fenced blocks. Both readings are deliberately loose about where
// the list sits and strict about what counts as an entry.
//
// WHAT IT DOES NOT REACH. It knows about three kinds of thing. The artifacts a release adds —
// `ARCHITECTURE.md`, `docs/progress.md`, `docs/lessons.md` and the rest — are enumerated in prose
// rather than in a column, and no parser picks those out of a sentence. Those are the ones that went
// wrong most often in this build, and they still have to be swept by hand.
//
// NOTHING RUNS THIS FOR YOU. .github/workflows/companion-tests.yml is path-filtered to
// skills/frontend-design/scripts/**, so this directory is covered by no job at all. It is on the pre-PR
// list in CONTRIBUTING.md because in a prose repository the checker is a person.
//
//   node scripts/check-registries.mjs             check, and report every gap
//   node scripts/check-registries.mjs --list      print every registry and what it holds, and stop
//   node scripts/check-registries.mjs --root DIR  run against DIR instead of the repository root
//
// Exit codes:  0 nothing to report · 1 a registry is out of step with the tree · 2 the tree is unreadable

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const listOnly = argv.includes('--list');
const rootFlag = argv.indexOf('--root');
const ROOT = rootFlag !== -1 && argv[rootFlag + 1]
  ? argv[rootFlag + 1]
  : join(dirname(fileURLToPath(import.meta.url)), '..');

function die(message) {
  console.error(`check-registries: ${message}`);
  process.exit(2);
}

function read(rel) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) die(`${rel} does not exist under ${ROOT}`);
  return readFileSync(path, 'utf8');
}

// ---------------------------------------------------------------- the tree

function skillNames() {
  const dir = join(ROOT, 'skills');
  if (!existsSync(dir)) die(`no skills/ directory under ${ROOT}`);
  return readdirSync(dir).filter(n => existsSync(join(dir, n, 'SKILL.md'))).sort();
}

function fileNames(dir) {
  const path = join(ROOT, dir);
  if (!existsSync(path)) die(`no ${dir}/ directory under ${ROOT}`);
  return readdirSync(path)
    .filter(n => n.endsWith('.md') && statSync(join(path, n)).isFile())
    .map(n => n.replace(/\.md$/, ''))
    .sort();
}

// ---------------------------------------------------------------- the registries

// A contiguous run of lines starting with `|` is a table. The first row is its header; a run whose
// header names the wanted column is a registry, and that column's cells are its entries.
function tablesIn(markdown) {
  const lines = markdown.split('\n');
  const tables = [];
  let run = null;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) {
      if (!run) run = { start: i + 1, rows: [] };
      run.rows.push(lines[i]);
    } else if (run) { tables.push(run); run = null; }
  }
  if (run) tables.push(run);
  return tables;
}

function cells(row) {
  return row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
}

const NAMELIKE = /^\/?[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

// The entries in a column, read two ways because the tree writes them two ways. A backticked token is
// an entry wherever it stands — `/ideate` in a Command cell. And a cell whose whole content is one
// bare name is an entry too: the Quick reference table in `using-agent-skills` writes its Skill column
// unbackticked, and reading only backticks found nothing there and reported all forty skills missing.
// A link is reduced to its text first, which is how the persona table writes its column.
function entriesInColumn(markdown, columnMatch) {
  const found = new Map();
  for (const table of tablesIn(markdown)) {
    if (table.rows.length < 3) continue;
    const head = cells(table.rows[0]);
    const col = head.findIndex(h => columnMatch.test(h.replace(/[`*]/g, '').trim()));
    if (col === -1) continue;
    for (let r = 2; r < table.rows.length; r++) {
      const row = cells(table.rows[r]);
      if (col >= row.length) continue;
      const cell = row[col];
      for (const m of cell.matchAll(/`([^`]+)`/g)) found.set(m[1].trim(), table.start + r);
      const bare = cell.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '').trim();
      if (NAMELIKE.test(bare)) found.set(bare, table.start + r);
    }
  }
  return found;
}

// The routing tree is a fenced block, not a table. Read the union of a file's fences as one body of
// text: which fence a name sits in is not the question, only whether the tree names it at all.
function fencedText(markdown) {
  const out = [];
  const rx = /^(?:`{3,}|~{3,})[^\n]*\n([\s\S]*?)^(?:`{3,}|~{3,})[^\n]*$/gm;
  let m;
  while ((m = rx.exec(markdown)) !== null) out.push(m[1]);
  return out.join('\n');
}

// ---------------------------------------------------------------- run

const skills = skillNames();
const commands = fileNames('commands');
const personas = fileNames('agents');

const dispatcher = read('skills/using-agent-skills/SKILL.md');
const claudeMd = read('CLAUDE.md');
const readme = read('README.md');

const tree = fencedText(dispatcher);
const quickRef = entriesInColumn(dispatcher, /^skill$/i);

// A command is written `/name` wherever it is listed. A persona is written by its bare name, and is
// also linked as `agents/<name>.md`, so either spelling counts as listing it.
const REGISTRIES = [
  {
    kind: 'skill', where: 'skills/using-agent-skills/SKILL.md · the routing tree',
    // The dispatcher does not route to itself. The tree's job is to send a task somewhere else, and
    // the one place it cannot send you is where you already are, so requiring a self-route would be
    // demanding a row that would mean nothing.
    tree: skills.filter(n => n !== 'using-agent-skills'),
    lists: name => new RegExp(`\\b${name}\\b`).test(tree), entries: null,
  },
  {
    kind: 'skill', where: 'skills/using-agent-skills/SKILL.md · the Quick reference table',
    tree: skills, lists: name => quickRef.has(name), entries: quickRef,
  },
  {
    kind: 'command', where: 'CLAUDE.md · the command table',
    tree: commands, lists: name => claudeMd.includes(`\`/${name}\``),
    entries: entriesInColumn(claudeMd, /^command$/i),
  },
  {
    kind: 'command', where: 'README.md · the command table',
    tree: commands, lists: name => readme.includes(`\`/${name}\``),
    entries: entriesInColumn(readme, /^command$/i),
  },
  {
    kind: 'persona', where: 'CLAUDE.md · the persona table',
    tree: personas,
    lists: name => claudeMd.includes(`agents/${name}.md`) || claudeMd.includes(`[${name}]`),
    entries: entriesInColumn(claudeMd, /^persona$/i),
  },
];

const gaps = [];
for (const reg of REGISTRIES) {
  for (const name of reg.tree) {
    if (!reg.lists(name)) gaps.push({ kind: 'MISSING', reg, name });
  }
  if (!reg.entries) continue;
  const known = new Set(reg.tree);
  for (const [entry, line] of reg.entries) {
    const bare = entry.replace(/^\//, '');
    if (!known.has(bare)) gaps.push({ kind: 'PHANTOM', reg, name: entry, line });
  }
}

if (listOnly) {
  console.log(`tree: ${skills.length} skills · ${commands.length} commands · ${personas.length} personas\n`);
  for (const reg of REGISTRIES) {
    const missing = reg.tree.filter(n => !reg.lists(n));
    console.log(`${reg.where}`);
    console.log(`  lists ${reg.tree.length - missing.length}/${reg.tree.length} ${reg.kind}s${missing.length ? `; missing: ${missing.join(', ')}` : ''}`);
    if (reg.entries) console.log(`  ${reg.entries.size} entries in its column`);
  }
  process.exit(0);
}

for (const g of gaps) {
  if (g.kind === 'MISSING') {
    console.log(`MISSING     ${g.reg.kind} \`${g.name}\` is not listed in ${g.reg.where}`);
    console.log(`            It exists in the tree. A registry that does not list it is a registry a cold`);
    console.log(`            agent will trust and be wrong about.`);
  } else {
    console.log(`PHANTOM     ${g.reg.where} lists \`${g.name}\` (line ${g.line}), which is not in the tree`);
    console.log(`            Nothing by that name ships. This is what a rename leaves behind, and it sends`);
    console.log(`            a reader to a file that is not there.`);
  }
  console.log('');
}

console.log(`${skills.length} skills · ${commands.length} commands · ${personas.length} personas, against ${REGISTRIES.length} registries`);
if (!gaps.length) {
  console.log('Every skill, command and persona is listed everywhere it has to be, and no registry lists a ghost.');
  console.log('Artifacts enumerated in prose rather than in a column are out of reach here. Sweep those by hand.');
  process.exit(0);
}
const missing = gaps.filter(g => g.kind === 'MISSING').length;
console.log(`${gaps.length} to settle: ${missing} missing, ${gaps.length - missing} phantom.`);
process.exit(1);
