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

So the walk catches a slot that is missing, and a slot moved past another whose wording it does not match. It does **not** catch a swap between Inputs and the Process, because a walk that has matched Inputs accepts the next heading whatever it says: move `## Inputs` below `## The Increment Cycle` in `incremental-implementation` and the walk still passes. Closing that would mean fixing a wording for the Process, which is the one thing this envelope refuses to do. Check that pair by reading — nothing else will.

### Quality bar

Skills should be **specific** (actionable steps, not vague advice), **verifiable** (clear exit criteria with evidence requirements), **drawn from real workflows** (not invented ones), and **minimal** (only what the agent needs).

### No per-skill evals

**Shipped skills carry NO per-skill `evals/` directory.** Do not add one, and do not re-introduce removed ones. Skill quality is validated at the suite level, not by a per-skill eval runner checked into the skill directory.

### Structure rules

- One `SKILL.md` per skill directory; valid two-key frontmatter.
- Don't duplicate content between skills — **reference** the other skill instead.
- Reference material more than one skill reads goes in the top-level `references/`. Material only one skill reads may stay in that skill's own `references/` — seven skills carry one. Promote it the moment a second skill needs it: a shared reference living inside one skill's directory is kept true by a skill that has no reason to keep it true for the other.
- Only add supporting files when content exceeds ~100 lines; don't create empty `scripts/` dirs to mirror another skill.

### The `## Subagents` block

Six skills (`code-review`, `security-and-hardening`, `test-driven-development`, `quality-verification`, `performance-optimization`, `doubt-driven-development`) end with a thin `## Subagents` pointer to their reviewer persona. If you add a skill that has a matching code-cold persona, append the same block at the end of the body; otherwise omit it.

Write the block's trigger as the persona carve-out: a single code-cold pass a person wants **outside a run**, or a platform with no skill tool. Inside a run the skill is dispatched as itself — a trigger phrased as an in-run case ("when a slice is green", "when a diff touches auth") puts a role back on top of the method, which is the thing `/review` was built to stop.

## Adding a command

A command is a thin entry point at `commands/<name>.md` that maps **one lifecycle stage** to the skill(s) that run it — not a restatement of the skill. The suite ships twelve. Nine are lifecycle commands: `/ideate`, `/spec`, `/plan`, `/implement`, `/verify`, `/review`, `/ship`, `/orchestrate`, `/setup`. The other three, `/explain`, `/quiz`, and `/gauntlet-loop`, are standalone and belong to no stage.

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

A persona is a thin role file at `agents/<name>.md` that a skill dispatches as a **fresh, code-cold subagent**. The persona is the _role_; the skill it points at is the _method_. Personas exist to preserve **maker ≠ checker** — the reviewer never inherits the maker's context. The suite ships five: `code-reviewer`, `security-auditor`, `test-engineer`, `performance-auditor`, `adversarial-reviewer`.

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
| Spec | `research.md` (first), `prd.md`, `acceptance.md`, `environment.md`, `design-contract.md` (UI only) (+ ADRs, `CONTEXT.md`) |
| Plan | `plan.md` |
| Verify | `qa.md` |
| (cross-cutting) | `STATE.md` (session/handoff), `CONTEXT.md` (glossary), `docs/workflow.md` (the process contract), `docs/test-contract.md` (the repo's permanent cross-feature scenarios), `docs/session-state.md` (where the work stands + an append-only decision log), `docs/design.md` (the repository's decided look, written by the first UI surface) |

Each stage reads the upstream artifact and writes the next, so a fresh agent can resume from the files alone. When you add or edit a skill/command, declare what it reads and writes in `## Outputs & handoff contract` using these exact filenames — never introduce a new artifact name for an existing contract file.

## Validating before a PR

- Every `SKILL.md` has valid frontmatter with exactly `name` + `description`.
- Every `SKILL.md` carries all eight body slots in order, read as a subsequence — see
  [The house envelope](#the-house-envelope), which says which reorderings that reading catches and which
  one it does not.
- `agents/` and `commands/` filenames match the arrays in `.claude-plugin/plugin.json`.
- Exactly one plugin manifest exists — `.claude-plugin/plugin.json`, which states the version. There is
  no second manifest at the repo root; a duplicate would drift, since nothing forces the two to agree.
- No per-skill `evals/` directory.
- No terse-stem skill pointers reintroduced; artifact/tool/object tokens left verbatim.
- `node scripts/check-write-table.mjs` exits `0` — it fails on any write a skill declares that the write
  table in `docs/workflow.md` does not give it. Nothing runs it for you; no job covers `scripts/`.
- This repo's own `docs/workflow.md` still matches the copy `project-setup` ships. Run
  `diff docs/workflow.md skills/project-setup/assets/workflow.template.md`; it must print nothing. The
  two are the same document with two audiences, and `project-setup` — which is the only thing that ever
  compares them, and is never run against this repository — cannot be the keeper here.

## License

By contributing, you agree your contributions are licensed under the MIT License (© 2026 Joey).
