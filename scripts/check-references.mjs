#!/usr/bin/env node
// check-references.mjs — does every reference in the prose resolve to something that exists?
//
// A dangling link is the cheapest defect there is to make and one of the hardest to see: the sentence
// around it still reads correctly, and the reader who would notice is the one following the link, who
// is by then already lost. This build cut 607 lines of prose hanging off two references to files that
// no longer existed, and moved a citation from :405 to :410 without either number being wrong to look
// at. Nothing but a resolver catches these.
//
// WHAT IT READS.
//   · Markdown links with a relative target — `[text](../foo/SKILL.md)`. The target must exist, and
//     where the link carries a `#anchor` the anchor must match a heading in the target file.
//   · Same-file anchors — `[text](#some-heading)`.
//   · Backticked paths under the plugin's own tree: `skills/`, `references/`, `agents/`, `commands/`,
//     `scripts/`, `.claude-plugin/`. These are files that ship, so naming one that does not exist is
//     always a defect.
//
// WHAT IT DELIBERATELY DOES NOT READ, and this is the honest half.
//   · Anything under `docs/`. Most `docs/` paths this repository names — `docs/adr/`, `docs/features/`,
//     `docs/lessons.md`, `docs/progress.md`, `docs/design.md`, `docs/session-state.md` — are artifacts
//     the suite scaffolds into *your* project and correctly do not exist here. Checking them would
//     report a false hit on nearly every mention, and a check that only ever cries wolf is one people
//     learn to skip. A dangling `docs/workflow.md` therefore goes unreported. Read those by hand.
//   · Any path holding `<` or `>`: `docs/features/<slug>/plan.md` is a shape, not a file.
//   · External URLs. Whether a URL is alive is a question for the network, not for this.
//
// NOTHING RUNS THIS FOR YOU. .github/workflows/companion-tests.yml is path-filtered to
// skills/frontend-design/scripts/**, so this directory is covered by no job at all. It is on the pre-PR
// list in CONTRIBUTING.md because in a prose repository the checker is a person.
//
//   node scripts/check-references.mjs             check, and report everything that does not resolve
//   node scripts/check-references.mjs --list      print every reference and its verdict, and stop
//   node scripts/check-references.mjs --root DIR  run against DIR instead of the repository root
//
// Exit codes:  0 nothing to report · 1 something does not resolve · 2 the tree cannot be read

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// `.claude` holds a second checkout of this repository at a different commit. Resolving against it
// would let a reference that is dangling here pass because the file exists over there.
const SKIP = new Set(['.git', '.claude', '.handoff', '.gauntlet', 'node_modules']);

// The plugin's own tree: everything under these ships, so a named path that is absent is a defect.
const SHIPPED = /^(skills|references|agents|commands|scripts|\.claude-plugin)\//;
const EXTERNAL = /^(https?:|mailto:|tel:|ftp:)/i;

const argv = process.argv.slice(2);
const listOnly = argv.includes('--list');
const rootFlag = argv.indexOf('--root');
const ROOT = rootFlag !== -1 && argv[rootFlag + 1]
  ? argv[rootFlag + 1]
  : join(dirname(fileURLToPath(import.meta.url)), '..');

function die(message) {
  console.error(`check-references: ${message}`);
  process.exit(2);
}

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

// GitHub's heading slug: lowercase, drop anything that is not a word character, space or hyphen, then
// every space to a hyphen. Inline markup is stripped first, so `## The \`SKILL.md\` envelope` slugs the
// way the rendered heading does.
//
// EACH space, not each run of them. `## AI / LLM Security` loses the slash and keeps the two spaces
// around it, so its real slug is `ai--llm-security` with the double hyphen. Collapsing runs produced
// `ai-llm-security` and reported the repository's one correct anchor as broken.
function slugOf(heading) {
  return heading
    .replace(/[`*_]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s/g, '-');
}

// Fenced blocks are examples and templates, not references: `CONTEXT-FORMAT.md` shows what a
// consumer's context map looks like, and its `[Ordering](./src/ordering/CONTEXT.md)` is a shape rather
// than a link into this repository. Blank them rather than delete them, so every reported line number
// still points at the real line in the real file.
function blankFences(markdown) {
  return markdown.replace(
    /^(?:`{3,}|~{3,})[^\n]*\n[\s\S]*?^(?:`{3,}|~{3,})[^\n]*$/gm,
    block => block.split('\n').map(() => '').join('\n'),
  );
}

const anchorCache = new Map();
function anchorsOf(path) {
  if (anchorCache.has(path)) return anchorCache.get(path);
  let set = new Set();
  try {
    const lines = readFileSync(path, 'utf8').split('\n');
    let fenced = false;
    for (const line of lines) {
      if (/^\s*(?:`{3,}|~{3,})/.test(line)) { fenced = !fenced; continue; }
      if (fenced) continue;
      const m = line.match(/^(#{1,6})\s+(.*\S)\s*$/);
      if (!m) continue;
      const base = slugOf(m[2]);
      // GitHub disambiguates repeats with -1, -2 … Accept those without tracking which is which:
      // a link to the second "Inputs" is not the defect this check is for.
      set.add(base);
      for (let i = 1; i <= 6; i++) set.add(`${base}-${i}`);
    }
  } catch { set = null; }
  anchorCache.set(path, set);
  return set;
}

// Split a link target into its path and anchor. An empty path means the anchor is in this same file.
function splitTarget(target) {
  const hash = target.indexOf('#');
  if (hash === -1) return { path: target, anchor: null };
  return { path: target.slice(0, hash), anchor: target.slice(hash + 1) };
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

const PATHLIKE = /^[A-Za-z.][A-Za-z0-9._-]*(?:\/[A-Za-z0-9._-]+)*\/?$/;

// ---------------------------------------------------------------- run

if (!existsSync(ROOT)) die(`${ROOT} does not exist`);

const findings = [];
const checked = [];
let files = 0;

for (const path of markdownFiles(ROOT)) {
  files++;
  const rel = relative(ROOT, path);
  const here = dirname(path);
  const source = blankFences(readFileSync(path, 'utf8'));

  // --- markdown links
  const link = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = link.exec(source)) !== null) {
    const raw = m[2].trim();
    if (EXTERNAL.test(raw)) continue;
    const { path: target, anchor } = splitTarget(raw);
    const line = lineOf(source, m.index);

    if (target === '') {
      const anchors = anchorsOf(path);
      const ok = anchors ? anchors.has(anchor.toLowerCase()) : false;
      checked.push({ rel, line, kind: 'anchor', raw, ok });
      if (!ok) findings.push({ rel, line, raw, why: `no heading in this file slugs to #${anchor}` });
      continue;
    }
    if (target.includes('<') || target.includes('>')) continue;

    const abs = resolve(here, decodeURIComponent(target));
    if (!existsSync(abs)) {
      checked.push({ rel, line, kind: 'link', raw, ok: false });
      findings.push({ rel, line, raw, why: `${relative(ROOT, abs)} does not exist` });
      continue;
    }
    if (anchor && abs.endsWith('.md')) {
      const anchors = anchorsOf(abs);
      const ok = anchors ? anchors.has(anchor.toLowerCase()) : false;
      checked.push({ rel, line, kind: 'link', raw, ok });
      if (!ok) findings.push({ rel, line, raw, why: `${relative(ROOT, abs)} has no heading slugging to #${anchor}` });
      continue;
    }
    checked.push({ rel, line, kind: 'link', raw, ok: true });
  }

  // --- backticked paths under the plugin's own tree
  //
  // A path in prose is written from wherever its reader is standing, and that is not always the
  // repository root. `references/section-contract.md` inside skills/architecture-design/SKILL.md means
  // that skill's own references directory; `scripts/tests/` inside a file two levels down means the
  // skill's scripts directory. Resolving everything against the root reported twenty-odd hits that
  // were all this bug and none of them the repository's. So try each base a writer could plausibly
  // have meant, and report only a path that resolves under none of them — the claim being checked is
  // "this names something that ships", not "this is written root-relative".
  const bases = [ROOT, here];
  const skillRoot = rel.match(/^skills\/[^/]+/);
  if (skillRoot) bases.push(join(ROOT, skillRoot[0]));

  const tick = /`([^`\n]+)`/g;
  while ((m = tick.exec(source)) !== null) {
    const body = m[1].trim();
    if (!PATHLIKE.test(body) || body.includes('<') || body.includes('>') || body.includes('..')) continue;
    if (!SHIPPED.test(body)) continue;
    const ok = bases.some(base => existsSync(join(base, body)));
    const line = lineOf(source, m.index);
    checked.push({ rel, line, kind: 'path', raw: body, ok });
    if (!ok) {
      findings.push({
        rel, line, raw: body,
        why: `resolves under none of ${bases.map(b => relative(ROOT, b) || '.').join(', ')}`,
      });
    }
  }
}

if (listOnly) {
  for (const c of checked) {
    console.log(`${c.ok ? 'ok     ' : 'DANGLE '} ${c.rel}:${c.line}\t${c.kind}\t${c.raw}`);
  }
  const kinds = new Map();
  for (const c of checked) kinds.set(c.kind, (kinds.get(c.kind) || 0) + 1);
  console.log(`\n${checked.length} references across ${files} files: ${[...kinds].map(([k, n]) => `${n} ${k}`).join(' · ')}`);
  process.exit(0);
}

for (const f of findings) {
  console.log(`DANGLING    ${f.rel}:${f.line} — \`${f.raw}\``);
  console.log(`            ${f.why}.`);
  console.log('');
}

console.log(`${checked.length} references checked across ${files} files`);
if (!findings.length) {
  console.log('Every link, anchor and shipped path resolves.');
  console.log('Paths under docs/ are not checked here — most are artifacts of your project, not this one.');
  process.exit(0);
}
console.log(`${findings.length} do not resolve.`);
process.exit(1);
