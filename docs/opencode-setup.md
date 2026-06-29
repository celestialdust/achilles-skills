# OpenCode Setup

This guide explains how to use **achilles-skills** with OpenCode in a way that closely mirrors the Claude Code experience: automatic skill selection, lifecycle-driven workflows (Ideate → Spec → Plan → Implement → Verify → Review → Ship), and strict process enforcement.

## Overview

OpenCode supports custom `/commands`, but does not have a native plugin system or automatic skill routing like Claude Code.

achilles-skills achieves parity through:

- A strong system prompt (`AGENTS.md`)
- The built-in `skill` tool
- Consistent skill discovery from the `skills/` directory
- Optional code-cold **personas** (`agents/`) dispatched as subagents for review passes

This creates an **agent-driven workflow** where skills are selected and executed automatically.

While it is possible to recreate `/spec`, `/plan`, and the other commands in OpenCode, this integration intentionally uses an agent-driven approach instead:

- Skills are selected automatically based on intent
- Workflows are enforced via `AGENTS.md`
- No manual command invocation is required

This more closely matches how Claude Code behaves in practice, where skills are triggered automatically rather than manually.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/celestialdust/achilles-skills.git
```

2. Open the project in OpenCode.

3. Ensure the following are present in your workspace:

- `AGENTS.md` (root)
- `skills/` directory (36 skills)
- `agents/` directory (5 personas) — optional, used for code-cold review subagents

No additional installation is required.

---

## How It Works

### 1. Skill Discovery

All 36 skills live in:

```
skills/<skill-name>/SKILL.md
```

OpenCode agents are instructed (via `AGENTS.md`) to:

- Detect when a skill applies
- Invoke the `skill` tool
- Follow the skill exactly (do not partially apply it)

### 2. Automatic Skill Invocation

The agent evaluates every request and maps it to the appropriate skill. Start each session with the **`using-agent-skills`** meta-dispatcher loaded — it maps a task to the right skill plus its lifecycle stage.

Examples:

- "build a feature" → `incremental-implementation` + `test-driven-development`
- "ground this framework decision in real docs" → `source-driven-development`
- "fix a bug" → `debugging-and-error-recovery`
- "review this code" → `code-review`
- "is this slice actually done?" → `quality-verification`
- "make this simpler" → `code-simplification`

The user does **not** need to explicitly request skills.

### 3. Lifecycle Mapping (Implicit Commands)

OpenCode does not require slash commands like `/spec` or `/plan`. The same lifecycle that the 9 commands in `commands/` encode is followed implicitly. The human owns Ideate, Spec, and Plan; the agent runs Implement → Ship autonomously, terminating at risk-banded **open draft PRs** for async human merge (never auto-merging to main).

| Stage | Command equivalent | Skills the agent invokes |
|---|---|---|
| IDEATE | `/ideate` | `interview-me`, then `idea-refine` |
| SPEC | `/spec` | `spec-grilling` (+ `to-prd`, `acceptance-criteria`, `environment-manifest`, `frontend-design`, `spec-review`) |
| PLAN | `/plan` | `plan-breakdown` (after `codebase-research`; references `codebase-design`, `api-design`) |
| IMPLEMENT | `/implement` | `incremental-implementation` (applies `test-driven-development`; `source-driven-development` for framework calls; `worktree` for isolation) |
| VERIFY | `/verify` | `quality-verification` (drives `browser-testing-with-devtools`; `debugging-and-error-recovery` on failure) |
| REVIEW | `/review` | `code-review` (+ `code-simplification`, `security-and-hardening`, `performance-optimization` fan-out; `doubt-driven-development` in-flight) |
| SHIP | `/ship` | `shipping-and-launch` (+ `pull-request`, `git-workflow`, `ci-cd`, `observability-and-instrumentation`, `deprecation-and-migration`, `documentation-and-adrs`) |

Two cross-cutting commands round out the set:

- `/orchestrate` → `orchestrator` — the autonomous wave-parallel DAG runner that drives every slice Implement → Ship to open draft PRs. Its readiness gate is `preflight-readiness`; per-session compaction is `handoff`.
- `/setup` → `project-setup` — one-time repo ecosystem bootstrap (`STATE.md`, `CONTEXT.md`, `docs/adr/`, `docs/features/`).

In OpenCode, treat these as internal lifecycle phases the agent moves through, not buttons the user presses.

### 4. Personas (Code-Cold Review Subagents)

For a fresh-context, code-cold pass that preserves maker ≠ checker, dispatch one of the 5 personas in `agents/` as an independent subagent. Each persona is a *role* that applies a review skill (the *method*) with no prior context:

| Persona (`agents/<name>.md`) | Applies skill | Dispatch when |
|---|---|---|
| `code-reviewer` | `code-review` | a slice is green and needs the five-axis review before merge |
| `security-auditor` | `security-and-hardening` | a diff touches auth, input handling, secrets, or external I/O |
| `test-engineer` | `test-driven-development` + `quality-verification` | designing the test strategy, or proving a finished slice meets `acceptance.md` |
| `performance-auditor` | `performance-optimization` | a slice touches a hot path, data fetching, bundle size, or render cost |
| `adversarial-reviewer` | `doubt-driven-development` | a confident, high-stakes, or irreversible in-flight decision needs an independent skeptic |

In OpenCode, load the persona file into a fresh subagent session (or paste it as that subagent's system prompt) so the review runs with no memory of how the code was written.

---

## Usage Examples

### Example 1: Feature Development

User:
```
Add authentication to this app
```

Agent behavior:
- Detects feature work
- Invokes `spec-grilling` to design the product, producing the signed spec (`acceptance.md`, `environment.md`, ADRs)
- Moves to `plan-breakdown` for vertical slices + dependency DAG
- Implements with `incremental-implementation` + `test-driven-development`

---

### Example 2: Bug Fix

User:
```
This endpoint is returning 500 errors
```

Agent behavior:
- Invokes `debugging-and-error-recovery`
- Reproduces → localizes → fixes → adds guards
- Stops the line on an unexplained failure rather than guessing

---

### Example 3: Code Review

User:
```
Review this PR
```

Agent behavior:
- Invokes `code-review` (five-axis review incl. test quality, with severity labels)
- For a code-cold pass, dispatches the `code-reviewer` persona as a fresh subagent
- Fans out to `security-and-hardening` and `performance-optimization` when the diff warrants it

---

## Agent Expectations (Critical)

For OpenCode to work correctly, the agent must follow these rules:

- Always check if a skill applies before acting
- If a skill applies, it MUST be used (and followed exactly, not partially)
- Never skip required workflows (spec, plan, test, review)
- Do not jump directly to implementation
- The human owns Ideate, Spec, and Plan; the agent never auto-merges to main — it ends at open draft PRs

These rules are enforced via `AGENTS.md`.

---

## Limitations

- No native slash commands (handled via intent mapping instead — the 9 commands map to lifecycle phases)
- No plugin system (handled via prompt + repository structure)
- Skill invocation depends on model compliance

Despite these, the workflow closely matches Claude Code in practice.

---

## Recommended Workflow

Just use natural language:

- "Refine this idea"
- "Design this feature"
- "Plan this change"
- "Implement this slice"
- "Verify this works"
- "Review this"
- "Ship it"

The agent will automatically select and execute the correct skills, walking the Ideate → Spec → Plan → Implement → Verify → Review → Ship lifecycle.

---

## Summary

OpenCode integration works by combining:

- Structured skills (this repo — 36 skills in `skills/`)
- Reusable code-cold personas (`agents/` — 5 review roles)
- Strong agent rules (`AGENTS.md`)
- Automatic skill invocation via reasoning

This results in a **fully agent-driven, production-grade engineering workflow** without requiring plugins or manual commands.
