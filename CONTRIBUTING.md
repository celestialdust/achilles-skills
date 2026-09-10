# Contributing to achilles-skills

A suite of engineering skills and lifecycle commands for AI coding agents, organized around one loop —
**Ideate → Spec → Plan → Implement → Verify → Review → Ship** — where the human owns Ideate, Spec and
Plan and the agent runs Implement through Ship unattended.

There are two kinds of contribution: a **skill** (`skills/<name>/SKILL.md`) and a **command**
(`commands/<name>.md`). Follow the section matching what you are adding.

## Naming

Names are **descriptive and function-implying** — they tell a cold reader what the unit does rather than
abbreviate it. The suite was deliberately renamed from terse stems to full descriptors; keep that
direction in anything new.

| Don't (terse) | Do (descriptive) |
|---|---|
| `perf` | `performance-optimization` |
| `tdd` | `test-driven-development` |
| `qa` | `quality-verification` |
| `pr` | `pull-request` |
| `security` | `security-and-hardening` |

All names are kebab-case. A new skill or command reading like an abbreviation will be sent back for a
rename.

> **Never rename an artifact or a tool that merely shares a stem with a skill.** `qa.md`,
> `acceptance.md`, `environment.md`, `research.md`, `plan.md` are **artifact filenames** (see the
> artifact-chain contract below); `git log` / `git commit` is the **VCS tool**; "PR" is the **GitHub
> object**. None is a skill pointer, and all stay verbatim.

## Adding or modifying a skill

### Before proposing a new one

The suite already covers the whole loop, so most ideas overlap something. Browse the roster in
[README.md](README.md) and skim `skills/` for one that covers the idea whole or in part, run
`gh pr list --state open` for a proposal on the same topic, and state in your pull request why neither
covers it. If the idea refines an existing skill, prefer a focused edit over a new directory.

### Author it through `skill-creator`

Skills are authored and revised through the `skill-creator` skill, not hand-edited: it holds the writing
method and the eval loop measuring whether a description routes and a body executes. Write or amend the
skill through it, run its evals, and fix what they surface before opening the pull request. Nothing
beyond the skill, those evals and the pull request itself is asked of a contributor.

### The house envelope

Every `SKILL.md` carries the same envelope.

- **Frontmatter: exactly two keys**, `name` and `description`. Nothing else.
- The `description` is ≤400 characters (aim ~250): a directive opener saying when to run the skill and
  what it does, then a negative scope naming the near-miss and the skill that owns it. It is the only
  thing a host reads to decide whether to load the body, so make it concrete and never restate the body.
- **Body: eight `##` sections, in this order.** The order is the contract; the wording is not.

| # | Section | House heading | What it holds |
|---|---|---|---|
| 1 | Purpose | `## Purpose` | the `**Stage: <stage>.** Principles <n, n>.` line, then what it does and emits |
| 2 | When to use | `## When to use / when to skip` | the triggers, and each near-miss naming the skill that owns it |
| 3 | Inputs | `## Inputs` | one bullet per input — what it supplies, and what to derive from if it is absent |
| 4 | Process | `## Process` | the method and its gotchas as invocations — what the rest exists to serve |
| 5 | Rationalizations | `## Rationalizations` | `"<excuse>" → <reality>`, one per rule the Process states |
| 6 | Red flags | `## Red flags` | observable signs the skill is being misapplied |
| 7 | Verification | `## Verification` | end conditions written as states, so they read as checks |
| 8 | Outputs | `## Outputs & handoff` | what it writes — path, cap, shape — the verdict vocabulary, what it hands on |

The **Stage** is one of `Ideate · Spec · Plan · Implement · Verify · Review · Ship · cross-cutting ·
standalone`, and the `Principles n, n` numbers beside it index the ten commitments in
[`references/principles.md`](references/principles.md) — cite by number, never restate one.

**Word a section for the skill when that reads better.** `incremental-implementation` calls its Process
`## The Increment Cycle` because that is what the process *is*. A qualifier hung off a heading still
fills its section: `## Process — the turn protocol`, `## Process: Threat Model First`. And the envelope
is read as a **subsequence** — the eight appear in this order among the file's `##` headings, with any
number of other headings among them, which is how `## Loading Constraints` and
`## Core Web Vitals Targets` live in the tree without being defects.

> **A defect is a section that is missing, or sections out of order. An unfamiliar heading is neither.**
> Never rename a heading merely because you have not seen it before.

**Read section 4 yourself; nothing else will.** It accepts any heading, so a walk confirms that *some*
heading sits between Inputs and Rationalizations — a region, not a position. Two things go unseen: an
Inputs and a Process swapped, and a Process that is not there at all. Ask both by hand — is there a
Process, and does it sit after the Inputs?

### Budget

`node scripts/check-budget.mjs` fails the build and owns these numbers rather than a reviewer's eye: a
`SKILL.md` carries **≤40 instructions**, **≤300 body lines** and a **≤400-character description**; a
reference file, top-level or skill-local, is **≤150 lines**; the top-level `references/` directory is
**≤5,000 words** in total. It also enforces a suite-wide word ceiling over every `SKILL.md` on a
whole-tree run — read that ceiling from the script rather than copying it here.

An instruction is a sentence whose first token is an imperative verb, or that carries *must / never /
always / do not / only / required / forbidden / stop*. That is a rule about sentence shape and the script
is its definition, so a budget is not a grade: forty vague instructions pass and forty-one sharp ones
fail. Keep the Process near twenty; write Verification as states and the reality half of a
Rationalization as a fact, not a command.

### Structure

- One `SKILL.md` per skill directory, with valid two-key frontmatter.
- Never duplicate content between skills — **reference** the other skill by name instead.
- Material more than one skill reads goes in the top-level `references/`; what only one skill reads may
  live in that skill's own `references/`. Promote it the moment a second skill needs it.
- Shipped skills carry **no** per-skill `evals/` directory. Never add one or reintroduce a removed one.
- Add a supporting file only when the content will not fit the body, and never create an empty
  `scripts/` directory to mirror another skill.

## Adding a command

A command is a thin entry point at `commands/<name>.md` mapping **one lifecycle stage** to the skill(s)
that run it — never a restatement of the skill. The suite ships twelve commands: nine lifecycle
(`/ideate`, `/spec`, `/plan`, `/implement`, `/verify`, `/review`, `/ship`, `/orchestrate`, `/setup`) and
three standalone (`/explain`, `/quiz`, `/gauntlet-loop`) that belong to no stage.

The file is Markdown with one `description` key in its frontmatter, then the prompt as its body:

```markdown
---
description: One line shown in the command picker. What the stage does, in plain language.
---

Run the <skill-name> skill (+ any fan-out skills the stage drives).
Name the arguments and the artifact the stage emits, then stop.
```

The body is **≤150 words**, frontmatter excluded, and `check-budget.mjs` enforces that. Keep it a
wrapper: name the skill(s), the stage's inputs and what it emits, and let the skill carry the method. New
commands are rare — add one only when a genuinely new stage appears, and say why in the pull request.

## The artifact-chain contract

Stages do not share memory. They hand off through **artifact files** with fixed names, so a fresh agent
resumes from the files alone. Those names are independent of skill names and are never renamed.

| Stage | Produces |
|---|---|
| Ideate | `intent.md` |
| Spec | `research.md` and one `research/<axis>.md` per survey axis, then `prd.md`, `acceptance.md`, `environment.md`, `architecture.md` — plus the decision records under `docs/adr/` and the `CONTEXT.md` terms — signed in one act |
| Plan | `plan.md` (the map and the slice table) and one `plan/<slice-id>.md` per slice |
| Implement | the slice's commits |
| Verify | `qa.md` |
| Review | `<SLICE-ID>/security-findings.md` · `reviews/<SLICE-ID>-perf.md` |
| Ship | the draft pull request body, plus `migration.md` or `release.md` where the work calls for one |
| cross-cutting | `STATE.md` (the board) · `CONTEXT.md` (the glossary) · `docs/session-state.md` (where the work stands) · `docs/session-log.md` (the append-only decision record) · `docs/lessons.md` (root-caused defects and the guard for each) |

Everything under `docs/features/<slug>/` belongs to one feature. Shapes, tokens, caps and writers for the
four state files are stated once, in [`references/state-schema.md`](references/state-schema.md) — cite
that file rather than restate a shape. When you add or edit a skill, declare what it reads and writes in
`## Outputs & handoff` using these exact filenames, and never introduce a new name for a contract file
that has one.

## Validating before a pull request

Run all six; all six must exit 0. None has a baseline or a ratchet — never edit a number inside a
script, or a count in prose, to turn one green.

- `node scripts/check-envelope.mjs` — every `SKILL.md` has exactly `name` + `description` and all eight
  sections in order, read as a subsequence. **A clean run says nothing about section 4** — read it
  yourself, as above.
- `node scripts/check-budget.mjs` — instructions, body lines, description characters, reference lines and
  command words, against the ceilings.
- `node scripts/check-references.mjs` — every markdown link, heading anchor and backticked shipped path
  resolves. It skips paths under `docs/`, most of which name artifacts the suite scaffolds into *your*
  project and are correctly absent here; sweep those by hand. It also cannot resolve a section cited by
  name rather than by anchor, so grep `scripts/` for the old wording whenever you rename a heading here.
- `node scripts/check-enumerations.mjs` — every stated total is recomputed from the tree and diffed
  against each sentence stating it, in one of five frames. **The frame list is finite, and that is the
  hole**: a total worded some sixth way is unchecked, so rewording out of a frame clears a hit without
  making the number true. Fix the number instead. **Never take a count here on trust**: measure one the
  script cannot reach — the rows in a table, the steps in a process — with a command before you write it
  down.
- `node scripts/check-registries.mjs` — every skill and command is listed in each registry enumerating
  its kind, and no registry lists something that is not there. That second direction is the one hand
  review never does: a rename leaves a row sending a reader to a file that is not there. Membership is
  judged against the registry's own **column**, so a name surviving in a paragraph beside the table it
  was deleted from is not a row.
- `node scripts/check-stages.mjs` — the stage each registry files a skill under is compared with the
  stage that skill declares on its own `Stage:` line. It reads a `Stage` column beside a `Skill` column,
  and the inverse shape where a heading or bold label above the table carries the stage. Out of reach: a
  stage stated only in prose, and whether a label names the *right* stage — the label is taken as truth.

Also confirm by hand: `commands/` filenames match the `commands` array in `.claude-plugin/plugin.json`;
exactly one plugin manifest exists, and it is the only file stating the version; no per-skill `evals/`
directory; and no terse-stem skill pointer was reintroduced.

## License

By contributing, you agree your contributions are licensed under the MIT License (© 2026 Joey).
