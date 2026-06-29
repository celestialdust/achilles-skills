# achilles-skills — Claude Code guidance

Guidance for Claude Code when working in this repository. `achilles-skills` is a self-contained skill
suite that automates the development loop **Ideate → Spec → Plan → Implement → Verify → Review → Ship**.

## Start here: the meta-dispatcher

Before writing any plan, spec, or code — and at the start of every session — invoke the
[using-agent-skills](./skills/using-agent-skills/SKILL.md) skill. It is the meta-dispatcher: it maps the
task to the right stage skill and keeps the artifact chain
(`intent.md → prd.md → plan.md → … → qa.md`) intact. Acting without consulting it is how the wrong skill
runs and a stage gets skipped.

## Project Structure

```
skills/          → 36 skills, one discipline each (skills/<name>/SKILL.md)
agents/          → 5 review personas (code-cold subagents)
commands/        → 9 lifecycle slash commands (*.md)
references/      → shared checklists (testing, performance, security, …)
docs/            → per-agent setup guides + ADRs
.claude-plugin/  → plugin.json + marketplace.json (install manifests)
```

## The 9 commands → which skill they run

Slash commands are thin entry points; each maps one lifecycle stage to its skill(s).

| Command | Runs | Owner |
|---|---|---|
| `/ideate` | interview-me, then idea-refine | human |
| `/spec` | spec-grilling (+ to-prd, acceptance-criteria, environment-manifest, frontend-design, spec-review) | human |
| `/plan` | plan-breakdown (+ codebase-research first) | human |
| `/implement` | incremental-implementation (applies test-driven-development) | agent |
| `/verify` | quality-verification | agent |
| `/review` | code-review (+ code-simplification, security-and-hardening, performance-optimization fan-out) | agent |
| `/ship` | shipping-and-launch (+ pull-request) | agent |
| `/orchestrate` | orchestrator — the autonomous wave-parallel DAG runner | agent |
| `/setup` | project-setup — one-time repo ecosystem | agent |

The **human owns Ideate + Spec + Plan**; the agent runs **Implement → Ship autonomously**.

## The 5 personas (agents/)

Personas are *roles* dispatched as fresh, code-cold subagents; the skill they point at is the *method*.
They exist to preserve **maker≠checker** — the reviewer never shares the maker's context.

| Persona | Method skill | Role |
|---|---|---|
| [code-reviewer](./agents/code-reviewer.md) | code-review | five-axis review before merge |
| [security-auditor](./agents/security-auditor.md) | security-and-hardening | OWASP / secrets / dependency audit of a diff |
| [test-engineer](./agents/test-engineer.md) | test-driven-development + quality-verification | designs honest tests; proves a slice behaviorally |
| [performance-auditor](./agents/performance-auditor.md) | performance-optimization | measure-first profiler; Core Web Vitals; hot paths |
| [adversarial-reviewer](./agents/adversarial-reviewer.md) | doubt-driven-development | independent skeptic for confident / high-stakes in-flight calls |

Composition rule: **a slash command (or the user) is the orchestrator; personas do not invoke other
personas.** A persona may invoke skills. The only multi-persona pattern is parallel fan-out with a merge
step (used by `/review`).

## The house envelope

Every SKILL.md uses two-key frontmatter (`name` + `description` only) and these body sections, in order:
`## Purpose` · `## When to use / when to skip` · `## Inputs` · `## Process` · (custom) ·
`## Rationalizations` · `## Red flags` · `## Verification (ending criteria)` · `## Outputs & handoff
contract`. Chassis skills keep their native `## Overview` / `## The Process` headings verbatim — do not
rename headings. References live in `references/`, never inside a skill directory.

## Safety & autonomy rules (must-follow)

- **Risk-banded draft PRs only.** Autonomous runs terminate at an **open draft PR** with a risk band;
  they never halt mid-run and never block waiting for input.
- **Never auto-merge to main.** A human merges. The agent opens the PR; the human decides.
- **maker≠checker.** Verify and Review run as fresh, code-cold subagents (the `agents/` personas) that
  do not share the implementer's context. The maker never grades its own work.
- **TDD order.** Write the failing test before implementation (`test-driven-development`, applied by
  `incremental-implementation`). One thin vertical slice at a time, skeleton-first.

## Conventions

- Every skill lives at `skills/<kebab-case-name>/SKILL.md` with `name` + `description` frontmatter.
- Description leads with what the skill does (third person), then trigger conditions ("Use when …").
- Reference other skills rather than duplicating their content.
- Use the **new** skill names everywhere (e.g. `performance-optimization`, not `perf`; `quality-verification`,
  not `qa`). Artifact filenames (`qa.md`, `acceptance.md`, `environment.md`, …) and the `git` VCS tool keep
  their names — they are not skill pointers.

## Boundaries

- Always: invoke `using-agent-skills` first to pick the stage skill; follow the matched skill exactly.
- Always: run Verify and Review as code-cold subagents before opening a PR.
- Never: auto-merge, push to main, or skip the failing-test-first order.
- Never: add a skill that is vague advice instead of an actionable process, or duplicate another skill.
