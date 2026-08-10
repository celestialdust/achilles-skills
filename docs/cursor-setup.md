# Using achilles-skills with Cursor

[achilles-skills](https://github.com/celestialdust/achilles-skills) is an independent, self-contained
skill suite that automates **Ideate → Spec → Plan → Implement → Verify → Review → Ship**. Cursor loads
rules from local files, so you point it at the skills you've cloned — there is no marketplace install for
Cursor.

## Prerequisites

Clone the suite somewhere on disk (Cursor reads rule files locally, not from a plugin marketplace):

```bash
git clone https://github.com/celestialdust/achilles-skills.git
```

All paths below assume the clone lives at `/path/to/achilles-skills`. Each skill is a single
`skills/<name>/SKILL.md` file with two-key (`name` + `description`) frontmatter.

## Setup

### Option 1: Rules Directory (Recommended)

Cursor supports a `.cursor/rules/` directory for project-specific rules:

```bash
# Create the rules directory
mkdir -p .cursor/rules

# Copy the skills you want as rules
cp /path/to/achilles-skills/skills/test-driven-development/SKILL.md .cursor/rules/test-driven-development.md
cp /path/to/achilles-skills/skills/code-review/SKILL.md .cursor/rules/code-review.md
cp /path/to/achilles-skills/skills/incremental-implementation/SKILL.md .cursor/rules/incremental-implementation.md
```

Rules in this directory are available to Cursor's Agent. Plain `.md` copies (as above) are read when you
reference them; for fine-grained control over *when* a rule attaches, save the file as `.mdc` and add Cursor
rule metadata at the top:

```mdc
---
description: RED-GREEN-REFACTOR core loop; realizes acceptance scenarios
globs: ["**/*.test.*", "**/*.spec.*"]
alwaysApply: false
---
```

With `.mdc` metadata you can make a rule **Always** (`alwaysApply: true`), **Auto Attached** (by `globs`),
**Agent Requested** (matched on `description`), or **Manual** (invoked by name). This is the accurate way to
keep phase-specific skills out of context until the matching files are touched.

### Option 2: .cursorrules File

Create a `.cursorrules` file in your project root with the essential skills inlined:

```bash
# Generate a combined rules file
cat /path/to/achilles-skills/skills/test-driven-development/SKILL.md > .cursorrules
printf '\n---\n' >> .cursorrules
cat /path/to/achilles-skills/skills/code-review/SKILL.md >> .cursorrules
```

`.cursorrules` is the legacy single-file format; prefer Option 1 for anything beyond two or three skills so
you can load and unload disciplines independently and stay under Cursor's context limits.

## The skill roster (40 skills)

Use the **NEW** descriptive names below when copying rule files — the directory name under `skills/` matches
the name in these tables.

**Cross-cutting / setup**

| Skill | Responsibility |
|---|---|
| `using-agent-skills` | meta-dispatcher: task → skill + lifecycle map |
| `project-setup` | one-time repo ecosystem: STATE.md · CONTEXT.md · docs/adr/ · docs/features/ · docs/test-contract.md · docs/workflow.md · docs/session-state.md · docs/progress.md · docs/lessons.md · the `## Agent skills` block in one of CLAUDE.md / AGENTS.md + a short pointer to it in the other |
| `orchestrator` | default wave-parallel DAG executor; platform-adaptive; autonomous to open PRs |
| `preflight-readiness` | env-readiness gate; blocks the wave until provisioned |
| `handoff` | per-session compaction to a fresh-agent doc |
| `literate-explainer` | standalone: explain code or a system in prose (`/explain`) |
| `comprehension-quiz` | standalone: check comprehension of a change or codebase area (`/quiz`) |
| `gauntlet-loop` | standalone: a throwaway proof of concept against a named outside bar, in the `.gauntlet/` scratch (`/gauntlet-loop`); offered, never auto-selected |

**Ideate (human-led)**

| Skill | Responsibility |
|---|---|
| `interview-me` | optional front door: brainstorm + frame an idea → `intent.md` |
| `idea-refine` | refine the idea (divergent/convergent + "Not Doing") |

**Spec (human-led)**

| Skill | Responsibility |
|---|---|
| `codebase-research` | head of Spec: goal-blind parallel map of the codebase/DB as-is → `research.md` |
| `spec-grilling` | design the product from intent + the survey → ADRs + CONTEXT.md (refuses without `research.md`) |
| `to-prd` | light dual-audience PRD (product-altitude; references ADRs) |
| `frontend-design` | the one UI skill: explore variants → commit prototype + design contract; the repo's first UI surface also writes `docs/design.md`. Spec, after `to-prd` and before `acceptance-criteria` and `environment-manifest` run |
| `acceptance-criteria` | BDD prose contract (Given/When/Then), behavioral-only, signed |
| `environment-manifest` | typed-kind manifest (no values, no commands) |
| `architecture-design` | reconciles and renders — traces every scenario, records the invariants, cites the decisions taken in `spec-grilling`; takes none itself. Runs against a draft `acceptance.md`; the two are signed together at the Spec gate. Writes `architecture.md` + the committed `architecture.html`; the repo's first such pass also writes `ARCHITECTURE.md` |
| `spec-review` | fresh code-cold agent fixes the spec before the user reviews |

**Plan (human-led)**

| Skill | Responsibility |
|---|---|
| `plan-breakdown` | THE planner: concrete plan → vertical slices + dependency DAG; reads Spec's `research.md` |

**Spec · Plan (referenced disciplines, not a stage)**

| Skill | Responsibility |
|---|---|
| `codebase-design` | deep-module interfaces (deletion test). Proposes a structural variant in Spec, pins the interface into `plan.md` in Plan; owns no artifact of its own |
| `api-design` | contract-first interface. Proposes a structural variant in Spec, pins the interface into `plan.md` in Plan; owns no artifact of its own |

**Plan · Implement (in-flight, not a gate)**

| Skill | Responsibility |
|---|---|
| `doubt-driven-development` | in-flight adversarial review; not part of the Review gate |

**Implement (agent)**

| Skill | Responsibility |
|---|---|
| `incremental-implementation` | THE implementer: one thin vertical slice; skeleton-first |
| `test-driven-development` | rigid RED-GREEN-REFACTOR core loop; realizes acceptance scenarios |
| `source-driven-development` | ground framework decisions in fetched official docs |
| `worktree` | per-slice isolation mechanism (orchestrator-owned) |

**Verify (agent)**

| Skill | Responsibility |
|---|---|
| `quality-verification` | fresh code-cold agent: behavioral acceptance tests + design gate |
| `browser-testing-with-devtools` | the live-runtime engine quality-verification drives (any configured browser MCP: Chrome DevTools, Claude-in-Chrome, Playwright, or agent-browser) |
| `debugging-and-error-recovery` | five-step triage; stop-the-line; safe fallbacks |

**Review (agent — parallel fan-out)**

| Skill | Responsibility |
|---|---|
| `code-review` | five-axis review incl. test quality; severity labels |
| `code-simplification` | behavior-preserving reduction; Chesterton's Fence |
| `security-and-hardening` | OWASP Top 10; secrets; dependency audit |
| `performance-optimization` | measure-first; Core Web Vitals; profiling |

**Ship (agent)**

| Skill | Responsibility |
|---|---|
| `pull-request` | per-slice design-anchored draft PR; read-the-code checklist; risk band |
| `shipping-and-launch` | release-level, on the far side of the human's merge: pre-launch checklist; staged rollout; rollback |
| `git-workflow` | trunk-based; atomic commits; secret hygiene |
| `ci-cd` | Shift Left; quality-gate pipeline; feature flags |
| `observability-and-instrumentation` | structured logging; RED metrics; OTel tracing |
| `deprecation-and-migration` | code-as-liability; migration patterns |
| `documentation-and-adrs` | the ADR + doc standard, referenced cross-cutting |

## Recommended Configuration

### Essential Skills (Always Load)

Add these three to `.cursor/rules/` — they carry the inner Implement → Verify → Review loop:

1. `test-driven-development.md` — RED-GREEN-REFACTOR core loop
2. `code-review.md` — five-axis review incl. test quality
3. `incremental-implementation.md` — build in small, verifiable vertical slices

### Phase-Specific Skills (Load on Demand)

Add a rule file when you enter its stage, then remove it when done to manage context limits:

- **Ideate** → `interview-me.md`, `idea-refine.md`
- **Spec** → `codebase-research.md` (first), `spec-grilling.md` (which dispatches `codebase-design.md` / `api-design.md`), `to-prd.md`, `frontend-design.md`, `acceptance-criteria.md`, `environment-manifest.md`, `architecture-design.md`, `spec-review.md`
- **Plan** → `plan-breakdown.md`, `codebase-design.md`, `api-design.md`, `doubt-driven-development.md` (re-add `codebase-research.md` only to survey a named gap)
- **Implement** → `source-driven-development.md`, `worktree.md`, `doubt-driven-development.md` (plus the essentials above)
- **Verify** → `quality-verification.md`, `browser-testing-with-devtools.md`, `debugging-and-error-recovery.md`
- **Review** → `code-simplification.md`, `security-and-hardening.md`, `performance-optimization.md`
- **Ship** → `pull-request.md`, `shipping-and-launch.md`, `git-workflow.md`, `ci-cd.md`, `observability-and-instrumentation.md`, `deprecation-and-migration.md`, `documentation-and-adrs.md`

For example, when working on performance, copy `performance-optimization/SKILL.md` into `.cursor/rules/`
(or paste the `references/performance-checklist.md` content directly), then remove it once the audit lands.

## Lifecycle commands in Cursor

The suite ships twelve slash commands as `commands/*.md` — nine lifecycle plus three standalone (`/explain`,
`/quiz`, `/gauntlet-loop`) — these are entry points for agents (like Claude
Code) that execute Markdown slash commands natively. **Cursor has no native slash-command runner**, so reproduce a
command by loading the rule files it bundles and asking Cursor to run that stage:

| Command | Load these rules into `.cursor/rules/` | Then ask Cursor to… |
|---|---|---|
| `/ideate` | `interview-me`, `idea-refine` | brainstorm and frame the idea → `intent.md` |
| `/spec` | `codebase-research` first, then `spec-grilling` (+ `to-prd`, `frontend-design`, `acceptance-criteria`, `environment-manifest`, `architecture-design`, `spec-review`) | survey the code as-is, then design the product against it |
| `/plan` | `plan-breakdown` (reuses Spec's `research.md`) | produce a concrete plan → vertical slices + DAG |
| `/implement` | `incremental-implementation` (applies `test-driven-development`) | build one thin slice (default single-slice) |
| `/verify` | `quality-verification` | prove a finished slice meets `acceptance.md`, code-cold |
| `/review` | `code-review` (+ `code-simplification`, `security-and-hardening`, `performance-optimization` as fan-out) | run the quality gate before merge |
| `/ship` | `pull-request` — the spine of the stage | open one slice's risk-banded draft PR; the stage ends there. `shipping-and-launch` is release-level and follows the human's merge. |
| `/orchestrate` | `orchestrator` | run the autonomous wave-parallel DAG to open PRs |
| `/setup` | `project-setup` | scaffold the one-time repo ecosystem |
| `/explain` | `literate-explainer` | explain code or a system in prose (**standalone**, no stage) |
| `/quiz` | `comprehension-quiz` | check comprehension of a change or codebase area (**standalone**, no stage) |
| `/gauntlet-loop` | `gauntlet-loop` | build a throwaway proof of concept against a named outside bar, in the `.gauntlet/` scratch (**standalone**, no stage; offered, never auto-selected) |

The `commands/*.md` files are short — open the one you want and copy its prompt text into Cursor verbatim
to drive the stage exactly as the command would.

## Review personas in Cursor

The suite ships five reusable review personas in `agents/`. A persona is a *role* that applies a skill's
*method* with no prior context, preserving **maker ≠ checker**. Claude Code dispatches them as fresh
subagents; in Cursor you approximate this by **opening a new chat** (so the reviewer is code-cold), pasting
the persona file as context, and asking it to review your diff.

| Persona (`agents/<name>.md`) | Applies skill | Reach for it when… |
|---|---|---|
| `code-reviewer.md` | `code-review` | a slice is green and you need the five-axis review before merge |
| `security-auditor.md` | `security-and-hardening` | a diff touches auth, input handling, secrets, or external I/O |
| `test-engineer.md` | `test-driven-development` + `quality-verification` | designing the test strategy, or auditing whether a slice's tests are honest |
| `performance-auditor.md` | `performance-optimization` | a slice touches a hot path, data fetching, bundle size, or render cost |
| `adversarial-reviewer.md` | `doubt-driven-development` | a confident, high-stakes, or irreversible in-flight decision needs an independent skeptic |

Example: in a fresh Cursor chat, paste `agents/code-reviewer.md` and say *"Review this diff using this code
review framework."*

## Usage Tips

1. **Don't load all skills at once** — Cursor has context limits. Load the 2–3 essential skills as rules and
   add phase-specific skills (and their `references/` checklists) on demand.
2. **Reference skills explicitly** — tell Cursor *"Follow the test-driven-development rules for this change"*
   so it actually reads the loaded rule.
3. **Use a fresh chat for review personas** — paste the persona file into a new conversation so the reviewer
   is code-cold; that is how you preserve maker ≠ checker without native subagents.
4. **Drive commands from their `.md`** — Cursor can't run `commands/*.md` directly, so load the rules a
   command bundles (see the table above) or paste the command's prompt text to reproduce the stage.
5. **Load `references/` on demand** — the suite's shared material lives in `references/`;
   [docs/getting-started.md](./getting-started.md) maps every file there to the skills that use it.
   Paste the relevant one rather than the whole skill when you only need the checklist.
