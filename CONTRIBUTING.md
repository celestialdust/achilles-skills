# Contributing to achilles-skills

This is a collection of production-grade engineering skills, lifecycle commands, and reviewer personas for AI coding agents. The suite is organized around one lifecycle — **Ideate → Spec → Plan → Implement → Verify → Review → Ship** — where the human owns Ideate/Spec/Plan and the agent runs Implement→Ship autonomously.

There are three kinds of contribution: a **skill** (`skills/<name>/SKILL.md`), a **command** (`commands/<name>.md`), and a **persona** (`agents/<name>.md`). Pick the one that matches what you're adding, then follow the matching section.

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
- **Body sections, in order:** `## Purpose` · `## When to use / when to skip` · `## Inputs` · `## Process` · _(custom sections as needed)_ · `## Rationalizations` · `## Red flags` · `## Verification (ending criteria)` · `## Outputs & handoff contract`.

> **Chassis skills keep their native headings.** A handful of skills carry their original `## Overview` / `## The Process` headings verbatim. When editing one of those, do not rename its headings to match the envelope — preserve the chassis prose as-is.

### Quality bar

Skills should be **specific** (actionable steps, not vague advice), **verifiable** (clear exit criteria with evidence requirements), **battle-tested** (real workflows), and **minimal** (only what the agent needs).

### No per-skill evals

**Shipped skills carry NO per-skill `evals/` directory.** Do not add one, and do not re-introduce removed ones. Skill quality is validated at the suite level, not by a per-skill eval runner checked into the skill directory.

### Structure rules

- One `SKILL.md` per skill directory; valid two-key frontmatter.
- Don't duplicate content between skills — **reference** the other skill instead.
- Reference material goes in the top-level `references/`, never inside a skill directory.
- Only add supporting files when content exceeds ~100 lines; don't create empty `scripts/` dirs to mirror another skill.

### The `## Subagents` block

Six skills (`code-review`, `security-and-hardening`, `test-driven-development`, `quality-verification`, `performance-optimization`, `doubt-driven-development`) end with a thin `## Subagents` pointer to their reviewer persona. If you add a skill that has a matching code-cold persona, append the same block at the end of the body; otherwise omit it.

## Adding a command

A command is a thin entry point at `commands/<name>.md` that maps **one lifecycle stage** to the skill(s) that run it — not a restatement of the skill. The suite ships nine: `/ideate`, `/spec`, `/plan`, `/implement`, `/verify`, `/review`, `/ship`, `/orchestrate`, `/setup`.

A command file is Markdown with YAML frontmatter — a single `description` key, then the prompt as the body:

```markdown
---
description: One line shown in the command picker. What the stage does, in plain language.
---

Invoke the <skill-name> skill (+ any fan-out skills this stage drives).
Describe modes/arguments and the stage's handoff, then stop.
```

Keep the body a wrapper: name the skill(s) to invoke and the stage's inputs/outputs; let the skill carry the method. New commands are rare — the nine map cleanly to the lifecycle. Add one only when a genuinely new stage appears, and say why in the PR.

## Adding a persona

A persona is a thin role file at `agents/<name>.md` that a skill dispatches as a **fresh, code-cold subagent**. The persona is the _role_; the skill it points at is the _method_. Personas exist to preserve **maker ≠ checker** — the reviewer never inherits the maker's context. The suite ships five: `code-reviewer`, `security-auditor`, `test-engineer`, `performance-auditor`, `adversarial-reviewer`.

A persona file is:

- **Frontmatter:** `name` and `description` (the `description` says when to dispatch it).
- **Body:** a second-person role brief ("You are a Staff Engineer conducting…") with the evaluation framework the persona applies.

When adding a persona, pair it with its source skill: add the `## Subagents` block to that skill so the method points back at the role.

## The artifact-chain contract

Stages don't share memory — they hand off through **artifact files** with fixed names. The names are independent of skill names and must never be renamed:

| Stage | Produces |
|---|---|
| Ideate | `intent.md` |
| Spec | `prd.md`, `acceptance.md`, `environment.md` (+ ADRs, `CONTEXT.md`) |
| Plan | `research.md`, `plan.md` |
| Verify | `qa.md` |
| (cross-cutting) | `STATE.md` (session/handoff), `CONTEXT.md` (glossary) |

Each stage reads the upstream artifact and writes the next, so a fresh agent can resume from the files alone. When you add or edit a skill/command, declare what it reads and writes in `## Outputs & handoff contract` using these exact filenames — never introduce a new artifact name for an existing contract file.

## Validating before a PR

- Every `SKILL.md` has valid frontmatter with exactly `name` + `description`.
- `agents/` and `commands/` filenames match the arrays in `.claude-plugin/plugin.json`.
- No per-skill `evals/` directory.
- No terse-stem skill pointers reintroduced; artifact/tool/object tokens left verbatim.

## License

By contributing, you agree your contributions are licensed under the MIT License (© 2026 Joey).
