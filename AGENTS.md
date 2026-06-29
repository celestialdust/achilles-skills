# AGENTS.md

Guidance for **non-Claude AI coding agents** — OpenCode, Codex, Cursor, GitHub Copilot,
Gemini CLI, Windsurf, Antigravity, Kiro, and any agent that reads instruction files — when working in
the **achilles-skills** repository.

Claude Code consumes this repo natively through `.claude-plugin/plugin.json` (skills auto-route, the 9
slash `commands/` register, the 5 `agents/` personas become subagents). Agents **without** a native plugin
system, slash commands, or subagents get the same behavior through *this file*: it is the system prompt that
makes any agent route work to skills, follow the lifecycle, and respect the autonomy boundary.

---

## Repository overview

achilles-skills is a self-contained suite that automates the development loop
**Ideate → Spec → Plan → Implement → Verify → Review → Ship**. It has three composable layers:

- **Skills** (`skills/<name>/SKILL.md`) — 36 workflows with steps and exit criteria. The *how*. A skill is a
  mandatory hop whenever an intent matches it.
- **Personas** (`agents/<role>.md`) — 5 fresh-context roles with a perspective and an output format. The *who*.
- **Commands** (`commands/<name>.md`) — 9 lifecycle entry points. The *when*. The orchestration layer.

Skills are markdown-first. Each lives at `skills/<kebab-name>/SKILL.md` with two-key YAML frontmatter
(`name`, `description`). Shared reference checklists live in `references/`, not inside skill directories.

---

## Autonomy model (read this first)

The division of labor is fixed. Do not cross it.

- **The human owns Ideate + Spec + Plan** — the thinking. The agent may *assist* (run the interview, draft the
  PRD, map the codebase, propose the plan) but the human signs off before any code exists.
- **The agent owns Implement → Verify → Review → Ship** — and runs it **fully autonomously, never halting
  mid-run**. No "should I continue?" checkpoints between slices.
- **Terminate at risk-banded, open *draft* PRs.** The end state of an autonomous run is one or more draft pull
  requests, each labeled with a risk band, left open for **async human merge**.
- **Never auto-merge to main.** The agent does not merge, does not push to a protected branch, does not close
  the loop. A human merges.
- **maker ≠ checker.** The agent that wrote a slice never reviews or verifies its own work. Verification
  (`quality-verification`) and review (`code-review`, `security-and-hardening`, `performance-optimization`,
  `doubt-driven-development`) run as **fresh, code-cold** passes — dispatched as separate personas where the
  platform supports subagents, or as a clean session otherwise. A self-graded slice is not verified.

If a Spec or Plan input is missing, **stop and ask the human** — do not invent the spec and proceed. If an
in-flight decision is high-stakes, confident, or irreversible, invoke `doubt-driven-development` (the
`adversarial-reviewer`) before committing to it. Autonomy is in *execution*, not in *redefining the goal*.

---

## Skill-driven execution model

For agents with a `skill` tool (OpenCode, Antigravity) or equivalent, these rules are mandatory:

- If a task matches a skill, you **MUST** invoke it. Skills live at `skills/<skill-name>/SKILL.md`.
- Never implement directly when a skill applies.
- Always follow the skill exactly — do not partially apply it. Honor its Verification (ending criteria) and
  its Outputs & handoff contract.
- When unsure which skill applies, start with **`using-agent-skills`** — the meta-dispatcher that maps a task
  to a skill and a lifecycle stage.

For agents **without** a skill tool (Codex, plain-markdown agents): read the matching `SKILL.md` in full and
follow its Process section as written before producing output.

### Per-request loop

1. Determine whether any skill applies (even a 1% chance).
2. Identify the lifecycle stage of the request (DEFINE / PLAN / BUILD / VERIFY / REVIEW / SHIP).
3. Invoke / read the appropriate skill(s) and follow the workflow strictly.
4. Only proceed to implementation after the upstream stages it depends on (spec, plan) are complete and
   signed off by the human.
5. End an autonomous build at risk-banded draft PRs. Never merge.

---

## Intent → skill map (NEW names only)

| When the user wants to… | Route to skill |
|---|---|
| Frame a fresh or vague idea; "interview me" / "grill me" | `interview-me` |
| Explore / refine an idea (divergent → convergent, scope, "Not Doing") | `idea-refine` |
| Design the product, lock decisions, write the glossary | `spec-grilling` |
| Write a PRD | `to-prd` |
| Design or reshape UI / visual / frontend work | `frontend-design` |
| Define acceptance criteria / BDD / Given-When-Then | `acceptance-criteria` |
| Declare required services / env (typed manifest, no values) | `environment-manifest` |
| Fix the spec code-cold before the human reviews it | `spec-review` |
| Map the existing codebase / DB as-is ("how does this work?") | `codebase-research` |
| Break a spec into tasks → vertical slices + dependency DAG | `plan-breakdown` |
| Design a module's interface (deep module / deletion test) | `codebase-design` |
| Design an API / contract-first interface | `api-design` |
| Build a feature / implement one thin slice | `incremental-implementation` |
| Work test-first (Red-Green-Refactor) | `test-driven-development` |
| Make a framework/library decision grounded in official docs | `source-driven-development` |
| Isolate a slice in its own workspace | `worktree` |
| Prove a finished slice meets its acceptance contract | `quality-verification` |
| Inspect/drive anything that runs in a browser (live runtime) | `browser-testing-with-devtools` |
| Diagnose a bug, failure, broken build, or unexpected behavior | `debugging-and-error-recovery` |
| Review a change before merge (five-axis) | `code-review` |
| Reduce complexity while preserving exact behavior | `code-simplification` |
| Audit auth, input handling, secrets, dependencies (OWASP) | `security-and-hardening` |
| Measure/fix performance, Core Web Vitals, hot paths | `performance-optimization` |
| Get an independent skeptic on a confident/high-stakes decision | `doubt-driven-development` |
| Open a per-slice, design-anchored draft PR with a risk band | `pull-request` |
| Plan a release: checklist, staged rollout, rollback | `shipping-and-launch` |
| Commit / branch / keep git history and secrets clean | `git-workflow` |
| Set up CI pipelines, quality gates, feature flags | `ci-cd` |
| Add structured logging, RED metrics, OTel tracing | `observability-and-instrumentation` |
| Remove an old system, migrate users, sunset a feature | `deprecation-and-migration` |
| Record an ADR / document the *why* | `documentation-and-adrs` |
| One-time repo bootstrap (STATE.md, CONTEXT.md, docs/adr/) | `project-setup` |
| Gate a parallel wave on environment readiness | `preflight-readiness` |
| Run the autonomous wave-parallel DAG to open PRs | `orchestrator` |
| Compact a session into a fresh-agent handoff doc | `handoff` |
| Decide which skill applies / start a session | `using-agent-skills` |

---

## Lifecycle map: DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP

achilles-skills runs a 7-stage native lifecycle (Ideate · Spec · Plan · Implement · Verify · Review · Ship).
Agents without slash commands follow it **implicitly** as six macro phases. The first two phases (DEFINE) are
human-owned; the rest run autonomously.

```
   DEFINE            PLAN           BUILD          VERIFY         REVIEW          SHIP
 ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
 │ Ideate │ ───▶ │  Plan  │ ───▶ │Implement│ ───▶ │ Verify │ ───▶ │ Review │ ───▶ │  Ship  │
 │ + Spec │      │        │      │        │      │        │      │ (fan-  │      │ (draft │
 │ human  │      │ human  │      │ agent  │      │ agent  │      │  out)  │      │  PRs)  │
 └────────┘      └────────┘      └────────┘      └────────┘      └────────┘      └────────┘
   /ideate         /plan         /implement       /verify         /review         /ship
   /spec
```

| Macro phase | Native stage(s) | Owner | Skills (NEW names) |
|---|---|---|---|
| **DEFINE** | Ideate + Spec | human | `interview-me`, `idea-refine`; `spec-grilling`, `to-prd`, `frontend-design`, `acceptance-criteria`, `environment-manifest`, `spec-review` |
| **PLAN** | Plan | human | `codebase-research` (run first), `plan-breakdown`, `codebase-design`, `api-design` |
| **BUILD** | Implement | agent | `incremental-implementation`, `test-driven-development`, `source-driven-development`, `worktree` |
| **VERIFY** | Verify | agent | `quality-verification`, `browser-testing-with-devtools`, `debugging-and-error-recovery` |
| **REVIEW** | Review | agent (parallel fan-out) | `code-review`, `code-simplification`, `security-and-hardening`, `performance-optimization`, `doubt-driven-development` |
| **SHIP** | Ship | agent | `pull-request`, `shipping-and-launch`, `git-workflow`, `ci-cd`, `observability-and-instrumentation`, `deprecation-and-migration`, `documentation-and-adrs` |

**Cross-cutting (no single phase):** `using-agent-skills`, `project-setup`, `orchestrator`,
`preflight-readiness`, `handoff`.

### Implicit-command mapping (for agents without slash commands)

Treat each macro phase as the trigger to invoke the stage's lead skill, instead of waiting for a `/command`:

- DEFINE → `interview-me` / `idea-refine`, then `spec-grilling` (+ `to-prd`, `acceptance-criteria`,
  `environment-manifest`, `frontend-design`, `spec-review`)
- PLAN → `plan-breakdown` (after `codebase-research`)
- BUILD → `incremental-implementation` (applies `test-driven-development`)
- VERIFY → `quality-verification`
- REVIEW → `code-review` (+ `code-simplification`, `security-and-hardening`, `performance-optimization` as a
  fan-out)
- SHIP → `shipping-and-launch` (+ `pull-request`)

For a full autonomous run of BUILD→SHIP across a dependency DAG, invoke `orchestrator`. Bootstrap a repo once
with `project-setup`.

---

## The 9 commands (canonical entry points)

Even if your agent cannot execute slash commands, this table is the source of truth for which skills each
lifecycle stage activates. Agents with custom-command support may register these; others read it as the
intent contract.

| Command | Invokes | Note |
|---|---|---|
| `/ideate` | `interview-me`, then `idea-refine` | front door for a fresh idea → `intent.md` |
| `/spec` | `spec-grilling` (+ `to-prd`, `acceptance-criteria`, `environment-manifest`, `frontend-design`, `spec-review`) | design the product |
| `/plan` | `plan-breakdown` (+ `codebase-research` first) | concrete plan → vertical slices + DAG |
| `/implement` | `incremental-implementation` (applies `test-driven-development`) | one thin slice; default single-slice |
| `/verify` | `quality-verification` | fresh code-cold proof a slice works |
| `/review` | `code-review` (+ `code-simplification`, `security-and-hardening`, `performance-optimization` as fan-out) | quality gate before merge |
| `/ship` | `shipping-and-launch` (+ `pull-request`) | release: checklist · staged rollout · rollback |
| `/orchestrate` | `orchestrator` | the autonomous wave-parallel DAG runner to open PRs |
| `/setup` | `project-setup` | one-time repo ecosystem |

---

## The 5 personas (fresh-context roles)

Personas live in `agents/<role>.md` and preserve **maker ≠ checker**: each is the *role* that applies a skill
(the *method*) with **no prior context**. Dispatch them as subagents where the platform supports it (Claude
Code subagents, Copilot personas, OpenCode skill-tool sessions); otherwise run them as a clean session and
paste only the diff under review.

| Persona | Source skill(s) | Role in one line |
|---|---|---|
| `code-reviewer` | `code-review` | Staff-engineer five-axis review before merge |
| `security-auditor` | `security-and-hardening` | Fresh code-cold OWASP / secrets / dependency audit of a diff |
| `test-engineer` | `test-driven-development` + `quality-verification` | Designs honest tests; proves a slice behaviorally |
| `performance-auditor` | `performance-optimization` | Measure-first profiler; Core Web Vitals; hot paths |
| `adversarial-reviewer` | `doubt-driven-development` | Independent skeptic for confident / high-stakes in-flight decisions |

### Orchestration rule

- **The user (or a command) is the orchestrator. Personas do not invoke other personas.** A persona may invoke
  skills.
- The only endorsed multi-persona pattern is **parallel fan-out + merge**: at REVIEW (`/review`), run
  `code-reviewer`, `security-auditor`, and `performance-auditor` concurrently on the same diff, then
  synthesize their reports. Do not build a "router" persona that decides which other persona to call — that is
  the job of the commands and the intent map above.
- `adversarial-reviewer` (`doubt-driven-development`) runs **in-flight**, not as a merge gate. Reach for it
  when a confident, high-stakes, or irreversible decision needs a second mind before you commit to it.

See `references/orchestration-patterns.md` for the full pattern catalog and anti-patterns.

---

## Anti-rationalization

These thoughts are incorrect and must be ignored:

- "This is too small for a skill." → Check for a skill first, always.
- "I can just quickly implement this." → If a skill applies, use it; do not jump to code.
- "I'll gather context first." → The matching skill *is* how you gather context.
- "I'll write the tests after." → BUILD applies `test-driven-development`; tests are not a follow-up.
- "I'll review my own slice." → maker ≠ checker. Dispatch a fresh persona / clean session.
- "I'm confident, so I'll merge." → Never auto-merge. End at a risk-banded draft PR for the human.
- "The spec is obvious, I'll just start." → DEFINE and PLAN are human-owned. If they're missing, ask.

---

## Install (non-Claude agents)

Per-agent setup guides live in `docs/` (e.g. `docs/opencode-setup.md`, `docs/cursor-setup.md`,
`docs/copilot-setup.md`, `docs/gemini-cli-setup.md`, `docs/windsurf-setup.md`, `docs/antigravity-setup.md`).
The repo slug is `celestialdust/achilles-skills`.

- **OpenCode** — keep `AGENTS.md` (this file) at the repo root and the `skills/` directory present; skills
  route automatically via the `skill` tool. No plugin install needed.
- **Codex / plain-markdown agents** — point the agent at this `AGENTS.md` and the `skills/` directory; read the
  matching `SKILL.md` before acting.
- **Cursor** — copy a `SKILL.md` into `.cursor/rules/`, or reference the whole `skills/` directory.
- **GitHub Copilot** — use `agents/` files as personas and skill content via `.github/copilot-instructions.md`.
- **Gemini CLI** — `gemini skills install https://github.com/celestialdust/achilles-skills.git --path skills`,
  or add to `GEMINI.md` for persistent context.
- **Windsurf** — add skill content to your Windsurf rules configuration.
- **Antigravity** — `agy plugin install https://github.com/celestialdust/achilles-skills.git` for native skills,
  subagents, and commands.
- **Kiro** — place skills under `.kiro/skills/`; Kiro also reads `AGENTS.md`.

Whatever the agent, the contract is the same: **route work to skills, follow the lifecycle, keep maker ≠
checker, and stop at risk-banded draft PRs — never auto-merge.**
