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

## The skill roster (36 skills)

Use the **NEW** descriptive names below when copying rule files — the directory name under `skills/` matches
the name in these tables.

**Cross-cutting / setup**

| Skill | Responsibility |
|---|---|
| `using-agent-skills` | meta-dispatcher: task → skill + lifecycle map |
| `project-setup` | one-time repo ecosystem: STATE.md · CONTEXT.md · docs/adr/ · docs/features/ |
| `orchestrator` | default wave-parallel DAG executor; platform-adaptive; autonomous to open PRs |
| `preflight-readiness` | env-readiness gate; blocks the wave until provisioned |
| `handoff` | per-session compaction to a fresh-agent doc |

**Ideate (human-led)**

| Skill | Responsibility |
|---|---|
| `interview-me` | optional front door: brainstorm + frame an idea → `intent.md` |
| `idea-refine` | refine the idea (divergent/convergent + "Not Doing") |

**Spec (human-led)**

| Skill | Responsibility |
|---|---|
| `spec-grilling` | design the product from intent → ADRs + CONTEXT.md |
| `to-prd` | light dual-audience PRD (product-altitude; references ADRs) |
| `frontend-design` | the one UI skill: explore variants → commit prototype + design contract |
| `acceptance-criteria` | BDD prose contract (Given/When/Then), behavioral-only, signed |
| `environment-manifest` | typed-kind manifest (no values, no commands) |
| `spec-review` | fresh code-cold agent fixes the spec before the user reviews |

**Plan (human-led)**

| Skill | Responsibility |
|---|---|
| `codebase-research` | goal-blind parallel map of the codebase/DB as-is |
| `plan-breakdown` | THE planner: concrete plan → vertical slices + dependency DAG |
| `codebase-design` | referenced discipline: deep-module interfaces (deletion test) |
| `api-design` | referenced discipline: contract-first interface |

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
| `browser-testing-with-devtools` | the live-runtime engine quality-verification drives (Chrome DevTools MCP) |
| `debugging-and-error-recovery` | five-step triage; stop-the-line; safe fallbacks |

**Review (agent — parallel fan-out)**

| Skill | Responsibility |
|---|---|
| `code-review` | five-axis review incl. test quality; severity labels |
| `code-simplification` | behavior-preserving reduction; Chesterton's Fence |
| `security-and-hardening` | OWASP Top 10; secrets; dependency audit |
| `performance-optimization` | measure-first; Core Web Vitals; profiling |
| `doubt-driven-development` | in-flight adversarial review (not a merge gate) |

**Ship (agent)**

| Skill | Responsibility |
|---|---|
| `pull-request` | per-slice design-anchored draft PR; read-the-code checklist; risk band |
| `shipping-and-launch` | release: pre-launch checklist; staged rollout; rollback |
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
- **Spec** → `spec-grilling.md`, `to-prd.md`, `acceptance-criteria.md`, `environment-manifest.md`, `frontend-design.md`, `spec-review.md`
- **Plan** → `codebase-research.md`, `plan-breakdown.md`, `codebase-design.md`, `api-design.md`
- **Implement** → `source-driven-development.md`, `worktree.md` (plus the essentials above)
- **Verify** → `quality-verification.md`, `browser-testing-with-devtools.md`, `debugging-and-error-recovery.md`
- **Review** → `code-simplification.md`, `security-and-hardening.md`, `performance-optimization.md`, `doubt-driven-development.md`
- **Ship** → `pull-request.md`, `shipping-and-launch.md`, `git-workflow.md`, `ci-cd.md`, `observability-and-instrumentation.md`, `deprecation-and-migration.md`, `documentation-and-adrs.md`

For example, when working on performance, copy `performance-optimization/SKILL.md` into `.cursor/rules/`
(or paste the `references/performance-checklist.md` content directly), then remove it once the audit lands.

## Lifecycle commands in Cursor

The suite ships nine slash commands as `commands/*.toml` — these are entry points for agents (like Claude
Code) that execute `.toml` commands natively. **Cursor has no native slash-command runner**, so reproduce a
command by loading the rule files it bundles and asking Cursor to run that stage:

| Command | Load these rules into `.cursor/rules/` | Then ask Cursor to… |
|---|---|---|
| `/ideate` | `interview-me`, `idea-refine` | brainstorm and frame the idea → `intent.md` |
| `/spec` | `spec-grilling` (+ `to-prd`, `acceptance-criteria`, `environment-manifest`, `frontend-design`, `spec-review`) | design the product from intent |
| `/plan` | `plan-breakdown` (+ `codebase-research` first) | produce a concrete plan → vertical slices + DAG |
| `/implement` | `incremental-implementation` (applies `test-driven-development`) | build one thin slice (default single-slice) |
| `/verify` | `quality-verification` | prove a finished slice meets `acceptance.md`, code-cold |
| `/review` | `code-review` (+ `code-simplification`, `security-and-hardening`, `performance-optimization` as fan-out) | run the quality gate before merge |
| `/ship` | `shipping-and-launch` (+ `pull-request`) | release: checklist · staged rollout · rollback |
| `/orchestrate` | `orchestrator` | run the autonomous wave-parallel DAG to open PRs |
| `/setup` | `project-setup` | scaffold the one-time repo ecosystem |

The `commands/*.toml` files are short — open the one you want and copy its prompt text into Cursor verbatim
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
4. **Drive commands from their `.toml`** — Cursor can't run `commands/*.toml` directly, so load the rules a
   command bundles (see the table above) or paste the command's prompt text to reproduce the stage.
5. **Load `references/` on demand** — the suite's checklists live in `references/` (testing-patterns,
   performance-checklist, security-checklist, observability-checklist, accessibility-checklist,
   orchestration-patterns, definition-of-done). Paste the relevant one rather than the whole skill when you
   only need the checklist.
