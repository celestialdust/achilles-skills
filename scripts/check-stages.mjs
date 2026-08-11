#!/usr/bin/env node
// check-stages.mjs — does the stage a registry assigns a skill match the stage the skill claims?
//
// WHY IT EXISTS. Which stage a skill runs in is stated in every registry that lists skills — the routing
// tree and the stage registry in `using-agent-skills`, and each per-agent setup guide — and once more in
// the skill's own `Stage:` line. Nothing checks that they agree, and THIS SCRIPT CLOSES SOME OF THOSE, not
// all of them: it compares each skill's declaration against every stage grouping it can read in the three
// forms below. The run prints how many files that reached — read `across N file(s)` as the width of the
// guarantee, not as a tally of what was searched. No count of the statement sites appears here on purpose:
// nothing checks a number in this comment, and the last one went stale when two of the files it counted
// were deleted. The other five
// scripts each catch a different shape of drift and every one of them is blind to this: a stale stage
// label is not a missing row (check-registries), not a wrong count (check-enumerations), and not a
// dangling link (check-references). The name is right, the row is present, the link resolves, and the
// stage beside it is a year out of date.
//
// That is exactly the failure a reader cannot see. A registry row reading `| Plan | api-design |` is
// indistinguishable from a correct one, and an agent consulting the dispatcher will route by it. This
// repository is currently moving two disciplines from Plan into Spec; without this check that move
// would land as prose with no guarantee at all that those statements ended up saying the same thing.
//
// WHAT IT READS.
//   · Every markdown table carrying BOTH a `Stage` column and a `Skill` column. Membership is judged by
//     the column, never by a substring anywhere in the file — the same discipline check-registries
//     settled on after four legs of substring matching all passed over deleted rows. A name in a
//     paragraph beside a table is not a row in it.
//   · The INVERSE shape: a `Skill` column with NO `Stage` column, where the stage is a heading or a
//     bold label above the table — README and the setup guides are written this way. The label governs
//     the rows beneath it until the next label. Also the same grouping stated inline,
//     `**Spec (human-led)** — codebase-research · spec-grilling · …`, one row per name.
//     This was the widest gap until README filed `doubt-driven-development` under Review while six
//     other registries and `commands/review.md` had already moved it — every check green, because no
//     check could see that table. A label of `cross-cutting` constrains nothing, the same way a
//     cross-cutting declaration does.
//   · The third form of the same grouping: a bullet list under the label, `- \`interview-me\` — …`,
//     which is how copilot-setup states its stages. The name must LEAD the bullet and be backticked or
//     linked. Accepting any kebab-case word in a bullet would turn prose under a stage heading into
//     phantom rows, and a check that cries wolf on correct files is one people stop reading.
//     Reading all three forms took coverage from 40 rows in 1 file to 198 in 6.
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
//   · A skill named in a bullet that does not LEAD with a backticked or linked name — a mention inside
//     a sentence under a stage label reads as prose here, deliberately. See the note above.
//   · Which stage a `Stage`-less grouping SHOULD be. The label is taken as the truth and the skills
//     beneath it are compared to it; a heading that names the wrong stage for its whole table is
//     internally consistent and passes.
//
// EXERCISE IT BEFORE YOU TRUST IT, AND PLANT MORE THAN ONE SHAPE. Planting a single wrong stage on a
// skill with a clean declaration is the ritual that certified this script while two false PASSes sat in
// the tree: a declaration with no em-dash had its trailing prose harvested as extra stages, and a cell
// naming one right stage beside one wrong one passed under `some`. Extending it to the inverse shape
// added two more of exactly the same kind, both of which passed silently at first: a negative sentinel
// stored in `stageCol` also satisfied the "header not found yet" guard, so every label-governed table
// emitted zero rows and the run stayed green with a quarter of the coverage it claimed; and requiring a
// name to resolve before emitting a row meant a renamed skill in an inline list disappeared instead of
// being reported. Plant all six — a wrong stage, a multi-stage cell with one wrong half, a dash-less
// declaration, a row naming no real skill, a stale row in a label-governed table, and a phantom in an
// inline list — and watch each exit 1 before you put them back. Count the rows too: a check that reads
// fewer files than you think is one you will trust for guarantees it never made.

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

// A cell names a skill as bare text, in backticks, or as a markdown link — README and the setup guides
// link every name. Taking the cell verbatim made every linked row a PHANTOM, so read the link text.
const skillName = (cell) => {
  const link = cell.match(/\[([^\]]+)\]\([^)]*\)/);
  return (link ? link[1] : cell).replace(/`/g, '').trim();
};

// Stage words carried by a grouping label — a heading or a bold lead-in. Cut at the dash for the same
// reason the declaration parser does: `### Review — agent (parallel fan-out)` declares Review and the
// commentary after the dash is free to name anything.
const labelStages = (text) => {
  const head = text.split(/[—–]/)[0];
  return STAGES.filter((s) => new RegExp(`(?<![A-Za-z-])${s}(?![A-Za-z-])`, 'i').test(head));
};

const rows = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  let stageCol = -1;
  let skillCol = -1;
  // Whether this table takes its stage from the label above it rather than from a `Stage` column.
  // Kept as its own flag, not a sentinel in `stageCol`: a negative sentinel also satisfies the
  // "header not found yet" guard below, so such a table re-entered header detection on every row and
  // emitted none — passing silently, which is the one way a check must never fail.
  let useGroup = false;
  let groupStages = null; // the stage a heading/bold label above the table assigns to its rows
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('|')) {
      stageCol = skillCol = -1;
      useGroup = false;

      // A heading or a bold lead-in that names stages governs the rows beneath it until the next one.
      // This is the INVERSE shape: a `Skill` column with no `Stage` column, the stage sitting above the
      // table. It is how README filed `doubt-driven-development` under Review while six other registries
      // and `commands/review.md` had already moved it, with every check in the tree green.
      const label = line.match(/^#{2,4}\s+(.*)$/) || line.match(/^\*\*([^*]+)\*\*/);
      if (label) {
        const st = labelStages(label[1]);
        groupStages = st.length ? st : null;
      }

      // `- \`interview-me\` — brainstorm + frame an idea`: the same grouping with the members as a
      // bullet list under the label, which is how copilot-setup states its stages. The name must LEAD
      // the bullet and be backticked or linked — that is the registry shape. Accepting any kebab-case
      // word in a bullet would turn ordinary prose under a stage heading into phantom rows, and a check
      // that cries wolf on correct files is one people stop reading.
      const bullet = line.match(/^\s*[-*]\s+(?:`([a-z][a-z0-9-]*)`|\[([a-z][a-z0-9-]*)\])/);
      if (bullet && groupStages && !groupStages.includes('cross-cutting')) {
        const name = bullet[1] || bullet[2];
        if (/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(name))
          rows.push({ file, line: i + 1, stage: groupStages.join(' · '), skill: name });
      }

      // `**Spec (human-led)** — codebase-research (first) · spec-grilling · to-prd`: the same grouping
      // with the members inline instead of in a table. windsurf states it this way.
      const inline = line.match(/^\*\*([^*]+)\*\*\s*[—–]\s*(.+)$/);
      if (inline) {
        const st = labelStages(inline[1]);
        if (st.length && !st.includes('cross-cutting')) {
          for (const part of inline[2].split('·')) {
            const name = skillName(part).replace(/\(.*$/, '').trim();
            // Emit a row for anything shaped like a skill name, not only for names that resolve.
            // Requiring the file to exist first made a renamed or mistyped skill vanish from the run
            // instead of being reported — a silent skip in the check whose whole job is catching the
            // registry that nobody updated. Unresolvable names fall through to PHANTOM below; prose
            // words are excluded by the kebab-case shape rather than by whether a file happens to exist.
            if (/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(name))
              rows.push({ file, line: i + 1, stage: st.join(' · '), skill: name });
          }
        }
      }
      continue;
    }
    const c = cells(line);
    if (skillCol < 0) {
      const s = c.findIndex((h) => /^stage$/i.test(h));
      const k = c.findIndex((h) => /^skill$/i.test(h));
      if (s >= 0 && k >= 0) {
        stageCol = s;
        skillCol = k;
      } else if (k >= 0 && groupStages && !groupStages.includes('cross-cutting')) {
        // No Stage column, but a grouping label above it says which stage these rows are filed under.
        // A `cross-cutting` label constrains nothing, the same way a cross-cutting declaration does.
        useGroup = true;
        skillCol = k;
      }
      continue;
    }
    if (/^[-: ]+$/.test(c.join(''))) continue; // separator
    const stage = useGroup ? groupStages.join(' · ') : c[stageCol];
    const skill = skillName(c[skillCol] || '');
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
