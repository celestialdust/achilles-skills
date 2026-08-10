# achilles-skills

**A self-contained skill suite that takes one idea from `Ideate` to a risk-banded draft PR — the human owns intent, the agent owns execution.**

```
        ╴╴╴╴╴ HUMAN-LED ╴╴╴╴╴╴╴╴╴╴╴╴╴▶│◀╴╴╴╴╴ AGENT-AUTONOMOUS (terminates at a DRAFT PR) ╴╴╴╴╴
   ┌────────┐   ┌──────┐   ┌──────┐   ┌───────────┐   ┌────────┐   ┌────────┐   ┌──────┐
   │ Ideate │──▶│ Spec │──▶│ Plan │──▶│ Implement │──▶│ Verify │──▶│ Review │──▶│ Ship │
   └────────┘   └──────┘   └──────┘   └───────────┘   └────────┘   └────────┘   └──────┘
    /ideate      /spec      /plan      /implement       /verify      /review      /ship
                                  └──────────── /orchestrate ───────────────┘
                            (one autonomous wave-parallel DAG run → open draft PRs)

   /setup — one-time repo ecosystem (STATE.md · CONTEXT.md · docs/adr/ · docs/features/ ·
            docs/test-contract.md · docs/workflow.md · docs/session-state.md · docs/progress.md · docs/lessons.md · the
            "## Agent skills" block in one of CLAUDE.md / AGENTS.md + a pointer in the other)
```

The human owns **Ideate + Spec + Plan** — the decisions only a person can make. The agent then runs **Implement → Verify → Review → Ship** fully autonomously — it never blocks waiting for input, and where a stop condition fires it terminates and reports instead of waiting ([docs/workflow.md](./docs/workflow.md) lists them) — and stops at **open, risk-banded draft PRs** for an async human merge. It never auto-merges to `main`.

---

## Why this exists

Coding agents are fast, and that speed amplifies three failure modes. achilles-skills is built to close each one.

- **Misalignment — "the agent built the wrong thing."** The most common failure isn't bad code; it's confidently-built code that answers the wrong question. achilles forces the disagreement *upward*, into a human-led Ideate → Spec → Plan phase that produces a signed `acceptance.md`, ADRs, and a shared `CONTEXT.md` glossary before a line is written. The agent never gets to guess what you meant.

- **The ball of mud — entropy at machine speed.** Agents accelerate coding, which means they accelerate decay. achilles bakes design discipline into the work itself: deep-module interfaces, contract-first API boundaries, behavior-preserving simplification, and a thin-vertical-slice implementer that ships rollback-friendly increments instead of sprawling rewrites.

- **The silent false-green — "all tests pass" that proves nothing.** A green run is only evidence if the tests test outcomes. achilles separates the *method* (test-driven-development) from an independent, code-cold Verify pass (quality-verification) and a fan-out Review wave (correctness, simplicity, security, performance, plus an adversarial skeptic). The maker never grades their own homework.

The result is an autonomy model you can trust: you make the calls that matter, the agent does the mechanical mileage, and every run ends at a reviewable draft PR — never a surprise merge.

### Finding your unknowns

Misalignment starts before the first question is asked: a prompt only contains what's already on your map. The discovery-stage skills (`interview-me`, `idea-refine`, `spec-grilling`) work all four quadrants of the **unknowns matrix** — what you stated (known knowns), what you know you haven't resolved (known unknowns), what you'd only recognize on sight (unknown knowns), and what you haven't considered at all (unknown unknowns):

- **Blind-spot pass** (`interview-me`, `spec-grilling`) — scan the territory *before* the first question and brief you on decisions your ask never mentions.
- **Reactable options** (`idea-refine`) — wildly different throwaway mock-ups to react to when the answer is "I'd know it when I see it."
- **Leverage-ordered questions** — architecture-changing questions first; uncontested defaults stated inline, not asked.
- **Sign-off quiz** — before you sign `intent.md` or the ADRs, 2–3 scenario questions prove the artifact matches your mental model.

The shared playbook is [`references/finding-unknowns.md`](./references/finding-unknowns.md). Discovery effort follows ignorance: novel territory gets the full treatment, familiar ground gets compressed.

---

## Repository layout

| Path | What it is |
|---|---|
| `skills/` | The 40 skills — one discipline per `SKILL.md` |
| `agents/` | The 5 fresh-context personas |
| `commands/` | The 12 slash commands — thin wrappers over the skills |
| `references/` | Shared reference material: checklists (security, performance, accessibility, …) and `language-style.md`, the prose style guide for everything this repo ships |
| `docs/` | Reader-facing documentation: getting started + per-agent setup guides, plus `workflow.md` and `test-contract.md` — this repo's own copies of the process contract and the test contract. `CONTEXT.md` at the root is the same idea: the suite runs its own process, so it carries the artifacts that process produces |
| `scripts/` | The six checks a change to this repo is measured against — see *How a change here is checked* below |
| `.claude-plugin/` | `plugin.json` and `marketplace.json`, the install manifests. `plugin.json` is the only file that states the version, and the only path the plugin loader reads |
| `CONTRIBUTING.md` | What a change to a skill, command, or persona has to satisfy — the `SKILL.md` envelope, the artifact-chain contract, and the list to run before opening a PR |

`docs/` is for readers of this repo. The pipeline artifacts the suite produces (`STATE.md`, `docs/adr/`, `docs/features/`, `docs/session-state.md`, `docs/progress.md`, `docs/lessons.md`) live in **your** project once `/setup` scaffolds them there — not in this one. Three are exceptions, and they are here for the same reason: this repo runs the same loop, so it carries them. `/setup` scaffolds a copy of `docs/workflow.md`, `docs/test-contract.md`, and `CONTEXT.md` into your project; this repo keeps its own of each.

`docs/design.md` — the decided look — and `ARCHITECTURE.md` — the structure map — are in neither list. Nothing scaffolds either: the first user interface built in a repo writes the one, and the first feature to run `architecture-design` writes the other. This repo builds no interface and has run no such pass, so it has neither. Their absence is a look and a layering nobody has decided yet, which is the correct state here rather than a gap.

`docs/workflow.md` is the process contract, and it decides two things nothing else can. **Source-of-truth order** ranks the documents, so when two of them disagree a reader knows which one governs instead of picking. **Who writes what** is a write table keyed by zone, and it is **deny-by-default**: a write with no row permitting it is a write nobody may make. Between them they are why a skill can be read on its own without also reading the nine files around it.

---

## How a change here is checked

Most of this repo is prose, and CI reaches almost none of it — `.github/workflows/companion-tests.yml` is path-filtered to the vendored companion engine under `skills/frontend-design/scripts/`. For everything else the checker is a person running these:

```
node scripts/check-envelope.mjs        # two frontmatter keys, eight body slots in order
node scripts/check-enumerations.mjs    # every stated total, recomputed and diffed against the tree
node scripts/check-registries.mjs      # membership both ways, judged against each registry's own column
node scripts/check-references.mjs      # every link, anchor and shipped path resolves
node scripts/check-stages.mjs          # the stage a registry files a skill under, against the stage the skill claims
node scripts/check-write-table.mjs     # every write a skill declares, against the zone the table grants it
```

The first five are silent when they pass. `check-write-table.mjs` exits non-zero by design — it reports a standing backlog, so compare its output before and after your change rather than reading a clean run as the goal. **Never edit the table to make it green**: widening a row is the gate erosion the table exists to catch, and so is quietly rewording the skill so it stops declaring the write.

Each check states in its own header what it cannot reach, and that half is the one to read. No walk can see a `SKILL.md`'s Process slot, a total worded outside the recognised frames, or anything under `docs/`. Those are yours to read. [CONTRIBUTING.md](./CONTRIBUTING.md) carries the full pre-PR list.

---

## Commands

Twelve slash commands: nine lifecycle commands — one per stage, plus the autonomous runner and the one-time setup — and three standalone commands outside the lifecycle. Each is a thin wrapper that activates the right skill(s).

| Command | What you're doing | Invokes |
|---|---|---|
| `/ideate` | Front-door a fresh idea → `intent.md` | interview-me, then idea-refine |
| `/spec` | Survey the code as-is, then design the product: ADRs, PRD, UI, acceptance, environment, structure | codebase-research first, then spec-grilling (+ to-prd, frontend-design, acceptance-criteria, environment-manifest, architecture-design, spec-review) |
| `/plan` | Concrete plan → vertical slices + dependency DAG | plan-breakdown (reuses Spec's research.md) |
| `/implement` | One thin vertical slice, skeleton-first, test-driven | incremental-implementation (applies test-driven-development) |
| `/verify` | Fresh code-cold proof a slice meets acceptance | quality-verification |
| `/review` | Quality gate before merge (parallel fan-out) | code-review (+ code-simplification, security-and-hardening, performance-optimization) |
| `/ship` | Open one slice's risk-banded draft PR; the stage ends there | pull-request as the spine (shipping-and-launch follows once the human has merged) |
| `/orchestrate` | **The autonomous wave-parallel DAG runner** — drives Implement → Ship to open draft PRs | orchestrator |
| `/setup` | One-time repo ecosystem scaffold | project-setup |
| `/explain` | Standalone, no stage: teaching artifact for a diff or a whole repo | literate-explainer |
| `/quiz` | Standalone, no stage: retrieval practice, graded before reveal → learning ledger | comprehension-quiz |
| `/gauntlet-loop` | Standalone, no stage: a throwaway proof of concept against a named outside bar, in the `.gauntlet/` scratch — offered, never auto-selected | gauntlet-loop |

---

## Quick Start

<details>
<summary><b>Claude Code (recommended)</b></summary>

**Marketplace install:**

```
/plugin marketplace add celestialdust/achilles-skills
/plugin install achilles-skills@achilles-skills
```

**Local / development:**

```bash
git clone https://github.com/celestialdust/achilles-skills.git
claude --plugin-dir /path/to/achilles-skills
```

</details>

<details>
<summary><b>Cursor</b></summary>

Copy any `SKILL.md` into `.cursor/rules/`, or reference the full `skills/` directory. See [docs/cursor-setup.md](docs/cursor-setup.md).

</details>

<details>
<summary><b>Antigravity CLI</b></summary>

Install as a native plugin for skills, subagents, and slash commands. See [docs/antigravity-setup.md](docs/antigravity-setup.md).

**Install from the repo:**

```bash
agy plugin install https://github.com/celestialdust/achilles-skills.git
```

**Install from a local clone:**

```bash
git clone https://github.com/celestialdust/achilles-skills.git
agy plugin install ./achilles-skills
```

</details>

<details>
<summary><b>Gemini CLI</b></summary>

Install as native skills for auto-discovery, or add to `GEMINI.md` for persistent context. See [docs/gemini-cli-setup.md](docs/gemini-cli-setup.md).

**Install from the repo:**

```bash
gemini skills install https://github.com/celestialdust/achilles-skills.git --path skills
```

**Install from a local clone:**

```bash
gemini skills install ./achilles-skills/skills/
```

</details>

<details>
<summary><b>Windsurf</b></summary>

Add skill contents to your Windsurf rules configuration. See [docs/windsurf-setup.md](docs/windsurf-setup.md).

</details>

<details>
<summary><b>OpenCode</b></summary>

Uses agent-driven skill execution via the `skill` tool, against the rules in `CLAUDE.md`. See [docs/opencode-setup.md](docs/opencode-setup.md).

</details>

<details>
<summary><b>GitHub Copilot</b></summary>

Use the definitions in `agents/` as Copilot personas and skill content in `.github/copilot-instructions.md`. See [docs/copilot-setup.md](docs/copilot-setup.md).

</details>

<details>
<summary><b>Kiro IDE &amp; CLI</b></summary>

Skills for Kiro live under `.kiro/skills/` and can be stored at Project or Global level. Kiro also reads `AGENTS.md`, which sends it to `CLAUDE.md`, where the rules are. Copy the `skills/` directory into `.kiro/skills/` and the personas from `agents/` alongside them. See the Kiro docs at <https://kiro.dev/docs/skills/>.

</details>

<details>
<summary><b>Codex / Other Agents</b></summary>

Skills are plain Markdown — they work with any agent that accepts system prompts or instruction files. Point your agent at `skills/` and `CLAUDE.md`, which holds the rules whatever the tool; an agent that reads `AGENTS.md` instead finds a pointer to the same file. There is no separate setup file for these agents, because there is no separate mechanism: see [docs/getting-started.md](docs/getting-started.md).

</details>

---

## All 40 Skills

Every skill is a structured workflow — purpose, when-to-use, process, rationalizations, red flags, and verification gates — not a reference doc. The commands above are entry points; you can also reach for any skill directly.

### Cross-cutting / setup

| Skill | Responsibility |
|---|---|
| [using-agent-skills](./skills/using-agent-skills/SKILL.md) | Meta-dispatcher: maps a task → the right skill + its place in the lifecycle |
| [project-setup](./skills/project-setup/SKILL.md) | One-time repo ecosystem: `STATE.md` · `CONTEXT.md` · `docs/adr/` · `docs/features/` · `docs/test-contract.md` · `docs/workflow.md` · `docs/session-state.md` · `docs/progress.md` · `docs/lessons.md` · the `## Agent skills` block in one of `CLAUDE.md` / `AGENTS.md` + a short pointer to it in the other |
| [orchestrator](./skills/orchestrator/SKILL.md) | Default wave-parallel DAG executor; platform-adaptive; autonomous to open PRs |
| [preflight-readiness](./skills/preflight-readiness/SKILL.md) | Environment-readiness gate; blocks the wave until everything is provisioned |
| [handoff](./skills/handoff/SKILL.md) | Per-session compaction into a fresh-agent handoff doc |

### Ideate — human-led

| Skill | Responsibility |
|---|---|
| [interview-me](./skills/interview-me/SKILL.md) | Optional front door: blind-spot scan + one-question-at-a-time interview → quizzed, signed `intent.md` |
| [idea-refine](./skills/idea-refine/SKILL.md) | Refine the idea (divergent/convergent, reactable throwaway variants, an explicit "Not Doing" list) |

### Spec — human-led

| Skill | Responsibility |
|---|---|
| [codebase-research](./skills/codebase-research/SKILL.md) | Head of Spec: goal-blind parallel map of the codebase/DB as-is → `research.md`, before any design decision |
| [spec-grilling](./skills/spec-grilling/SKILL.md) | Design the product from intent + the survey → ADRs + `CONTEXT.md` glossary; refuses without `research.md`; a blind-spot pass surfaces decisions you haven't considered |
| [to-prd](./skills/to-prd/SKILL.md) | Light dual-audience PRD at product altitude; references the ADRs |
| [frontend-design](./skills/frontend-design/SKILL.md) | Spec, after `to-prd` and before `acceptance-criteria` and `environment-manifest` run. The one UI skill: explore variants in a clickable browser companion → commit a reference-spec prototype + design contract; the repo's first UI surface also writes `docs/design.md` |
| [acceptance-criteria](./skills/acceptance-criteria/SKILL.md) | BDD prose contract (Given/When/Then), behavioral-only, signed |
| [environment-manifest](./skills/environment-manifest/SKILL.md) | Typed-kind environment manifest (no values, no commands) |
| [architecture-design](./skills/architecture-design/SKILL.md) | Reconciles and renders — traces every scenario, records the invariants, cites the decisions taken in `spec-grilling`; takes none itself. Writes one feature's `architecture.md` + the committed `architecture.html` read at the Spec gate, and `ARCHITECTURE.md` on the repo's first such pass |
| [spec-review](./skills/spec-review/SKILL.md) | Fresh code-cold agent fixes the spec before the user reviews it |

### Plan — human-led

| Skill | Responsibility |
|---|---|
| [plan-breakdown](./skills/plan-breakdown/SKILL.md) | THE planner: concrete plan → vertical slices + dependency DAG; reads Spec's `research.md` (re-survey only against a named gap) |

### Spec · Plan — referenced disciplines, not a stage

| Skill | Responsibility |
|---|---|
| [codebase-design](./skills/codebase-design/SKILL.md) | Deep-module interfaces (the deletion test). Proposes a structural variant in Spec, pins the interface into `plan.md` in Plan; owns no artifact of its own |
| [api-design](./skills/api-design/SKILL.md) | Contract-first interface design. Proposes a structural variant in Spec, pins the interface into `plan.md` in Plan; owns no artifact of its own |

### Implement — agent

| Skill | Responsibility |
|---|---|
| [incremental-implementation](./skills/incremental-implementation/SKILL.md) | THE implementer: one thin vertical slice; skeleton-first |
| [test-driven-development](./skills/test-driven-development/SKILL.md) | Rigid RED-GREEN-REFACTOR core loop; realizes acceptance scenarios |
| [source-driven-development](./skills/source-driven-development/SKILL.md) | Ground framework decisions in fetched official docs |
| [worktree](./skills/worktree/SKILL.md) | Per-slice isolation mechanism (orchestrator-owned) |

### Verify — agent

| Skill | Responsibility |
|---|---|
| [quality-verification](./skills/quality-verification/SKILL.md) | Fresh code-cold agent: behavioral acceptance tests + design gate |
| [browser-testing-with-devtools](./skills/browser-testing-with-devtools/SKILL.md) | The live-runtime engine quality-verification drives (Chrome DevTools MCP) |
| [debugging-and-error-recovery](./skills/debugging-and-error-recovery/SKILL.md) | Five-step triage; stop-the-line; safe fallbacks |

### Review — agent (parallel fan-out)

| Skill | Responsibility |
|---|---|
| [code-review](./skills/code-review/SKILL.md) | Five-axis review including test quality; severity labels |
| [code-simplification](./skills/code-simplification/SKILL.md) | Behavior-preserving reduction; Chesterton's Fence |
| [security-and-hardening](./skills/security-and-hardening/SKILL.md) | OWASP Top 10; secrets; dependency audit |
| [performance-optimization](./skills/performance-optimization/SKILL.md) | Measure-first; Core Web Vitals; profiling |
| [doubt-driven-development](./skills/doubt-driven-development/SKILL.md) | In-flight adversarial review (not a merge gate) |

### Ship — agent

| Skill | Responsibility |
|---|---|
| [pull-request](./skills/pull-request/SKILL.md) | Per-slice design-anchored draft PR; read-the-code checklist; risk band |
| [shipping-and-launch](./skills/shipping-and-launch/SKILL.md) | Release-level, on the far side of the human's merge: pre-launch checklist; staged rollout; rollback |
| [git-workflow](./skills/git-workflow/SKILL.md) | Trunk-based; atomic commits; secret hygiene |
| [ci-cd](./skills/ci-cd/SKILL.md) | Shift Left; quality-gate pipeline; feature flags |
| [observability-and-instrumentation](./skills/observability-and-instrumentation/SKILL.md) | Structured logging; RED metrics; OTel tracing |
| [deprecation-and-migration](./skills/deprecation-and-migration/SKILL.md) | Code-as-liability; migration patterns |
| [documentation-and-adrs](./skills/documentation-and-adrs/SKILL.md) | The ADR + doc standard, referenced cross-cutting |

### Comprehension — human-led, standalone

Understand code you didn't write. A standalone loop — diff → explainer → quiz → record — that runs outside the lifecycle and never gates a merge, a stage, or an `/orchestrate` wave.

| Skill | Responsibility |
|---|---|
| [literate-explainer](./skills/literate-explainer/SKILL.md) | Turn a diff or a whole unfamiliar repo into a self-contained teaching artifact — background → intuition → literate tour, Feynman-plain |
| [comprehension-quiz](./skills/comprehension-quiz/SKILL.md) | Agent-administered retrieval practice — ~5 questions one at a time, graded before the answer, recorded in the learning ledger |

### Throwaway — human-led, standalone

The fast path for work that gets deleted. It runs outside the lifecycle and gates nothing, and the dispatcher never selects it: it names this path and the full loop side by side and stops until the human picks.

| Skill | Responsibility |
|---|---|
| [gauntlet-loop](./skills/gauntlet-loop/SKILL.md) | Beat a named outside bar — a builder against a separate blind critic, per piece, until the critic picks ours; everything lands in the `.gauntlet/` scratch the repository ignores |

---

## Personas

Five specialist agents apply a Review/Verify skill with a **fresh, code-cold context** — preserving maker ≠ checker. A persona is the *role*; the skill it points to is the *method*.

| Persona | Source skill(s) | Role |
|---|---|---|
| [code-reviewer](./agents/code-reviewer.md) | code-review | Staff-engineer five-axis review before merge |
| [security-auditor](./agents/security-auditor.md) | security-and-hardening | Fresh code-cold OWASP / secrets / dependency audit of a diff |
| [test-engineer](./agents/test-engineer.md) | test-driven-development + quality-verification | Designs honest tests; proves a slice behaviorally |
| [performance-auditor](./agents/performance-auditor.md) | performance-optimization | Measure-first profiler; Core Web Vitals; hot paths |
| [adversarial-reviewer](./agents/adversarial-reviewer.md) | doubt-driven-development | Independent skeptic for confident / high-stakes in-flight decisions |

---

## References

Shared material in [`references/`](./references/) that skills pull in on demand: the checklists (security, performance, accessibility, observability, definition-of-done), the unknowns pass, and the artifact shapes the design, teaching, and comprehension skills read. [docs/getting-started.md](./docs/getting-started.md) maps each file to the skills that use it — one list, so a new reference cannot go missing from a second one.

## License

[MIT](./LICENSE) © 2026 Joey — use these skills in your projects, teams, and tools.

## Acknowledgments

achilles-skills stands on the shoulders of the open-source agent-skills community. It is modeled on — and owes
a real debt to — the work of:

- **Matt Pocock — [mattpocock/skills](https://github.com/mattpocock/skills)**
- **Jesse Vincent — [obra/superpowers](https://github.com/obra/superpowers)**
- **Addy Osmani — [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)**
- **[multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)**
- **Matt Shumer & Jay E — [robonuggets/gauntlet-loop](https://github.com/robonuggets/gauntlet-loop)** (CC BY 4.0)

And a sincere thank-you to the broader **open-source community** — the authors, maintainers, and contributors
whose tools, patterns, and hard-won lessons make work like this possible.
