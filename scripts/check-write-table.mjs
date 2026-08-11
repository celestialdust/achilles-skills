#!/usr/bin/env node
// check-write-table.mjs — does any skill claim a write the rules file does not permit?
//
// Reads the "Who writes what" table out of references/write-ownership.md, collects the writes a
// skills/*/SKILL.md declares in prose, and compares the two zone by zone. It does not claim to find
// every one — CONTRIBUTING.md, "Validating before a PR", says what it does and does not reach at
// more length than belongs here.
//
// IT READS DECLARATIONS, NOT BEHAVIOUR, and that is its softest edge. A skill's write is a sentence
// about a write, so the cheapest way to turn a hit green is to stop declaring: drop the `**Writes:**`
// marker, or the backticks around the path, and the claim disappears while the skill goes on doing
// exactly what it did. Nothing here can see that, because there is nothing left to see. Widening a
// table row and narrowing a declaration are the same erosion from two sides, and CONTRIBUTING.md
// forbids both — close a hit by narrowing the *write*, never by narrowing the *sentence*.
//
// IT OVER-REPORTS ON PURPOSE, and that is the whole design. A skill declares its writes in prose, so
// no parser can be certain which zone a sentence means. Two earlier versions guessed, and every guess
// they made in the permissive direction was a silent pass — a real trespass the check printed nothing
// about. So this one guesses in the other direction: it denies unless the table says otherwise, and
// where it cannot tell which zone a sentence means it says so and still exits non-zero. A hit is a
// candidate for you to settle, not a verdict. Read every one; expect some to be the check being
// literal about a sentence a person would have read charitably. The cost of a wrong hit is a minute of
// your time. The cost of a missed one is a rule nobody is enforcing.
//
// NOTHING RUNS THIS FOR YOU. .github/workflows/companion-tests.yml is path-filtered to
// skills/frontend-design/scripts/**, so this directory is covered by no job at all. It is on the
// pre-PR list in CONTRIBUTING.md because in a prose repository the checker is a person.
//
//   node scripts/check-write-table.mjs            check, and report everything unsettled
//   node scripts/check-write-table.mjs --list     print every claim and its verdict, and stop
//   node scripts/check-write-table.mjs --root DIR run against DIR instead of the repository root
//
// Exit codes:  0 nothing to report · 1 something to settle · 2 the table itself is unreadable
//
// HOW IT FINDS A CLAIM. A claim is a unit — a paragraph, or one top-level list item with its
// continuation lines — that carries a declaration marker: a bolded `Emits` / `Writes` / `Appends` /
// `Creates` / `Scaffolds` / `Output path`, a `<file>:` or `<file> update:` heading (bolded, or bare at
// the head of the unit), or a numbered scaffold step. Each marker owns the text from itself to the
// next marker in the same unit. Units are whitespace-normalized first, so a claim that wraps across
// lines is still one claim. Fenced blocks are blanked, not deleted, so every reported line number
// points at the real line.
//
// Inside that stretch the unit of reading is the **sentence**, and only a sentence that performs an
// act — one carrying a verb meaning create, append, or flip — contributes anything. The rest is a
// declaration's surrounding prose: "Anchored to `prd.md`" sits next to a write and is not one. Every
// version before this one drew that line with a character count instead, and the count cut both ways —
// a real write 205 characters past its marker went unreported, and a file merely mentioned 90
// characters past it was reported as written. A sentence is where the grammar already put the line.
// A path named in the marker's own heading is always in scope, act or no act: `**STATE.md update:**`
// is a declaration about `STATE.md` by construction.
//
// A DENIAL REACHES ONE SENTENCE, AND ONLY WHERE IT IS THE WHOLE OF IT. "does not write", "update:
// none", "writes nowhere else" — a sentence saying one of those and nothing else about writing
// contributes nothing, and *nothing beyond that sentence is dropped*, wherever in the stretch it
// stands. First position is not special, and an earlier header said it was: dropping the whole stretch
// from a leading denial threw away every later sentence in it, so a real write standing after "never
// writes X" was collected from nowhere and printed as nothing — a silent pass. Cut the denial out and
// something that still writes is still a claim: "preflight's only write is the gate flip — it does not
// write the feature transition" declares a gate flip and is judged as one. A denial used to carry for
// two hundred characters and to need no such test, which let it retract claims about a different file
// and let one added clarifying sentence turn a reported trespass green.
//
// Two paths are still not read as claims. A path under the plugin's own tree — `assets/`, `skills/`,
// `references/` and friends — is a working file rather than one of the documents this contract is
// about. And a path with no `.md` suffix and no trailing slash is not a document.
//
// HOW A CLAIM NAMES A ZONE. The table's `Named by` column holds each zone's cue: the tokens a
// declaration has to repeat, in backticks or bold, for this check to read it as touching that zone.
// A cue is one or more alternatives separated by ` / `; an alternative is one or more tokens joined
// by ` + `, all of which must appear. A token counts wherever it stands in an acting sentence of the
// claim, at any distance from the verb. An earlier version required a write verb within sixty
// characters, and moving the verb further away walked a trespass straight past it: "the slice row
// `done` is set by this skill" passed where "flip the slice row to `done`" was caught. A zone whose
// cue is `—` cannot be named from prose, and the preamble above the table says so.
//
// WHAT PERMISSION A CLAIM EXERCISES. The table's last column is read, not just printed. `append only`
// does not license a rewrite, `flip status` does not license a create, and `never` licenses nothing.
// The claim's own verbs say which of the three acts it performs — create, append, flip — and a zone
// whose permission does not cover one of them is a conflict. `create` covers all three: a writer who
// may replace a zone wholesale may also add to it or flip a token inside it.
//
// THE VERDICT, and it denies by default. Every claim lands in one of three buckets:
//   · permitted   — it resolves to a zone the table gives this skill, and the zone's permission covers
//                   what the claim does. Printed by --list, silent otherwise.
//   · conflict    — it resolves to a zone the table gives somebody else, or to a `never` zone, or to a
//                   zone whose permission does not cover it, or to a file the table has no row for.
//   · unresolved  — the check cannot tell which zone it means: no cue matched, and the file's uncued
//                   zones do not all belong to this skill, so the sentence might be a legal write to
//                   its own zone or a trespass on a neighbour's. Reported with the zones it might
//                   mean. Give one of those zones a cue in the `Named by` column to settle it for
//                   good.
// Where no cue matched, only the file's *uncued* zones are still in the running: a zone whose cue is
// absent from the claim is a zone the claim demonstrably does not name.
// Only `permitted` is silent. `unresolved` counts toward the exit code exactly as `conflict` does,
// because a rule that cannot be checked is not a rule that passed.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// What each permission lets its writer do. `create` writes the zone where nothing was and replaces it
// where something was, so it covers the two narrower acts as well.
const LICENSES = new Map([
  ['create', new Set(['create', 'append', 'flip'])],
  ['append only', new Set(['append'])],
  ['flip status', new Set(['flip'])],
  ['never', new Set()],
]);
const HEADER = ['File', 'Zone', 'Named by', 'Who writes it', 'What they may do'];
const UNCUED = '—';

const argv = process.argv.slice(2);
const listOnly = argv.includes('--list');
const rootFlag = argv.indexOf('--root');
const ROOT = rootFlag !== -1 && argv[rootFlag + 1]
  ? argv[rootFlag + 1]
  : join(dirname(fileURLToPath(import.meta.url)), '..');

function die(message) {
  console.error(`check-write-table: ${message}`);
  process.exit(2);
}

// ---------------------------------------------------------------- the table

function stripTicks(cell) {
  return cell.replace(/`/g, '').trim();
}

// `origin:` + `research.md` / `## Log`  →  [['origin:', 'research.md'], ['## Log']]
// Every token must arrive in backticks. An unbacktick'd cue would match prose that merely mentions
// the word, which is the failure this column exists to avoid.
function parseCue(cell, line) {
  const raw = cell.trim();
  if (raw === UNCUED) return null;
  const alternatives = raw.split(' / ').map(alt => alt.split(' + ').map(t => t.trim()));
  for (const alt of alternatives) {
    for (const token of alt) {
      if (!/^`[^`]+`$/.test(token)) {
        die(`line ${line} has the cue ${JSON.stringify(token)}, which is not a single backticked token`);
      }
    }
  }
  return alternatives.map(alt => alt.map(t => stripTicks(t)));
}

// The zone's identity for clash purposes is its cue, not its wording. Rewording a gloss therefore
// cannot hide a zone that was already granted to somebody else.
function cueKey(cue) {
  if (!cue) return null;
  return cue.map(alt => [...alt].sort().join('+')).sort().join('/').toLowerCase();
}

function glossKey(zone) {
  return zone.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function parseTable(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex(l => /^##\s+Who writes what\s*$/.test(l));
  if (start === -1) die('references/write-ownership.md has no "## Who writes what" section');

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { end = i; break; }
  }
  const rows = lines.slice(start + 1, end)
    .map((text, i) => ({ text, line: start + 2 + i }))
    .filter(r => r.text.trim().startsWith('|'));

  if (rows.length < 3) die('the "Who writes what" section holds no table');

  const cells = r => r.text.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());

  const head = cells(rows[0]);
  if (head.length !== HEADER.length || head.some((c, i) => c !== HEADER[i])) {
    die(`the table header is ${JSON.stringify(head)}, not ${JSON.stringify(HEADER)}`);
  }
  if (!/^\|?[\s:|-]+\|?$/.test(rows[1].text.trim())) {
    die(`line ${rows[1].line} should be the table's separator row, and reads: ${rows[1].text.trim()}`);
  }

  const parsed = [];
  for (const row of rows.slice(2)) {
    const c = cells(row);
    if (c.length !== HEADER.length) {
      die(`line ${row.line} has ${c.length} cells, not ${HEADER.length}: ${row.text.trim()}`);
    }
    if (c.some(cell => cell === '')) die(`line ${row.line} has an empty cell: ${row.text.trim()}`);
    const cue = parseCue(c[2], row.line);
    const [file, zone, , writer, may] = c.map(stripTicks);
    if (!LICENSES.has(may)) {
      die(`line ${row.line} says "${may}", which is not one of: ${[...LICENSES.keys()].join(', ')}`);
    }
    parsed.push({ file, zone, cue, writer, may, line: row.line });
  }

  // Two writers on one zone is the violation the zone key exists to make visible. It is checked
  // here, in the table, because this is the only place a zone is actually written down. Two rows
  // are the same zone when they share a cue, or when their glosses are the same words — the first
  // survives rewording, the second catches a row pasted twice and left uncued.
  const seen = new Map();
  const clashes = new Map();
  for (const row of parsed) {
    for (const key of [cueKey(row.cue), glossKey(row.zone)]) {
      if (key === null) continue;
      const full = `${row.file} :: ${key}`;
      const prior = seen.get(full);
      if (prior && prior.writer !== row.writer) clashes.set(`${prior.line}-${row.line}`, [prior, row]);
      else if (!prior) seen.set(full, row);
    }
  }
  return { rows: parsed, clashes: [...clashes.values()] };
}

// ---------------------------------------------------------------- the claims

// One file cell can name two paths ("CLAUDE.md / AGENTS.md"). Split them into the tokens a skill
// would actually write in prose. A path's own slashes stay put: splitting `docs/adr/` would leave
// the token `docs`, which matches nearly every paragraph.
function tokensFor(fileCell) {
  return fileCell.split(' / ').map(t => t.trim()).filter(Boolean);
}

const DECLARES = [
  { rx: /\*\*Emits\b/i, act: 'create' },
  { rx: /\*\*Writes\b/i, act: 'create' },
  { rx: /\*\*Appends\b/i, act: 'append' },
  { rx: /\*\*Creates\b/i, act: 'create' },
  { rx: /\*\*Scaffolds\b/i, act: 'create' },
  { rx: /\*\*Output path\b/i, act: 'create' },
  // The repository's own idiom, in two spellings. Reading only the `update:` spelling left eleven of
  // these sites unscanned.
  { rx: /\*\*`?[A-Za-z][\w.\-<>]*\.md`?\s*:\*\*/i, act: null },
  // The same heading with the bold left off, which three sites in the tree write.
  { rx: /^`?[A-Za-z][\w.\-<>]*\.md`?\s*:/i, act: null },
  { rx: /\*\*[^*]{0,60}\bupdate:?\*\*/i, act: null },
  { rx: /\bupdate by\b/i, act: null },
  // A scaffold step: a numbered item whose subject is the file it creates.
  { rx: /\d\.\s+\*\*`?[A-Za-z][\w.\-\/<>]*(?:\.md|\/)`?\*\*/, act: 'create' },
];

// A declaration whose opening predicate is one of these declares nothing. Nine spellings, one shape:
// "writes no row", "adds no new state token", "drives NO gate transition", "sets neither ... nor ...".
const DENIES = [
  /update:?\*{0,2}\s*\**\s*none\b/i,
  /\bdoes\s+\**not\**\s+(write|flip|own|edit|drive|create|update)/i,
  /\bnever\s+(writes?|flips?|edits?|creates?|owns?)/i,
  /\b(writes?|adds?|creates?|flips?|owns?|drives?|moves?|sets?|seeds?|records?|opens?|emits?)[\s:*]+(no|none|nothing|neither|nowhere)\b/i,
  /\bno\s+`?[A-Za-z.\-\/]+\.md`?\s+row\b/i,
  /\bunchanged by this skill\b/i,
  /\bnever among them\b/i,
  /\bnone directly\b/i,
];

// Which of the three acts a sentence performs. A marker such as `**Appends` states one by itself; a
// heading such as `**STATE.md update:**` states none, and the verbs under it have to.
const ACTS = [
  ['create', /\b(creates?|created|creating|scaffolds?|scaffolded|scaffolding|seeds?|seeded|seeding|emits?|emitted|writes?|write|written|writing|generates?|generated|produces?|produced|replaces?|replaced|rewrites?|rewritten|rewriting|overwrites?|overwritten|clobbers?|rewords?|reworded|reorders?|reordered|removes?|removed|deletes?|deleted)\b/i],
  ['append', /\b(appends?|appended|appending|adds?|added|adding|registers?|registered|records?|recorded|recording)\b|\+=/i],
  // `transition` is left out on purpose: in this repository it is almost always the noun.
  ['flip', /\b(flips?|flipped|flipping|sets?|setting|marks?|marked|marking|promotes?|promoted|advances?|advanced|moves?|moved|moving)\b/i],
];

function actsOf(text, markerAct) {
  const acts = new Set(markerAct ? [markerAct] : []);
  for (const [act, rx] of ACTS) if (rx.test(text)) acts.add(act);
  return acts;
}

// A sentence denies only where the denial is the whole of what it says about writing. Cut the denials
// out and look at what is left: "preflight's only write is the gate flip — it does not write the
// feature transition" still has a write in it and claims one, where "unchanged by this skill (the
// orchestrator owns slice-state transitions)" has nothing left and claims nothing. Without that test
// a skill retracts a real write by putting a denial in front of it, which is the shape this check
// exists to catch.
function denies(sentence) {
  let rest = sentence;
  let hit = false;
  for (const rx of DENIES) {
    const global = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : rx.flags + 'g');
    if (global.test(rest)) { hit = true; rest = rest.replace(global, ' '); }
  }
  return hit && actsOf(rest, null).size === 0;
}

// Sentence boundaries, which is where the grammar already draws the line a character count used to
// guess at. A split needs a terminator and a following capital or markup, so `.md` mid-sentence and
// "e.g. this" stay whole.
const SENTENCE = /(?<=[.!?][*`)\]"']{0,3})\s+(?=[A-Z`*([])/;

// The file a `<file>:` or `<file> update:` heading is about. That file is in scope for the whole
// stretch, because the heading is a declaration about it whatever its sentences go on to say.
function headingFile(markerText) {
  const m = markerText.match(/[A-Za-z][\w.\-<>\/]*\.md/);
  return m ? m[0] : null;
}

// Every code span and bold run in a stretch of text, with the offset each one starts at. A
// declaration marks the path it writes; unmarked prose naming the same path is describing, not
// declaring.
function marks(text) {
  const out = [];
  for (const rx of [/`([^`]+)`/g, /\*\*([^*]+)\*\*/g]) {
    let m;
    while ((m = rx.exec(text)) !== null) out.push({ body: m[1], at: m.index });
  }
  return out;
}

const PATHLIKE = /^[A-Za-z][A-Za-z0-9._<>-]*(?:\/[A-Za-z0-9._<>-]+)*(?:\.[a-z]+|\/)$/;

// Split a marked run into the paths inside it: `docs/features/<slug>/plan.md` is one path, and
// `impl → verify` is none.
function pathsIn(body) {
  return body.split(/[\s,;:()[\]|→·]+/).filter(t => PATHLIKE.test(t) && !t.includes('..'));
}

// A path in prose maps onto a table row by its own name, by its basename — a skill writes
// `docs/features/<slug>/plan.md` and the table has one row for `plan.md` — or by a directory row
// that contains it or that it contains.
function coverageOf(path, fileTokens) {
  if (fileTokens.has(path)) return fileTokens.get(path);
  const base = path.slice(path.lastIndexOf('/') + 1);
  if (base !== path && fileTokens.has(base)) return fileTokens.get(base);
  for (const [token, file] of fileTokens) {
    if (!token.endsWith('/')) continue;
    if (path.startsWith(token) || token.startsWith(path)) return file;
  }
  return null;
}

// The table covers the documents this contract is about. A skill's own working files — a plugin
// asset, a scratch ledger, anything under the plugin tree — are not substrate and are not its
// business, so an unrowed path is only a conflict when it looks like one of these documents.
const OUT_OF_REMIT = /^(assets|skills|references|agents|commands|scripts|tests|node_modules)\//;
function inRemit(path) {
  return (path.endsWith('.md') || path.endsWith('/')) && !OUT_OF_REMIT.test(path);
}

function paragraphs(markdown) {
  // Fenced blocks are examples and templates, not declarations. Blank them rather than delete them,
  // so every reported line number still points at the real line in the real file.
  const withoutFences = markdown.replace(
    /^(?:`{3,}|~{3,})[^\n]*\n[\s\S]*?^(?:`{3,}|~{3,})[^\n]*$/gm,
    block => block.split('\n').map(() => '').join('\n'),
  );
  const out = [];
  let buf = [];
  let startLine = 1;
  const flush = () => {
    if (buf.length) out.push({ text: buf.join(' ').replace(/\s+/g, ' ').trim(), line: startLine });
    buf = [];
  };
  // A unit is a paragraph, or one top-level list item with its continuation lines. Splitting at the
  // item keeps a declaration from inheriting the whole Outputs section's file names, and makes the
  // reported line the line the claim is actually on.
  const startsItem = l => /^ {0,3}(?:[-*+]|\d+\.)\s/.test(l);
  const lines = withoutFences.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') { flush(); startLine = i + 2; continue; }
    if (startsItem(lines[i])) { flush(); startLine = i + 1; }
    else if (!buf.length) startLine = i + 1;
    buf.push(lines[i]);
  }
  flush();
  return out;
}

function collectClaims(root, fileTokens) {
  const skillsDir = join(root, 'skills');
  if (!existsSync(skillsDir)) die(`no skills/ directory under ${root}`);
  const claims = [];
  const unrowed = [];
  let scanned = 0;
  for (const name of readdirSync(skillsDir).sort()) {
    const path = join(skillsDir, name, 'SKILL.md');
    if (!existsSync(path) || !statSync(path).isFile()) continue;
    for (const para of paragraphs(readFileSync(path, 'utf8'))) {
      scanned++;
      // A paragraph often names files it only reads. Bind each path to a declaration marker: it
      // counts as claimed only inside that marker's own stretch, which runs to the next marker, and
      // only where it stands in a sentence of that stretch which performs an act.
      const found = [];
      for (const { rx, act } of DECLARES) {
        const global = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : rx.flags + 'g');
        let m;
        while ((m = global.exec(para.text)) !== null) found.push({ at: m.index, act, text: m[0] });
      }
      if (!found.length) continue;
      found.sort((a, b) => a.at - b.at);
      const claimed = new Map();       // table file -> the acting sentences that claimed it
      const missing = new Map();       // path with no row -> the acting sentences that claimed it
      for (let k = 0; k < found.length; k++) {
        const end = k + 1 < found.length ? found[k + 1].at : para.text.length;
        const sentences = para.text.slice(found[k].at, end).split(SENTENCE);
        // A denial suppresses its own sentence and nothing more. Skipping the whole stretch here
        // dropped every later sentence in it, so a real write standing next to a "never write X"
        // was collected from nowhere and printed as nothing — a silent pass. The per-sentence
        // denial below is what the rule actually needs.
        const acting = [];
        const acts = new Set();
        for (let s = 0; s < sentences.length; s++) {
          if (denies(sentences[s])) continue;
          const here = actsOf(sentences[s], s === 0 ? found[k].act : null);
          if (!here.size) continue;
          acting.push(sentences[s]);
          for (const act of here) acts.add(act);
        }
        if (!acting.length) continue;
        const window = acting.join(' ');
        const paths = [];
        const heading = headingFile(found[k].text);
        if (heading) paths.push(heading);
        for (const mark of marks(window)) paths.push(...pathsIn(mark.body));
        // Keeping only the first marker's claim per file dropped every later marker that widened
        // the act on that same file — the widening is exactly what needs judging, so losing it was
        // a silent pass. Merge instead: union the acts, and keep both windows so the report shows
        // which sentences the verdict was reached from.
        for (const path of paths) {
          const file = coverageOf(path, fileTokens);
          if (file) {
            const prev = claimed.get(file);
            if (prev) { prev.window += ' ' + window; for (const a of acts) prev.acts.add(a); }
            else claimed.set(file, { window, acts: new Set(acts) });
          } else if (inRemit(path)) {
            const prev = missing.get(path);
            if (prev) { prev.window += ' ' + window; for (const a of acts) prev.acts.add(a); }
            else missing.set(path, { window, acts: new Set(acts) });
          }
        }
      }
      const where = { skill: name, path: `skills/${name}/SKILL.md`, line: para.line };
      for (const [file, ctx] of claimed) claims.push({ ...where, file, ...ctx });
      for (const [p, ctx] of missing) unrowed.push({ ...where, missing: p, ...ctx });
    }
  }
  return { claims, unrowed, scanned };
}

// ---------------------------------------------------------------- the verdict

// A cue token counts wherever the claim marks it, in backticks or bold, at any distance from the
// verb. The claim's window is already only its acting sentences, so a token that turns up in one is
// a token the declaration is doing something to.
function names(window, cue) {
  const runs = marks(window);
  const present = token => runs.some(run => run.body.toLowerCase().includes(token.toLowerCase()));
  return cue.some(alt => alt.every(present));
}

function unlicensed(rows, acts) {
  return rows.filter(r => [...acts].some(act => !LICENSES.get(r.may).has(act)));
}

// Deny by default. A claim is permitted only where the table resolves it to a zone this skill writes
// and the zone's permission covers what the claim does. Anything the table cannot resolve is
// reported as unresolved rather than waved through — that fallback is what let a skill holding one
// row of a file write every other zone of it.
function judge(claim, rowsByFile) {
  const rows = rowsByFile.get(claim.file);
  const named = rows.filter(r => r.cue && names(claim.window, r.cue));

  if (named.length) {
    const trespass = named.filter(r => r.writer !== claim.skill);
    if (trespass.length) return { kind: 'conflict', why: 'zone', rows: trespass };
    if (!claim.acts.size) return { kind: 'unresolved', why: 'act', rows: named };
    const beyond = unlicensed(named, claim.acts);
    if (beyond.length) return { kind: 'conflict', why: 'permission', rows: beyond };
    return { kind: 'permitted', rows: named };
  }

  // No cue matched, so the sentence does not say which zone it means — but it is not every zone
  // either. A cued zone whose cue is absent is a zone this claim demonstrably does not name, so only
  // the file's uncued zones are still in the running. Two of the three cases then settle: a skill
  // holding none of them trespasses on whichever it turns out to be, and a skill holding all of them
  // is inside its own zone either way.
  const open = rows.filter(r => !r.cue);
  const mine = open.filter(r => r.writer === claim.skill);
  if (!mine.length) return { kind: 'conflict', why: 'file', rows: open.length ? open : rows };
  if (mine.length !== open.length) return { kind: 'unresolved', why: 'zone', rows: open };
  if (!claim.acts.size) return { kind: 'unresolved', why: 'act', rows: mine };
  const beyond = unlicensed(mine, claim.acts);
  if (beyond.length) return { kind: 'conflict', why: 'permission', rows: beyond };
  return { kind: 'permitted', rows: mine };
}

// ---------------------------------------------------------------- run

const ownership = join(ROOT, 'references', 'write-ownership.md');
if (!existsSync(ownership)) die(`${ownership} does not exist`);

const { rows, clashes } = parseTable(readFileSync(ownership, 'utf8'));

const rowsByFile = new Map();
const fileTokens = new Map();
for (const r of rows) {
  if (!rowsByFile.has(r.file)) rowsByFile.set(r.file, []);
  rowsByFile.get(r.file).push(r);
  for (const token of tokensFor(r.file)) fileTokens.set(token, r.file);
}

const { claims, unrowed, scanned } = collectClaims(ROOT, fileTokens);
const judged = claims.map(c => ({ ...c, verdict: judge(c, rowsByFile) }));
const acted = c => [...c.acts].sort().join('+') || 'no act named';

if (listOnly) {
  for (const c of judged) {
    const zones = c.verdict.rows.map(r => r.zone).join(' · ') || '(no zone)';
    console.log(`${c.verdict.kind.padEnd(10)} ${c.path}:${c.line}\t${c.file}\t${c.skill}\t${acted(c)}\t${c.verdict.why || ''}\t${zones}`);
  }
  for (const u of unrowed) console.log(`conflict   ${u.path}:${u.line}\t${u.missing}\t${u.skill}\t${acted(u)}\tno row\t—`);
  const kinds = new Map();
  for (const c of judged) kinds.set(c.verdict.kind, (kinds.get(c.verdict.kind) || 0) + 1);
  kinds.set('conflict', (kinds.get('conflict') || 0) + unrowed.length);
  console.log(`\n${claims.length + unrowed.length} claims across ${new Set(claims.map(c => c.skill)).size} skills; ${scanned} paragraphs scanned; ${rows.length} table rows.`);
  console.log([...kinds].map(([k, n]) => `${k} ${n}`).join(' · '));
  process.exit(0);
}

for (const [a, b] of clashes) {
  console.log(`TABLE       ${a.file} · ${a.zone}`);
  console.log(`            two writers on one zone: ${a.writer} (references/write-ownership.md:${a.line}) and ${b.writer} (references/write-ownership.md:${b.line})`);
  console.log('');
}

for (const u of unrowed) {
  console.log(`CONFLICT    ${u.missing} — ${u.skill} (${u.path}:${u.line}) declares a write to it`);
  console.log(`            The table has no row for ${u.missing}, and a file with no row permits nothing.`);
  console.log(`            Add a row to "Who writes what" in references/write-ownership.md, or stop declaring the write.`);
  console.log('');
}

const conflicts = judged.filter(c => c.verdict.kind === 'conflict');
for (const c of conflicts) {
  console.log(`CONFLICT    ${c.file} — ${c.skill} (${c.path}:${c.line}) ${acted(c)}`);
  if (c.verdict.why === 'zone') {
    for (const r of c.verdict.rows) {
      console.log(`            zone "${r.zone}" belongs to ${r.writer} (references/write-ownership.md:${r.line}, ${r.may})`);
    }
  } else if (c.verdict.why === 'permission') {
    for (const r of c.verdict.rows) {
      console.log(`            zone "${r.zone}" is ${r.may} (references/write-ownership.md:${r.line}), which does not cover ${acted(c)}`);
    }
  } else {
    console.log(`            it holds no row of ${c.file}, so whichever zone this is, it belongs to somebody else:`);
    for (const r of c.verdict.rows) console.log(`              ${r.zone} → ${r.writer} (${r.may})`);
  }
  console.log('');
}

const unresolved = judged.filter(c => c.verdict.kind === 'unresolved');
for (const c of unresolved) {
  console.log(`UNRESOLVED  ${c.file} — ${c.skill} (${c.path}:${c.line}) ${acted(c)}`);
  if (c.verdict.why === 'act') {
    console.log(`            the sentence names no act, so no permission can be checked against it:`);
  } else {
    console.log(`            no cue in "Named by" matches it, so it could be any of these zones:`);
  }
  for (const r of c.verdict.rows) console.log(`              ${r.zone} → ${r.writer} (${r.may})`);
  console.log(`            Settle it by naming the zone's cue in the sentence, or give the zone a cue in references/write-ownership.md.`);
  console.log('');
}

const total = conflicts.length + unresolved.length + clashes.length + unrowed.length;
console.log(`${rows.length} table rows · ${rowsByFile.size} files · ${claims.length + unrowed.length} write claims found in skills/ · ${scanned} paragraphs scanned`);
if (total === 0) {
  console.log('Every claim resolves to a zone the table gives its skill.');
  process.exit(0);
}
console.log(`${total} to settle: ${clashes.length} in the table, ${conflicts.length + unrowed.length} conflicts, ${unresolved.length} unresolved.`);
process.exit(1);
