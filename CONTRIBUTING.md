# Contributing to achilles-skills

This is a collection of engineering skills, lifecycle commands, and reviewer personas for AI coding agents. The suite is organized around one lifecycle — **Ideate → Spec → Plan → Implement → Verify → Review → Ship** — where the human owns Ideate/Spec/Plan and the agent runs Implement→Ship autonomously.

There are three kinds of contribution: a **skill** (`skills/<name>/SKILL.md`), a **command** (`commands/<name>.md`), and a **persona** (`agents/<name>.md`). Pick the one that matches what you're adding, then follow the matching section.

Prose in this repo follows one style guide — [`references/language-style.md`](references/language-style.md). Read it before your first writing edit.

## Naming convention

Names are **descriptive and function-implying** — they should tell a cold reader what the unit does, not abbreviate it. The suite was deliberately renamed from terse stems to full descriptors; preserve that direction in anything new:

| Don't (terse) | Do (descriptive) |
|---|---|
| `perf` | `performance-optimization` |
| `tdd` | `test-driven-development` |
| `qa` | `quality-verification` |
| `pr` | `pull-request` |
| `security` | `security-and-hardening` |

All names are kebab-case. A new skill, command, or persona that reads like an abbreviation will be sent back for a rename.

> **Do not rename artifacts or tools that merely share a stem with a skill.** `qa.md`, `acceptance.md`, `environment.md`, `research.md`, `plan.md` are **artifact filenames** (see the artifact-chain contract below); `git log` / `git commit` is the **VCS tool**; "PR" / "pull request" is the **GitHub object**. These are not skill pointers and must stay verbatim.

## Adding or modifying a skill

### Before proposing a new skill

The suite already covers the whole lifecycle, so most ideas overlap an existing skill. Before adding one:

1. **Search the catalog.** Browse the skill roster in [README.md](README.md) and skim `skills/` for a skill that already covers your idea, whole or in part.
2. **Check open PRs.** Run `gh pr list --state open` and look for proposals on the same topic.
3. **Justify the gap.** In your PR description, state explicitly why this isn't covered by an existing skill or open PR.

If your idea refines an existing skill, prefer a focused edit to that skill over a new directory.

### The house envelope

Every `SKILL.md` follows the same envelope:

- **Frontmatter:** exactly two keys — `name` and `description`. Nothing else.
- The `description` starts with what the skill does (third person), then names its trigger conditions ("Use when…" / "Use the moment…"). The `description` is the only thing the dispatcher reads to decide whether to load the skill, so make it concrete.
- **Body: eight `##` slots, in this order.** The order is the contract. The wording is not.

| # | Slot | House heading | What it holds |
|---|---|---|---|
| 1 | Purpose | `## Purpose` | what the skill does, and why it exists |
| 2 | When to use | `## When to use / when to skip` | the triggers, and the cases that belong to a different skill |
| 3 | Inputs | `## Inputs` | what must already exist before the skill runs |
| 4 | Process | `## Process` | the method — the section the rest of the file exists to serve |
| 5 | Rationalizations | `## Rationalizations` | the excuses for skipping the process, each with its rebuttal |
| 6 | Red flags | `## Red flags` | signs the skill is being violated |
| 7 | Verification | `## Verification (ending criteria)` | how to tell the skill is finished |
| 8 | Outputs | `## Outputs & handoff contract` | what it produces, and who reads it next |
| — | _(custom sections)_ | — | whatever this one skill needs: tables, worked examples, templates |

**Word a slot for the skill when that reads better.** This is deliberate, not tolerated. `incremental-implementation` calls its Process slot `## The Increment Cycle` because that is what the process *is*; renaming it to `## Process` would cost the reader the one word that told them. Many shipped skills word at least one slot differently, and none of them is a defect.

Two kinds of variation are already in the tree. Both are **worked examples, not a closed list** — a heading that does not appear here is not wrong for being absent from it:

- **An alternate wording of a fixed slot.** `## Overview` for Purpose · `## When to Use` for When to use · `## Common Rationalizations` for Rationalizations · `## Red Flags` for Red flags · `## Verification` for Verification.
- **A Process slot named for its own method.** `## The Increment Cycle` (`incremental-implementation`) · `## The Optimization Workflow` (`performance-optimization`) · `## The Quality Gate Pipeline` (`ci-cd`) · `## The Pre-Launch Checklist` (`shipping-and-launch`) · `## The Five-Axis Review` (`code-review`) · `## Core Principles` (`api-design`, `git-workflow`).

A qualifier hung off a slot heading still fills that slot: `## Red flags — STOP`, `## Red flags (STOP)`, `## Process — the turn protocol`, and `## Process: Threat Model First` each do.

> **A defect is a slot that is missing, or slots that appear out of order. An unfamiliar heading is neither.** Never rename a heading merely because you have not seen it before — ask whether all eight slots are present and in sequence, and if they are, leave the wording alone.

Slots are what keep the envelope checkable. An exception written as *which skills may deviate* has to be maintained by hand and goes stale the first time someone adds a skill; a slot walk does not. Read as slots, the envelope is a **subsequence**: the eight appear in this order among a file's `##` headings, and any number of other headings may sit anywhere among them — `interview-me` hangs `## Loading Constraints` between When to use and Inputs, and the `## Subagents` pointer (below) sits after slot 8. A walk that demanded the eight be contiguous would reject both, and a check that fails on correct files is one people learn to ignore. One pass down the headings matches each slot in turn:

- Slots 1–3 and 5–8 each accept a small set of wordings — the house heading, the alternate above, or either carrying a qualifier. A heading matching none of them is a custom section: skip it and keep looking for the slot.
- Slot 4 accepts **any** heading, so no walk can pick the Process out. What a walk confirms is that at least one heading sits between the Inputs slot and the Rationalizations slot — a region, not a position. The heading that opens that region is often not the Process: `performance-optimization` opens it with `## Core Web Vitals Targets` and reaches `## The Optimization Workflow` further down. Which heading is the Process is something a person reading the file can see and a walk cannot, and the Process wordings above are for that person.
- A file fails when a slot has no heading left to match after the slot before it: the headings ran out, or the only candidate sits earlier. A file that fills all eight in order passes, whatever they are called and whatever else it carries.

So the walk catches a slot moved past another whose wording it does not match, and a slot that is missing — with one exception, and the exception is slot 4. **Do not rely on the walk for the Process at all.** Slot 4 accepts any heading, so it consumes whichever heading stands at that point in the file, whatever that heading is. Two things go unseen because of it, and the second is the larger:

- **A swapped Inputs/Process pair.** Move `## Inputs` below `## The Increment Cycle` in `incremental-implementation` and the walk still passes.
- **A Process that is not there.** A skill carrying `## Glossary` between Inputs and Rationalizations and no Process at all walks clean, and `--list` prints `4:Glossary` as though the slot were filled.

Closing either would mean fixing a wording for the Process, which is the one thing this envelope refuses to do — and it would fail correct files as they stand: slot 4 is filled in this tree by `## Core Web Vitals Targets`, `## Loading Constraints` and `## Choosing a Browser MCP`. So read slot 4 yourself, and ask both questions: is there a Process, and does it sit after the Inputs? Nothing else asks either.

### Quality bar

Skills should be **specific** (actionable steps, not vague advice), **verifiable** (clear exit criteria with evidence requirements), **drawn from real workflows** (not invented ones), and **minimal** (only what the agent needs).

### No per-skill evals

**Shipped skills carry NO per-skill `evals/` directory.** Do not add one, and do not re-introduce removed ones. Skill quality is validated at the suite level, not by a per-skill eval runner checked into the skill directory.

### Structure rules

- One `SKILL.md` per skill directory; valid two-key frontmatter.
- Don't duplicate content between skills — **reference** the other skill instead.
- Reference material more than one skill reads goes in the top-level `references/`. Material only one skill reads may stay in that skill's own `references/` — eight skills carry one. Promote it the moment a second skill needs it: a shared reference living inside one skill's directory is kept true by a skill that has no reason to keep it true for the other.
- Only add supporting files when content exceeds ~100 lines; don't create empty `scripts/` dirs to mirror another skill.

### The `## Subagents` block

Six skills (`code-review`, `security-and-hardening`, `test-driven-development`, `quality-verification`, `performance-optimization`, `doubt-driven-development`) end with a thin `## Subagents` pointer to their reviewer persona. If you add a skill that has a matching code-cold persona, append the same block at the end of the body; otherwise omit it.

Write the block's trigger as the persona carve-out: a single code-cold pass a person wants **outside a run**, or a platform with no skill tool. Inside a run the skill is dispatched as itself — a trigger phrased as an in-run case ("when a slice is green", "when a diff touches auth") puts a role back on top of the method, which is the thing `/review` was built to stop.

## Adding a command

A command is a thin entry point at `commands/<name>.md` that maps **one lifecycle stage** to the skill(s) that run it — not a restatement of the skill. The suite ships twelve commands. Nine are lifecycle commands: `/ideate`, `/spec`, `/plan`, `/implement`, `/verify`, `/review`, `/ship`, `/orchestrate`, `/setup`. The other three, `/explain`, `/quiz`, and `/gauntlet-loop`, are standalone and belong to no stage.

A command file is Markdown with YAML frontmatter — a single `description` key, then the prompt as the body:

```markdown
---
description: One line shown in the command picker. What the stage does, in plain language.
---

Invoke the <skill-name> skill (+ any fan-out skills this stage drives).
Describe modes/arguments and the stage's handoff, then stop.
```

Keep the body a wrapper: name the skill(s) to invoke and the stage's inputs/outputs; let the skill carry the method. New commands are rare — the nine lifecycle commands map cleanly to the loop. Add one only when a genuinely new stage appears, and say why in the PR.

## Adding a persona

A persona is a thin role file at `agents/<name>.md` that a skill dispatches as a **fresh, code-cold subagent**. The persona is the _role_; the skill it points at is the _method_. Personas exist to preserve **maker ≠ checker** — the reviewer never inherits the maker's context. The suite ships five personas: `code-reviewer`, `security-auditor`, `test-engineer`, `performance-auditor`, `adversarial-reviewer`.

A persona file is:

- **Frontmatter:** `name` and `description` (the `description` says when to dispatch it).
- **Body:** a second-person role brief ("You are a Staff Engineer conducting…") with the evaluation framework the persona applies.

When adding a persona, pair it with its source skill: add the `## Subagents` block to that skill so the method points back at the role.

### What a plugin persona's frontmatter actually reads

Everything in `agents/` ships inside a plugin, and a plugin persona reads thirteen frontmatter fields: `name`, `description`, `tools`, `disallowedTools`, `model`, `maxTurns`, `skills`, `memory`, `background`, `effort`, `isolation`, `color`, `initialPrompt`. Three others — `hooks`, `mcpServers`, `permissionMode` — are dropped silently. No error, no warning: the persona loads and the line behaves as though you never wrote it, which is worse than a field that fails, because the file still reads as configured. Don't ship one. A role that genuinely needs one of the three is not a plugin persona — whoever installs the suite has to copy the file into their own `.claude/agents/` or `~/.claude/agents/` by hand — so say that in the PR rather than leave a line nothing reads.

Composition is enforced below this repo, not by it. A subagent cannot spawn another subagent, and a teammate cannot spawn a team. That is why [CLAUDE.md](CLAUDE.md)'s composition rule — a slash command or the user orchestrates, and personas do not invoke other personas — is not a house preference: a persona written to dispatch another persona doesn't misbehave, it fails to run.

## The artifact-chain contract

Stages don't share memory — they hand off through **artifact files** with fixed names. The names are independent of skill names and must never be renamed:

| Stage | Produces |
|---|---|
| Ideate | `intent.md` |
| Spec | `research.md` (first), `prd.md`, `acceptance.md`, `environment.md`, `architecture.md` + `architecture.html`, `design-contract.md` (UI only) (+ ADRs, `CONTEXT.md`) |
| Plan | `plan.md` |
| Verify | `qa.md` |
| (cross-cutting) | `STATE.md` (session/handoff), `CONTEXT.md` (glossary), `docs/workflow.md` (the process contract), `docs/test-contract.md` (the repo's permanent cross-feature scenarios), `docs/session-state.md` (where the work stands + an append-only decision log), `docs/progress.md` (the run record — what each slice actually executed), `docs/lessons.md` (root-caused defects and the guard for each), `docs/design.md` (the repository's decided look, written by the first UI surface), `ARCHITECTURE.md` (the repository's structure, written by the first feature to run `architecture-design`) |

Each stage reads the upstream artifact and writes the next, so a fresh agent can resume from the files alone. When you add or edit a skill/command, declare what it reads and writes in `## Outputs & handoff contract` using these exact filenames — never introduce a new artifact name for an existing contract file.

## Validating before a PR

- `node scripts/check-envelope.mjs` is silent. It walks every `SKILL.md` for exactly `name` +
  `description` in the frontmatter and all eight body slots in order, read as a subsequence — see
  [The house envelope](#the-house-envelope). **A clean run says nothing about slot 4**: it accepts any
  heading, so the walk confirms a region rather than a position, and it can see neither the Inputs and
  the Process swapped nor the Process missing outright. Read slot 4 yourself; nothing else will.
- `agents/` and `commands/` filenames match the arrays in `.claude-plugin/plugin.json`.
- Exactly one plugin manifest exists — `.claude-plugin/plugin.json`, which states the version. There is
  no second manifest at the repo root; a duplicate would drift, since nothing forces the two to agree.
- No per-skill `evals/` directory.
- No terse-stem skill pointers reintroduced; artifact/tool/object tokens left verbatim.
- `node scripts/check-references.mjs` is silent. Every markdown link, heading anchor and backticked path
  under the plugin's own tree resolves. It does not check paths under `docs/` — most of those name
  artifacts the suite scaffolds into *your* project and correctly absent from this one, so checking them
  would report a false hit on nearly every mention. Read those by hand. It also cannot resolve a section
  cited by name — `CONTRIBUTING.md, "The house envelope"`, which two of these scripts write — because
  those citations live in `.mjs` comments and this walks `.md` files. **Rename a heading in this file and
  grep the old name across `scripts/` before you stop.**
- `node scripts/check-enumerations.mjs` is silent. Every stated total — skills, personas, commands — is
  recomputed from the tree and diffed against each sentence that states it *in one of five frames*: a
  definite article with the number straight after it, a structure-block arrow, a bare `All`, a `There
  are`, and an inventory verb (`ships`, `registers`). **The frame list is finite, and that is the hole.**
  A total worded some sixth way — "a roster of 39", "40 structured skills" — is unchecked, so rewording a
  sentence out of the frame is a cheaper way to clear a hit than fixing the number, and nothing reports
  that you did it. If a wording you wrote went unchecked, add its frame to the script rather than leave
  the next person the same hole. **Never take a count in this repository on trust.** Nine hand-priced
  enumerations in the v2 build measured wrong and every one was short; one said seven sections where there
  were eight and would have shipped a duplicate. A count this check cannot reach — the sections in a
  block, the rows in a table, the steps in a process — is a count you measure with a command before you
  write it down.
- `node scripts/check-registries.mjs` is silent. Every skill, command and persona is listed in each
  registry that enumerates its kind — the run's last line prices how many that is — and no registry lists
  something that is not there. The second direction is the one hand-review never does: a rename leaves a
  row behind that sends a reader to a file that does not exist. **Membership is judged against the
  registry's own column, never against the file around it** — a name surviving in a paragraph beside the
  table it was deleted from is not a row, and reading it as one made every deleted row a silent pass. Out
  of reach: artifacts named in prose rather than in a table column, and a stale *destination* in the
  routing tree, which is prose the check reads only in the missing direction. A rename still shows there
  as a phantom in the Quick reference table.
- `node scripts/check-stages.mjs` is silent. Every table carrying both a `Stage` column and a `Skill`
  column is read, and the stage each row files a skill under is compared to the stage that skill declares
  for itself on its own `Stage:` line. Three spellings of that line are in use and all three are read; a
  declaration is cut at its first em-dash, because the commentary after the dash routinely names other
  stages and collecting from the whole line would read `cross-cutting — referenced in Spec … in Plan …`
  as a three-stage skill. A cell may name more than one (`Plan · Implement`), and a skill declaring
  `cross-cutting` satisfies any stage. Every skill declares a stage today, so `UNCHECKED` reads 0 — but
  the guard stays, because the hole reopens the moment somebody adds a skill without a `Stage:` line.
  Such a skill is reported by name as `UNCHECKED`, not failed, because a script that is red on arrival is
  one people learn to skip. It also reads the **inverse shape** — a `Skill` column whose stage is a
  heading or bold label above the table, which is how README and the setup guides are written, plus the
  same grouping stated inline as `**Spec (human-led)** — codebase-research · spec-grilling · …`, and as a
  bullet list under the label (`- `interview-me` — …`, how `copilot-setup` writes it). That was the widest
  gap until README filed `doubt-driven-development` under Review while six other registries had already
  moved it, green across every check; reading all three forms took coverage from 40 rows in one file to
  198 in six. In a bullet the name must lead and be backticked or linked — a mention inside a sentence is
  prose, because a check that cries wolf on correct files is one people stop reading. Out of reach: a
  stage stated in prose (`runs in Spec, after to-prd`); tables with a `Stage` column but no `Skill`
  column, which map stages to artifacts rather than one row per skill; and whether a grouping label names
  the *right* stage — the label is taken as the truth, so a heading that is wrong for its whole table is
  internally consistent and passes.
- `node scripts/check-write-table.mjs` reports nothing your own diff introduced. It reads the write
  table in `docs/workflow.md`, collects the writes each `SKILL.md` declares in prose, and judges each
  against the zone the table gives that skill. Three verdicts: **permitted**, which is silent;
  **conflict**, where the zone belongs to somebody else or its permission does not cover what the
  sentence does or the file has no row at all; and **unresolved**, where no cue matched and the file's
  uncued zones do not all belong to that skill. Conflict and unresolved both exit `1`.

  **It over-reports on purpose, and it does not claim to find everything.** A declaration is a sentence,
  not a data structure, so the check denies unless the table clearly permits and says `unresolved` rather
  than waving a sentence through. Some hits are it reading a sentence more literally than a person would —
  it has no notion of who the subject is, so "`plan-breakdown` seeds the slice rows" inside another
  skill's paragraph reads as that skill's claim. Answer each hit; do not expect each to be a defect. It
  also misses a write declared in prose carrying none of its markers, so a clean run is not proof your
  diff declares nothing.

  **It exits `1` on this repository as it stands.** Capture the output before your change and after it and
  compare — any difference is yours. Never close a hit by editing the table: a row added or widened to
  turn a red check green is the gate erosion the table exists to catch. Close it by rewording the skill.
  Nothing runs it for you; no job covers `scripts/`.

  **Rewording the skill means narrowing the write, never narrowing the sentence.** The check reads
  declarations, not behaviour, so its cheapest green is for a skill to stop declaring: delete the
  `**Writes:**` marker, or the backticks around the path, and the claim vanishes while the skill goes on
  writing exactly what it wrote. One marker can carry several files' claims at once, so a single unbolding
  takes all of them out of the run together — measured, not supposed: unbold one `**Writes…**` marker in
  `gauntlet-loop` and four conflicts leave the output. That is the same erosion as widening a row, entered
  from the other side of the same door: the table would say who may write a zone, the skill would no
  longer say it writes there, and between them nobody would be telling the truth. So a hit is closed one
  of two ways — stop the skill writing outside its zone, or give the zone a row that was always correct
  and would have been written whatever the check said. If the reworded sentence no longer says what the
  skill writes, you have hidden the hit, not settled it.

  What is in the standing output, characterised. **This paragraph states no numbers.** An earlier draft
  did — a count of findings, of claims, of paragraphs, of table rows — and one of the four was already
  off by one against the check's own last line, inside the sentence telling you never to trust a
  hand-priced count. They move with every wave that adds a writer, so a copy of them here can only ever
  be right for a while and wrong silently after that. Run the check and read its last line; that is the
  count. What follows characterises the **classes** the conflicts fall into, not one row per finding.
  Sites are named by skill and by the sentence, not by line number, because line numbers move and a stale
  citation reads exactly like a live one.

  The unresolved findings are a separate category and are not listed below at all. An unresolved finding
  is one whose claim matched a file the table rows but named no zone cue, so the check cannot tell a legal
  write from a trespass and says so instead of guessing. They cluster on the per-feature artifacts —
  `plan.md`, `prd.md`, `intent.md`, `CONTEXT.md`, `acceptance.md` lead the list — because those rows carry
  `—` in *Named by* and their zones therefore cannot be told apart from prose. Give a zone a cue where the
  distinction has to hold, and it settles itself from then on:

  | Site | Claim | Reading |
  |---|---|---|
  | `deprecation-and-migration` | registers slice rows and their `impl → verify → review → ship → done` tokens | trespass — the rows are `plan-breakdown`'s and the tokens are the `orchestrator`'s |
  | `incremental-implementation` | "flip the slice `impl → verify`", "flip its gate `agent → you`" | trespass — that zone is the `orchestrator`'s |
  | `quality-verification` | slice `verify → review`, and `qa.md` into `Artifacts` | trespass — both zones are the `orchestrator`'s |
  | `pull-request` | slice row to `ship` then `done`, `Gate: you`, `Artifacts` `+=` | trespass — same two zones |
  | `security-and-hardening` | "flip the slice to `halted`" | trespass on the flip only; its `security-findings.md` append in the same sentence is legal |
  | `preflight-readiness` | "flips `gate: agent`" | trespass — the gate column is the `orchestrator`'s |
  | `frontend-design` | "set `gate: you`" | trespass — same zone |
  | `interview-me` | "seed the feature row at feature state `spec`, gate `you`" | trespass — feature blocks are `plan-breakdown`'s, `feature:` is the `orchestrator`'s |
  | `codebase-design` | interface content into `plan.md` | trespass — the table gives that zone to `api-design`, and two skills now claim it |
  | `environment-manifest` | "the feature sits in `feature: spec`" | over-report — a state report standing beside a legal `origin:` append |
  | `preflight-readiness` | a ledger keyed *by* `environment.md` row name | over-report — it reads that file and writes `preflight.md` |
  | `api-design`, `source-driven-development`, `using-agent-skills` | a denial followed by naming who does write it | over-report — the check credits the neighbouring skill's verb to this one |
  | `orchestrator` | "Every transition is **written** as it happens" | over-report — the zone is `flip status` and the sentence reaches for a create verb |
  | `literate-explainer`, `project-setup` | `glossary.md`, `ADR-<NNN>-<slug>.md` | over-report — a learner's workspace file and a naming convention, neither a substrate document |
  | `handoff` | `docs/adr/` and `acceptance.md` in one sentence about what outranks the session log | over-report — it names those files to say they beat the log, and the check credits the sentence's verb to both |
  | `spec-grilling` | an `origin:` append naming the ADR ids | over-report — that zone is legally its own; the claim reaches `STATE.md` without naming the `origin:` cue |
  | `plan-breakdown` | feature blocks, slice rows, and their tokens in one paragraph | trespass on the tokens only — the rows are its own, the `impl → verify → …` tokens are the `orchestrator`'s |
  | `preflight-readiness` | `environment.md`, `docs/features/<slug>/`, and a `gate` flip | over-report on the first two — it reads them and writes `preflight.md`; trespass on the flip, which is the `orchestrator`'s |
  | `orchestrator`, `project-setup` | `docs/progress.md`, `docs/lessons.md` | over-report — a create verb in a sentence whose zone is `append only`, and a scaffold sentence that names both records' entry zones while creating only their headings |
  | any skill | a file whose row still reads `nobody` / `never` | trespass, and the row is the thing to fix — `docs/workflow.md` says the skill that starts writing such a file names itself in that row **in the same commit**, so the row moves with the skill, never after it |
- This repo's own `docs/workflow.md` still matches the copy `project-setup` ships. Run
  `diff docs/workflow.md skills/project-setup/assets/workflow.template.md`; it must print nothing. The
  two are the same document with two audiences, and `project-setup` — which is the only thing that ever
  compares them, and is never run against this repository — cannot be the keeper here.

## License

By contributing, you agree your contributions are licensed under the MIT License (© 2026 Joey).
