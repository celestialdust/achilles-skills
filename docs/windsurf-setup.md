# Using achilles-skills with Windsurf

`achilles-skills` is a self-contained suite of 36 engineering skills, 5 reusable agent personas, and 9
slash commands that automate the loop **Ideate → Spec → Plan → Implement → Verify → Review → Ship**. The
human owns Ideate + Spec + Plan; the agent then runs Implement → Ship.

Windsurf has no plugin marketplace, so you don't "install" the suite the way Claude Code does. Instead you
wire the skills into Windsurf's three native mechanisms:

| achilles-skills concept | Windsurf mechanism |
|---|---|
| `skills/<name>/SKILL.md` | **Rules** — `.windsurf/rules/*.md` (or legacy `.windsurfrules`) |
| `commands/*.toml` (the 9 slash commands) | **Workflows** — `.windsurf/workflows/*.md`, invoked with `/<name>` in Cascade |
| `agents/*.md` (the 5 personas) | **Manual rules** — a code-cold rule you toggle on for a review pass |
| `references/*.md` (checklists) | Pasted into Cascade chat as a verification checklist |

## Get the suite

```bash
git clone https://github.com/celestialdust/achilles-skills.git
```

Point the paths below at wherever you cloned it (`/path/to/achilles-skills`).

## Setup

### Project rules (`.windsurf/rules/`)

Windsurf reads markdown rule files from `.windsurf/rules/` in your repo. Each file can declare an
**activation mode** in its frontmatter:

- `always_on` — injected into every Cascade turn (use sparingly; counts against the rules budget)
- `manual` — only when you `@`-mention the rule (good for personas and heavyweight skills)
- `model_decision` — Cascade pulls it in when the description matches the task
- `glob` — auto-activates when you touch matching files (e.g. `**/*.test.ts`)

Create one rule file per skill you want available. Example — wire in the implement-loop trio:

```bash
mkdir -p .windsurf/rules

cp /path/to/achilles-skills/skills/test-driven-development/SKILL.md \
   .windsurf/rules/test-driven-development.md
cp /path/to/achilles-skills/skills/incremental-implementation/SKILL.md \
   .windsurf/rules/incremental-implementation.md
cp /path/to/achilles-skills/skills/code-review/SKILL.md \
   .windsurf/rules/code-review.md
```

Then open each copied file and add a short activation header so Cascade knows when to use it, e.g.:

```markdown
---
trigger: glob
globs: ["**/*.ts", "**/*.tsx"]
description: TDD RED-GREEN-REFACTOR loop — write the failing test first.
---

[original SKILL.md body follows]
```

### Legacy single-file rules (`.windsurfrules`)

Older Windsurf versions read a single `.windsurfrules` file at the repo root. To use it, concatenate your
2–3 most important skills:

```bash
cat /path/to/achilles-skills/skills/test-driven-development/SKILL.md > .windsurfrules
printf '\n---\n' >> .windsurfrules
cat /path/to/achilles-skills/skills/incremental-implementation/SKILL.md >> .windsurfrules
printf '\n---\n' >> .windsurfrules
cat /path/to/achilles-skills/skills/code-review/SKILL.md >> .windsurfrules
```

### Global rules

For skills you want across **every** project, add them to Windsurf's global rules instead of per-repo:

1. Open Windsurf → **Settings → Cascade → Memories and Rules → Global Rules** (or edit
   `~/.codeium/windsurf/memories/global_rules.md`).
2. Paste the body of your most-used skills (e.g. `git-workflow`, `using-agent-skills`).

> Windsurf caps the size of rules files (roughly a few thousand characters each, with a combined
> project + global budget). Keep each rule focused on one skill and lean on `manual` / `glob` activation so
> you only pay for what the current task needs.

## Workflows ↔ the 9 commands

Windsurf **Workflows** are markdown files in `.windsurf/workflows/`, invoked as `/<name>` inside Cascade —
the closest analog to achilles-skills' slash commands. Recreate the 9 commands as workflows that tell
Cascade which underlying skill(s) to apply:

| Workflow (`/name`) | achilles-skills command | Underlying skills to reference |
|---|---|---|
| `/ideate` | /ideate | interview-me, then idea-refine |
| `/spec` | /spec | spec-grilling (+ to-prd, acceptance-criteria, environment-manifest, frontend-design, spec-review) |
| `/plan` | /plan | plan-breakdown (+ codebase-research first) |
| `/implement` | /implement | incremental-implementation (applies test-driven-development) |
| `/verify` | /verify | quality-verification |
| `/review` | /review | code-review (+ code-simplification, security-and-hardening, performance-optimization as a fan-out) |
| `/ship` | /ship | shipping-and-launch (+ pull-request) |
| `/orchestrate` | /orchestrate | orchestrator (wave-parallel DAG runner to open PRs) |
| `/setup` | /setup | project-setup |

Example — `.windsurf/workflows/review.md`:

```markdown
---
description: Quality gate before merge — five-axis review plus the cleanup lenses.
---

Review the current diff using these achilles-skills, in order:

1. Apply `skills/code-review/SKILL.md` (five-axis review incl. test quality; severity labels).
2. Then `skills/code-simplification/SKILL.md` (behavior-preserving reduction; Chesterton's Fence).
3. Then `skills/security-and-hardening/SKILL.md` (OWASP Top 10; secrets; dependency audit).
4. Then `skills/performance-optimization/SKILL.md` (measure-first; Core Web Vitals; profiling).

Report findings grouped by severity. Do not merge; this is a gate.
```

Paste the relevant `SKILL.md` bodies inline if you want the workflow to be fully self-contained, or keep
the skill files as `manual` rules and `@`-mention them from the workflow.

## Personas (the 5 agents)

The suite's personas are code-cold reviewers — fresh-context roles that apply a skill with no prior
knowledge of how the code was written (preserving maker ≠ checker). In Windsurf, model each as a `manual`
rule you toggle on for a dedicated review pass, then toggle off:

| Persona (`agents/*.md`) | Source skill(s) | Reach for it when… |
|---|---|---|
| code-reviewer | code-review | a slice is green and you need the five-axis review before merge |
| security-auditor | security-and-hardening | a diff touches auth, input handling, secrets, or external I/O |
| test-engineer | test-driven-development + quality-verification | designing the test strategy, or auditing whether a slice's tests are honest |
| performance-auditor | performance-optimization | a slice touches a hot path, data fetching, bundle size, or render cost |
| adversarial-reviewer | doubt-driven-development | a confident, high-stakes, or irreversible in-flight decision needs an independent skeptic |

To run a code-cold pass, open a **new** Cascade conversation (so it has no memory of the implementation),
add the persona file as a manual rule, and paste only the diff.

## The full skill roster (36)

Pick the skills that match your current phase rather than loading all 36 at once.

**Cross-cutting / setup** — using-agent-skills · project-setup · orchestrator · preflight-readiness · handoff

**Ideate (human-led)** — interview-me · idea-refine

**Spec (human-led)** — spec-grilling · to-prd · frontend-design · acceptance-criteria · environment-manifest · spec-review

**Plan (human-led)** — codebase-research · plan-breakdown · codebase-design · api-design

**Implement (agent)** — incremental-implementation · test-driven-development · source-driven-development · worktree

**Verify (agent)** — quality-verification · browser-testing-with-devtools · debugging-and-error-recovery

**Review (agent — parallel fan-out)** — code-review · code-simplification · security-and-hardening · performance-optimization · doubt-driven-development

**Ship (agent)** — pull-request · shipping-and-launch · git-workflow · ci-cd · observability-and-instrumentation · deprecation-and-migration · documentation-and-adrs

## Recommended configuration

Windsurf's context is limited, so start narrow:

1. **Always-on (1–2 skills):** `using-agent-skills` (the task → skill dispatcher) and `git-workflow`.
2. **Glob-activated:** `test-driven-development` on `**/*.test.*`, `frontend-design` on `**/*.tsx`.
3. **Manual:** the 5 personas, plus heavyweight Review/Ship skills you only need at gates.
4. Recreate the 9 commands as `/workflows` so the lifecycle is one keystroke away in Cascade.

## Usage tips

1. **Be selective.** Windsurf's rules budget is tight — choose skills that address your biggest quality
   gaps, and prefer `manual` / `glob` activation over `always_on`.
2. **Reference in conversation.** Paste additional skill content into Cascade when working on a specific
   phase (e.g. paste `security-and-hardening` when building auth).
3. **Use references as checklists.** Paste `references/security-checklist.md`,
   `references/performance-checklist.md`, `references/testing-patterns.md`, or
   `references/definition-of-done.md` and ask Cascade to verify each item before you ship.
