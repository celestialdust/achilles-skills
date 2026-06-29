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

   /setup — one-time repo ecosystem (STATE.md · CONTEXT.md · docs/adr/ · docs/features/)
```

The human owns **Ideate + Spec + Plan** — the decisions only a person can make. The agent then runs **Implement → Verify → Review → Ship** fully autonomously, never halting mid-run, and stops at **open, risk-banded draft PRs** for an async human merge. It never auto-merges to `main`.

---

## Why this exists

Coding agents are fast, and that speed amplifies three failure modes. achilles-skills is built to close each one.

- **Misalignment — "the agent built the wrong thing."** The most common failure isn't bad code; it's confidently-built code that answers the wrong question. achilles forces the disagreement *upward*, into a human-led Ideate → Spec → Plan phase that produces a signed `acceptance.md`, ADRs, and a shared `CONTEXT.md` glossary before a line is written. The agent never gets to guess what you meant.

- **The ball of mud — entropy at machine speed.** Agents accelerate coding, which means they accelerate decay. achilles bakes design discipline into the work itself: deep-module interfaces, contract-first API boundaries, behavior-preserving simplification, and a thin-vertical-slice implementer that ships rollback-friendly increments instead of sprawling rewrites.

- **The silent false-green — "all tests pass" that proves nothing.** A green run is only evidence if the tests test outcomes. achilles separates the *method* (test-driven-development) from an independent, code-cold Verify pass (quality-verification) and a fan-out Review wave (correctness, simplicity, security, performance, plus an adversarial skeptic). The maker never grades their own homework.

The result is an autonomy model you can trust: you make the calls that matter, the agent does the mechanical mileage, and every run ends at a reviewable draft PR — never a surprise merge.

---

## Commands

Nine slash commands, one per lifecycle stage plus the autonomous runner and the one-time setup. Each is a thin wrapper that activates the right skill(s).

| Command | What you're doing | Invokes |
|---|---|---|
| `/ideate` | Front-door a fresh idea → `intent.md` | interview-me, then idea-refine |
| `/spec` | Design the product: ADRs, PRD, acceptance, environment, UI | spec-grilling (+ to-prd, acceptance-criteria, environment-manifest, frontend-design, spec-review) |
| `/plan` | Concrete plan → vertical slices + dependency DAG | plan-breakdown (+ codebase-research first) |
| `/implement` | One thin vertical slice, skeleton-first, test-driven | incremental-implementation (applies test-driven-development) |
| `/verify` | Fresh code-cold proof a slice meets acceptance | quality-verification |
| `/review` | Quality gate before merge (parallel fan-out) | code-review (+ code-simplification, security-and-hardening, performance-optimization) |
| `/ship` | Release: checklist · staged rollout · rollback | shipping-and-launch (+ pull-request) |
| `/orchestrate` | **The autonomous wave-parallel DAG runner** — drives Implement → Ship to open draft PRs | orchestrator |
| `/setup` | One-time repo ecosystem scaffold | project-setup |

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

Uses agent-driven skill execution via `AGENTS.md` and the `skill` tool. See [docs/opencode-setup.md](docs/opencode-setup.md).

</details>

<details>
<summary><b>GitHub Copilot</b></summary>

Use the definitions in `agents/` as Copilot personas and skill content in `.github/copilot-instructions.md`. See [docs/copilot-setup.md](docs/copilot-setup.md).

</details>

<details>
<summary><b>Kiro IDE &amp; CLI</b></summary>

Skills for Kiro live under `.kiro/skills/` and can be stored at Project or Global level. Kiro also reads `AGENTS.md`. Copy the `skills/` directory into `.kiro/skills/` and the personas from `agents/` alongside them. See the Kiro docs at <https://kiro.dev/docs/skills/>.

</details>

<details>
<summary><b>Codex / Other Agents</b></summary>

Skills are plain Markdown — they work with any agent that accepts system prompts or instruction files. Point your agent at `skills/` and `AGENTS.md`. See [docs/codex-setup.md](docs/codex-setup.md).

</details>

---

## All 36 Skills

Every skill is a structured workflow — purpose, when-to-use, process, rationalizations, red flags, and verification gates — not a reference doc. The commands above are entry points; you can also reach for any skill directly.

### Cross-cutting / setup

| Skill | Responsibility |
|---|---|
| [using-agent-skills](./skills/using-agent-skills/SKILL.md) | Meta-dispatcher: maps a task → the right skill + its place in the lifecycle |
| [project-setup](./skills/project-setup/SKILL.md) | One-time repo ecosystem: `STATE.md` · `CONTEXT.md` · `docs/adr/` · `docs/features/` |
| [orchestrator](./skills/orchestrator/SKILL.md) | Default wave-parallel DAG executor; platform-adaptive; autonomous to open PRs |
| [preflight-readiness](./skills/preflight-readiness/SKILL.md) | Environment-readiness gate; blocks the wave until everything is provisioned |
| [handoff](./skills/handoff/SKILL.md) | Per-session compaction into a fresh-agent handoff doc |

### Ideate — human-led

| Skill | Responsibility |
|---|---|
| [interview-me](./skills/interview-me/SKILL.md) | Optional front door: brainstorm + frame a raw idea → `intent.md` |
| [idea-refine](./skills/idea-refine/SKILL.md) | Refine the idea (divergent/convergent + an explicit "Not Doing" list) |

### Spec — human-led

| Skill | Responsibility |
|---|---|
| [spec-grilling](./skills/spec-grilling/SKILL.md) | Design the product from intent → ADRs + `CONTEXT.md` glossary |
| [to-prd](./skills/to-prd/SKILL.md) | Light dual-audience PRD at product altitude; references the ADRs |
| [frontend-design](./skills/frontend-design/SKILL.md) | The one UI skill: explore variants in a clickable browser companion → commit a reference-spec prototype + design contract |
| [acceptance-criteria](./skills/acceptance-criteria/SKILL.md) | BDD prose contract (Given/When/Then), behavioral-only, signed |
| [environment-manifest](./skills/environment-manifest/SKILL.md) | Typed-kind environment manifest (no values, no commands) |
| [spec-review](./skills/spec-review/SKILL.md) | Fresh code-cold agent fixes the spec before the user reviews it |

### Plan — human-led

| Skill | Responsibility |
|---|---|
| [codebase-research](./skills/codebase-research/SKILL.md) | Goal-blind parallel map of the codebase/DB as-is |
| [plan-breakdown](./skills/plan-breakdown/SKILL.md) | THE planner: concrete plan → vertical slices + dependency DAG |
| [codebase-design](./skills/codebase-design/SKILL.md) | Referenced discipline: deep-module interfaces (the deletion test) |
| [api-design](./skills/api-design/SKILL.md) | Referenced discipline: contract-first interface design |

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
| [shipping-and-launch](./skills/shipping-and-launch/SKILL.md) | Release: pre-launch checklist; staged rollout; rollback |
| [git-workflow](./skills/git-workflow/SKILL.md) | Trunk-based; atomic commits; secret hygiene |
| [ci-cd](./skills/ci-cd/SKILL.md) | Shift Left; quality-gate pipeline; feature flags |
| [observability-and-instrumentation](./skills/observability-and-instrumentation/SKILL.md) | Structured logging; RED metrics; OTel tracing |
| [deprecation-and-migration](./skills/deprecation-and-migration/SKILL.md) | Code-as-liability; migration patterns |
| [documentation-and-adrs](./skills/documentation-and-adrs/SKILL.md) | The ADR + doc standard, referenced cross-cutting |

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

Quick-reference checklists in [`references/`](./references/) that skills pull in on demand: [definition-of-done](./references/definition-of-done.md), [testing-patterns](./references/testing-patterns.md), [security-checklist](./references/security-checklist.md), [performance-checklist](./references/performance-checklist.md), [accessibility-checklist](./references/accessibility-checklist.md), [observability-checklist](./references/observability-checklist.md), and [orchestration-patterns](./references/orchestration-patterns.md).

## License

[MIT](./LICENSE) © 2026 Joey — use these skills in your projects, teams, and tools.

## Acknowledgments

achilles-skills stands on the shoulders of the open-source agent-skills community. It is modeled on — and owes
a real debt to — the work of:

- **Matt Pocock — [mattpocock/skills](https://github.com/mattpocock/skills)**
- **Jesse Vincent — [obra/superpowers](https://github.com/obra/superpowers)**
- **Addy Osmani — [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)**
- **[multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)**

And a sincere thank-you to the broader **open-source community** — the authors, maintainers, and contributors
whose tools, patterns, and hard-won lessons make work like this possible.
