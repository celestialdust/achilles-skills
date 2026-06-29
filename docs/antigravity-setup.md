# Using achilles-skills with Antigravity CLI (agy)

The `achilles-skills` suite can be installed as a native plugin in the Antigravity CLI (`agy`), giving the agent access to the full **Ideate → Spec → Plan → Implement → Verify → Review → Ship** lifecycle — 36 structured skills, 5 reusable personas, and 9 lifecycle slash commands.

The human owns Ideate + Spec + Plan; the agent then runs Implement → Verify → Review → Ship autonomously, terminating at risk-banded open draft PRs for async human merge. It never auto-merges to main.

## Setup

### Option 1: Native Plugin Installation (Recommended)

Antigravity CLI has a first-class plugin system that registers skills, agents, and custom commands.

**Install from the remote repository:**

```bash
agy plugin install https://github.com/celestialdust/achilles-skills.git
```

**Install from a local clone:**

1. Clone the repository:
   ```bash
   git clone https://github.com/celestialdust/achilles-skills.git
   ```
2. Install the plugin using `agy`:
   ```bash
   agy plugin install /path/to/achilles-skills
   ```

This will validate the plugin and install it into your global Antigravity configuration directory (`~/.gemini/antigravity-cli/plugins/achilles-skills/`).

### Option 2: Import from Gemini CLI

If you have already installed `achilles-skills` under your legacy Gemini CLI installation, you can import it directly:
```bash
agy plugin import gemini
```

Once installed, verify the active plugin:
```bash
agy plugin list
```

---

## Slash Commands

The plugin registers 9 lifecycle slash commands — one per stage of the **Ideate → Spec → Plan → Implement → Verify → Review → Ship** loop, plus `/orchestrate` (the autonomous wave-parallel runner) and `/setup` (one-time repo bootstrap). Each command activates its lead skill, which in turn pulls in supporting skills as a fan-out.

| Command | What it does | Activated Skill(s) |
|---------|--------------|--------------------|
| `/ideate` | Brainstorm and frame a fresh idea into `intent.md` | `interview-me`, then `idea-refine` |
| `/spec` | Design the product: grill the intent into ADRs, a PRD, and the behavioral + environment contracts | `spec-grilling` (+ `to-prd`, `acceptance-criteria`, `environment-manifest`, `frontend-design`, `spec-review`) |
| `/plan` | Turn the spec into a concrete plan — vertical slices + dependency DAG | `plan-breakdown` (runs `codebase-research` first) |
| `/implement` | Build the next thin vertical slice, skeleton-first | `incremental-implementation` (applies `test-driven-development`) |
| `/verify` | Prove a finished slice meets `acceptance.md`, code-cold | `quality-verification` |
| `/review` | Quality gate before merge: five-axis review with a parallel fan-out | `code-review` (+ `code-simplification`, `security-and-hardening`, `performance-optimization`) |
| `/ship` | Release: pre-launch checklist, staged rollout, rollback | `shipping-and-launch` (+ `pull-request`) |
| `/orchestrate` | Run the whole lifecycle autonomously as a wave-parallel DAG, to open PRs | `orchestrator` |
| `/setup` | One-time repo ecosystem bootstrap: `STATE.md` · `CONTEXT.md` · `docs/adr/` · `docs/features/` | `project-setup` |

Each command automatically invokes the corresponding skill and guides the agent step-by-step.

> **Note:** Antigravity ships an internal plan-generation command also bound to `/plan`. If the built-in shadows the plugin command in your install, invoke the planner by intent instead (ask the agent to "run plan-breakdown") — the underlying `plan-breakdown` skill activates the same way. Do not rename the command; `/plan` is the suite's canonical name.

---

## Skills & Discovery

Antigravity automatically discovers skills inside the plugin's `skills/` directory.
* Antigravity matches user tasks and intents to relevant skills on-demand.
* If a task matches a skill, the agent will load the skill and prompt you for permission before executing.

The suite ships 36 skills, organized by lifecycle stage. Names are descriptive and function-implying (e.g. `performance-optimization`, not `perf`) so the trigger descriptions match developer intent cleanly.

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
| `interview-me` | optional front door: brainstorm + frame an idea → intent.md |
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
| `browser-testing-with-devtools` | the live-runtime engine `quality-verification` drives (Chrome DevTools MCP) |
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

---

## Verification & Validation

To validate that your local plugin is correctly structured and contains all skills, run:
```bash
agy plugin validate /path/to/achilles-skills
```

---

## How It Works

### 1. On-Demand Skill Activation
Antigravity CLI automatically discovers the `SKILL.md` files located in the `skills/` directory of the installed plugin. Using the trigger descriptions in each skill's frontmatter, the agent will dynamically activate the appropriate workflow when it detects matching developer intent.

For example, when you ask the agent to:
- **Design a new system** &rarr; It will suggest/activate `spec-grilling` (and pull in `to-prd`, `acceptance-criteria`, and `frontend-design`).
- **Plan the work** &rarr; It will activate `plan-breakdown` after mapping the codebase with `codebase-research`.
- **Implement a feature** &rarr; It will activate `incremental-implementation` and `test-driven-development`.
- **Fix a bug** &rarr; It will activate `debugging-and-error-recovery`.
- **Run the whole lifecycle autonomously** &rarr; It will activate `orchestrator` to execute the slice DAG wave-by-wave to open PRs.

### 2. Specialized Agent Personas
The plugin registers reusable subagent definitions from the `agents/` directory. Each persona is a thin *role* that dispatches a skill (the *method*) as a fresh, code-cold subagent — preserving maker≠checker so the reviewer never shares the maker's context:
- `code-reviewer.md` — staff-engineer five-axis review before merge (`code-review`)
- `security-auditor.md` — fresh code-cold OWASP / secrets / dependency audit of a diff (`security-and-hardening`)
- `test-engineer.md` — designs honest tests and proves a slice behaviorally (`test-driven-development` + `quality-verification`)
- `performance-auditor.md` — measure-first profiler; Core Web Vitals; hot paths (`performance-optimization`)
- `adversarial-reviewer.md` — independent skeptic for confident / high-stakes in-flight decisions (`doubt-driven-development`)

You can invoke these personas directly within your session or when delegating tasks using subagents.

---

## Configuration & Customization

### Project lifecycle state (`/setup`)
`achilles-skills` carries its lifecycle discipline in the skills themselves; it does not ship a separate enforcement file. To bootstrap a consuming repo, run `/setup` (the `project-setup` skill) once. It seeds `STATE.md` and `CONTEXT.md` into your workspace root and creates `docs/adr/` and `docs/features/` — the shared artifacts the later stages read and append to. If you want Antigravity to hard-enforce a gate such as "no code before a spec," add an `AGENTS.md` to your workspace root describing that rule; Antigravity reads it to align the agent's behavior and planning phase with your team's conventions.

### Sandbox Mode
If you want to run skills or scripts with limited terminal permissions (for safety when running third-party validation tests), launch the CLI with:

```bash
agy --sandbox
```

---

## Usage Tips

1. **Keep plugins up-to-date:** You can update the CLI or check for newer plugin versions using:
   ```bash
   agy update
   ```
2. **Review before execution:** When agents execute complex refactoring tasks using these skills, use `Ctrl+r` to enter the **Artifact Review** screen to review, edit, or approve code before it is committed.
3. **Control permissions:** You can use the `--dangerously-skip-permissions` flag only in trusted local projects where you want to bypass manual tool approval prompts.
4. **Let it run:** For autonomous end-to-end execution, hand the agent a finished plan and run `/orchestrate`. It walks the slice DAG wave-by-wave through Implement → Verify → Review → Ship and stops at risk-banded open draft PRs — it never auto-merges to main.
