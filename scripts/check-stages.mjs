#!/usr/bin/env node
// check-stages.mjs — does the stage a registry assigns a skill match the stage the skill claims?
//
// WHY IT EXISTS. Which stage a skill runs in is stated in at least eight places — the routing tree and
// the stage registry in `using-agent-skills`, the skill's own `Stage:` line, the workflow description
// and its template twin, the per-agent setup guides. Nothing checks that they agree, and THIS SCRIPT
// CLOSES ONE OF THOSE EIGHT, not all of them: it compares a skill's declaration against every table
// carrying both a `Stage` and a `Skill` column, and exactly one file in the tree has such a table
// (`using-agent-skills`). The run prints the file count for that reason — read `across 1 file(s)` as
// the width of the guarantee, not as a tally of what was searched. The other five
// scripts each catch a different shape of drift and every one of them is blind to this: a stale stage
// label is not a missing row (check-registries), not a wrong count (check-enumerations), and not a
// dangling link (check-references). The name is right, the row is present, the link resolves, and the
// stage beside it is a year out of date.
//
// That is exactly the failure a reader cannot see. A registry row reading `| Plan | api-design |` is
// indistinguishable from a correct one, and an agent consulting the dispatcher will route by it. This
// repository is currently moving two disciplines from Plan into Spec; without this check that move
// would land as prose with no guarantee at all that the eight statements ended up saying the same thing.
//
// WHAT IT READS.
//   · Every markdown table carrying BOTH a `Stage` column and a `Skill` column. Membership is judged by
//     the column, never by a substring anywhere in the file — the same discipline check-registries
//     settled on after four legs of substring matching all passed over deleted rows. A name in a
//     paragraph beside a table is not a row in it.
//   · Each named skill's own declaration: the first line matching `Stage:` / `**Stage:**` /
//     `**Stage tag:**`. Three spellings are in use across the tree and all three are read.
//
// HOW A DECLARATION IS PARSED, and this is the fiddly half. The line is cut at its first em-dash and
// stage keywords are collected from what precedes it, because everything after the dash is commentary
// that routinely names OTHER stages: `**Stage tag:** cross-cutting — referenced in Spec by
// spec-grilling, in Plan by codebase-design` declares `cross-cutting` and merely mentions two more.
// Collecting keywords from the whole line would read that as a three-stage skill. Parenthetical noise
// before the dash is harmless, since only known stage words are collected — `Spec (human-led` yields
// `Spec`. A line with two bolded stages and no dash yields both: `Stage: **Spec** (pass 1) + **Plan**
// (pass 2)` is a genuine two-stage declaration and is meant to pass under either.
//
// A skill declaring `cross-cutting` satisfies any registry stage. That is not laxity — a cross-cutting
// skill is one deliberately not owned by a stage, so a registry filing it under one is not a
// contradiction. Narrowing that would make the check fire on skills that are correct.
//
// WHAT IT DELIBERATELY DOES NOT CHECK, which is the honest half.
//   · A skill that declares no stage at all cannot be compared to anything. Every skill in the tree
//     declares one today, so `UNCHECKED` reads 0 — but the guard stays, because the hole reopens the
//     moment somebody adds a skill without a `Stage:` line. Such a skill is reported by name and
//     counted rather than failed: a script that is red on arrival is one people learn to skip.
//   · Prose statements of stage — "runs in Spec, after to-prd" — are not read. Only tables with the two
//     columns, and only the skill's own declaration line.
//   · Tables with a `Stage` column but no `Skill` column: CONTRIBUTING's `Stage | Produces`,
//     getting-started's `Stage | Artifact(s) | Produced by`, opencode-setup's `Stage | Command
//     equivalent | Skills the agent invokes`. These map stages to artifacts or to prose lists of
//     several skills, not one row per skill, and forcing them into this shape would report noise.
//   · The INVERSE shape, and this is the widest gap: a `Skill` column with no `Stage` column, where the
//     stage is a bold label or heading above the table — README and the per-agent setup guides. Those
//     are exactly the files a reshape has to sweep by hand, and a stale grouping there is invisible here.
//
// EXERCISE IT BEFORE YOU TRUST IT, AND PLANT MORE THAN ONE SHAPE. Planting a single wrong stage on a
// skill with a clean declaration is the ritual that certified this script while two false PASSes sat in
// the tree: a declaration with no em-dash had its trailing prose harvested as extra stages, and a cell
// naming one right stage beside one wrong one passed under `some`. Plant all four — a wrong stage, a
// multi-stage cell with one wrong half, a dash-less declaration, and a row naming no real skill — and
// watch each exit 1 before you put them back. A check that has only ever been watched passing is not
// known to work, and this repository has already shipped one that passed over the exact condition it
// existed to prevent.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STAGES = ['Ideate', 'Spec', 'Plan', 'Implement', 'Verify', 'Review', 'Ship', 'cross-cutting'];

// Files this walks. `.claude/` holds registered git worktrees — full copies of the tree whose rows are
// not this checkout's rows.
const MD_ROOTS = ['skills', 'commands', 'agents', 'docs', 'references'];
const ROOT_FILES = ['README.md', 'CONTRIBUTING.md', 'CLAUDE.md', 'CONTEXT.md', 'AGENTS.md'];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const files = [...MD_ROOTS.flatMap((d) => walk(d)), ...ROOT_FILES.filter((f) => existsSync(f))];

// --- what each skill claims for itself -------------------------------------------------------------

function declaredStages(skillDir) {
  // The name comes out of a markdown cell anybody can edit in a PR, and it becomes a path segment.
  // Reject anything that could climb out of `skills/` before it reaches the filesystem.
  if (/[/\\]|\.\./.test(skillDir)) return null;
  const p = join('skills', skillDir, 'SKILL.md');
  if (!existsSync(p)) return null;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    if (!/^\**Stage(?: tag)?:?\**\s*:?/.test(line)) continue;
    // Cut at the first em-dash, en-dash, or sentence end. Commentary after any of the three names
    // other stages: `Stage: **Spec** (pass 1) + **Plan** (pass 2). The autonomous Implement→Ship wave`
    // declares two stages and merely mentions two more. Cutting only at the em-dash read that line as
    // a four-stage declaration, which made every registry filing satisfy it.
    const head = line.split(/[—–]|\.\s/)[0];
    const found = STAGES.filter((s) =>
      new RegExp(`(?<![A-Za-z-])${s}(?![A-Za-z-])`, 'i').test(head),
    );
    if (found.length) return found;
  }
  return null; // silent — see "what it deliberately does not check"
}

// --- rows in every Stage×Skill table ---------------------------------------------------------------

const cells = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

const rows = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  let stageCol = -1;
  let skillCol = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('|')) {
      stageCol = skillCol = -1;
      continue;
    }
    const c = cells(line);
    if (stageCol < 0) {
      const s = c.findIndex((h) => /^stage$/i.test(h));
      const k = c.findIndex((h) => /^skill$/i.test(h));
      if (s >= 0 && k >= 0) {
        stageCol = s;
        skillCol = k;
      }
      continue;
    }
    if (/^[-: ]+$/.test(c.join(''))) continue; // separator
    const stage = c[stageCol];
    const skill = (c[skillCol] || '').replace(/`/g, '').trim();
    if (stage && skill) rows.push({ file, line: i + 1, stage, skill });
  }
}

// --- compare ---------------------------------------------------------------------------------------

const mismatches = [];
const unchecked = new Map();
const phantom = [];

for (const r of rows) {
  const declared = declaredStages(r.skill);
  if (declared === null) {
    if (!existsSync(join('skills', r.skill, 'SKILL.md'))) {
      phantom.push(r);
      continue;
    }
    if (!unchecked.has(r.skill)) unchecked.set(r.skill, r);
    continue;
  }
  if (declared.includes('cross-cutting')) continue;
  // A cell may name more than one stage — a skill applied during both Plan and Implement is filed as
  // `Plan · Implement`, and splitting is what lets the registry say that instead of picking one and
  // being wrong about the other. EVERY stage the cell names has to be declared, not merely one of
  // them: under `some`, `Spec · Ship` on a Spec-only skill passed, because the correct half made the
  // wrong half unreachable. A cell naming a stage the skill does not declare is the drift being hunted.
  const filed = r.stage.split(/[/·+,]/).map((s) => s.trim()).filter(Boolean);
  const ok = filed.every((f) => declared.some((d) => d.toLowerCase() === f.toLowerCase()));
  if (!ok) mismatches.push({ ...r, declared });
}

for (const m of mismatches)
  console.log(
    `MISMATCH ${m.file}:${m.line} — registry files \`${m.skill}\` under "${m.stage}"; the skill declares ${m.declared.join(' + ')}`,
  );
for (const p of phantom)
  console.log(`PHANTOM  ${p.file}:${p.line} — row names \`${p.skill}\`, which has no SKILL.md`);

if (unchecked.size) {
  console.log(
    `\nUNCHECKED (${unchecked.size}) — listed in a registry, but the skill declares no stage, so nothing here can compare it:`,
  );
  for (const [name, r] of unchecked) console.log(`  ${name}  (${r.file}:${r.line} files it under "${r.stage}")`);
  console.log('  Give each a `Stage:` line and this check covers them with no change to the script.');
}

const skillCount = readdirSync('skills', { withFileTypes: true }).filter((e) => e.isDirectory()).length;
console.log(
  `\n${rows.length} registry rows checked across ${new Set(rows.map((r) => r.file)).size} file(s) · ` +
    `${skillCount} skills in the tree · ${mismatches.length} mismatched · ${phantom.length} phantom · ${unchecked.size} unchecked`,
);
console.log('A stage stated only in prose is not a checked stage — sweep those by hand.');

process.exit(mismatches.length || phantom.length ? 1 : 0);
