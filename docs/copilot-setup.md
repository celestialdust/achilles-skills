# Using achilles-skills with GitHub Copilot

achilles-skills is a plugin of 36 engineering skills, 5 reusable agent personas, and 9 lifecycle
commands that drive a product from **Ideate → Spec → Plan → Implement → Verify → Review → Ship**. The
primary distribution target is Claude Code (`/plugin marketplace add celestialdust/achilles-skills`), but
GitHub Copilot can consume the same `skills/` and `agents/` directories directly.

This guide shows how to wire the suite into Copilot's three native extension points: agent skills
(`.github/skills/`), agent personas (`.github/agents/*.agent.md`), and project instructions
(`.github/copilot-instructions.md`).

## Setup

First, get the repo (Copilot reads skills from files in your project, so the suite has to live on disk):

```bash
git clone https://github.com/celestialdust/achilles-skills.git
```

### Agent Skills

Copilot supports agent skills via a `.github/skills`, `.claude/skills`, or `.agents/skills` directory in
your repository. Each skill is a `SKILL.md` inside its own directory.

```bash
mkdir -p .github/skills

# Option A — install the full 36-skill roster
cp -R achilles-skills/skills/* .github/skills/

# Option B — cherry-pick the essentials
mkdir -p .github/skills/test-driven-development .github/skills/code-review
cp achilles-skills/skills/test-driven-development/SKILL.md .github/skills/test-driven-development/SKILL.md
cp achilles-skills/skills/code-review/SKILL.md             .github/skills/code-review/SKILL.md
```

For more details, refer to [Creating agent skills for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills).

#### The 36-skill roster (new names)

The suite is organized by lifecycle stage. Each name below is a directory under `skills/`:

**Cross-cutting / setup**
- `using-agent-skills` — meta-dispatcher: task → skill + lifecycle map
- `project-setup` — one-time repo ecosystem (STATE.md, CONTEXT.md, docs/adr/, docs/features/)
- `orchestrator` — default wave-parallel DAG executor; autonomous to open PRs
- `preflight-readiness` — env-readiness gate; blocks the wave until provisioned
- `handoff` — per-session compaction to a fresh-agent doc

**Ideate**
- `interview-me` — brainstorm + frame an idea → intent.md
- `idea-refine` — refine the idea (divergent/convergent + "Not Doing")

**Spec**
- `spec-grilling` — design the product from intent → ADRs + CONTEXT.md
- `to-prd` — light dual-audience PRD referencing ADRs
- `frontend-design` — explore UI variants → commit prototype + design contract
- `acceptance-criteria` — BDD prose contract (Given/When/Then), signed
- `environment-manifest` — typed-kind manifest (no values, no commands)
- `spec-review` — fresh code-cold agent fixes the spec before the user reviews

**Plan**
- `codebase-research` — goal-blind parallel map of the codebase/DB as-is
- `plan-breakdown` — the planner: concrete plan → vertical slices + dependency DAG
- `codebase-design` — deep-module interfaces (deletion test)
- `api-design` — contract-first interface

**Implement**
- `incremental-implementation` — the implementer: one thin vertical slice; skeleton-first
- `test-driven-development` — rigid RED-GREEN-REFACTOR core loop
- `source-driven-development` — ground framework decisions in fetched official docs
- `worktree` — per-slice isolation mechanism (orchestrator-owned)

**Verify**
- `quality-verification` — fresh code-cold agent: behavioral acceptance tests + design gate
- `browser-testing-with-devtools` — live-runtime engine (Chrome DevTools MCP)
- `debugging-and-error-recovery` — five-step triage; stop-the-line; safe fallbacks

**Review**
- `code-review` — five-axis review incl. test quality; severity labels
- `code-simplification` — behavior-preserving reduction; Chesterton's Fence
- `security-and-hardening` — OWASP Top 10; secrets; dependency audit
- `performance-optimization` — measure-first; Core Web Vitals; profiling
- `doubt-driven-development` — in-flight adversarial review (not a merge gate)

**Ship**
- `pull-request` — per-slice design-anchored draft PR; read-the-code checklist; risk band
- `shipping-and-launch` — release: pre-launch checklist; staged rollout; rollback
- `git-workflow` — trunk-based; atomic commits; secret hygiene
- `ci-cd` — Shift Left; quality-gate pipeline; feature flags
- `observability-and-instrumentation` — structured logging; RED metrics; OTel tracing
- `deprecation-and-migration` — code-as-liability; migration patterns
- `documentation-and-adrs` — the ADR + doc standard

### Agent Personas (*.agent.md)

Copilot supports specialized agent personas. achilles-skills ships 5 in `agents/`.

> **Important:** GitHub Copilot requires custom agent files to be named `*.agent.md`.
> Files named `*.md` are silently ignored by Copilot.
> See [VS Code custom agents docs](https://code.visualstudio.com/docs/copilot/customization/custom-agents#_custom-agent-file-structure) for details.

```bash
mkdir -p .github/agents

cp achilles-skills/agents/code-reviewer.md        .github/agents/code-reviewer.agent.md
cp achilles-skills/agents/security-auditor.md     .github/agents/security-auditor.agent.md
cp achilles-skills/agents/test-engineer.md        .github/agents/test-engineer.agent.md
cp achilles-skills/agents/performance-auditor.md  .github/agents/performance-auditor.agent.md
cp achilles-skills/agents/adversarial-reviewer.md .github/agents/adversarial-reviewer.agent.md
```

Each persona is the code-cold *role* that applies a review skill with no prior context, preserving
maker ≠ checker:

| Persona | Source skill | Reach for it when |
|---|---|---|
| `code-reviewer` | code-review | a slice is green and needs the five-axis review before merge |
| `security-auditor` | security-and-hardening | a diff touches auth, input handling, secrets, or external I/O |
| `test-engineer` | test-driven-development + quality-verification | designing the test strategy or proving a slice meets acceptance.md |
| `performance-auditor` | performance-optimization | a slice touches a hot path, data fetching, bundle size, or render cost |
| `adversarial-reviewer` | doubt-driven-development | a confident, high-stakes, or irreversible in-flight decision needs an independent skeptic |

Invoke agents in Copilot Chat:
- `@code-reviewer Review this PR`
- `@security-auditor Check this endpoint for vulnerabilities`
- `@test-engineer Analyze test coverage for this module`
- `@performance-auditor Profile the hot path in this request handler`
- `@adversarial-reviewer Pressure-test the assumption behind this migration`

### Custom Instructions (User Level)

For skills you want across all repositories:

1. Open VS Code → Settings → GitHub Copilot → Custom Instructions
2. Add your most-used skill summaries

## Recommended Configuration

### .github/copilot-instructions.md

GitHub Copilot supports project-level instructions via `.github/copilot-instructions.md`. The following
mirrors the achilles-skills lifecycle (Ideate → Spec → Plan → Implement → Verify → Review → Ship).

```markdown
# Project Coding Standards

## Lifecycle
- Move work through: Ideate → Spec → Plan → Implement → Verify → Review → Ship
- The human owns Ideate, Spec, and Plan; the agent runs Implement → Ship and stops at an open draft PR
- Never auto-merge to main; terminate at a risk-banded draft PR for async human review

## Implementation
- Build in small, verifiable vertical slices; skeleton-first
- Each slice: implement → test → verify → commit
- Never mix formatting changes with behavior changes

## Testing (test-driven-development + quality-verification)
- Write the failing test before the code (RED-GREEN-REFACTOR)
- For bugs: write a failing test first, then fix
- Test hierarchy: unit > integration > e2e (use the lowest level that captures the behavior)
- Verify a finished slice code-cold against its acceptance.md before calling it done

## Code Quality (code-review + code-simplification)
- Review across five axes: correctness, readability, architecture, security, performance
- Prefer behavior-preserving simplification; respect Chesterton's Fence before deleting
- Every PR must pass: lint, type check, tests, build

## Security (security-and-hardening)
- Audit auth, input handling, secrets, and external I/O against OWASP Top 10
- No secrets in code or version control; run a dependency audit

## Boundaries
- Always: run tests before commits, validate user input, keep commits atomic
- Ask first: database schema changes, new dependencies
- Never: commit secrets, remove failing tests, skip verification, auto-merge to main
```

### Lifecycle Commands

In Claude Code, achilles-skills exposes 9 slash commands (`commands/*.toml`) that wrap the skills above.
Copilot does not load `.toml` slash commands, so reach for the underlying skill or persona instead. The
mapping is the same:

| Command | Invokes (skill) | Copilot equivalent |
|---|---|---|
| /ideate | interview-me, then idea-refine | paste the skill into chat for the framing pass |
| /spec | spec-grilling (+ to-prd, acceptance-criteria, environment-manifest, frontend-design, spec-review) | paste skill content for the design pass |
| /plan | plan-breakdown (+ codebase-research first) | paste skill content for the planning pass |
| /implement | incremental-implementation (applies test-driven-development) | follow the slice workflow in chat |
| /verify | quality-verification | `@test-engineer` |
| /review | code-review (+ code-simplification, security-and-hardening, performance-optimization) | `@code-reviewer`, `@security-auditor`, `@performance-auditor` |
| /ship | shipping-and-launch (+ pull-request) | paste skill content for the release pass |
| /orchestrate | orchestrator | the autonomous wave-parallel DAG runner (Claude Code primary) |
| /setup | project-setup | paste skill content for the one-time repo bootstrap |

## Usage Tips

1. **Keep instructions concise** — Copilot instructions work best when focused. Summarize the key rules
   rather than including full skill files.
2. **Use personas for review** — code-reviewer, security-auditor, test-engineer, performance-auditor,
   and adversarial-reviewer are designed for Copilot's agent model.
3. **Reference in chat** — When working on a specific lifecycle phase, paste the relevant skill content
   into Copilot Chat for context.
4. **Combine with PR reviews** — Set up Copilot to review PRs using the code-reviewer persona, and let
   the security-auditor persona gate any diff that touches auth, secrets, or external I/O.
