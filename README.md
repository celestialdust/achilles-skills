# achilles-skills

**A self-contained skill suite that takes one idea from `Ideate` to a risk-banded draft pull request — the human owns intent, the agent owns execution.**

```
        ╴╴╴╴╴ HUMAN-LED ╴╴╴╴╴╴╴╴╴╴╴╴╴▶│◀╴╴╴╴ AGENT-AUTONOMOUS (ends at a DRAFT PR) ╴╴╴╴╴
   ┌────────┐   ┌──────┐   ┌──────┐   ┌───────────┐   ┌────────┐   ┌────────┐   ┌──────┐
   │ Ideate │──▶│ Spec │──▶│ Plan │──▶│ Implement │──▶│ Verify │──▶│ Review │──▶│ Ship │
   └────────┘   └──────┘   └──────┘   └───────────┘   └────────┘   └────────┘   └──────┘
    /ideate      /spec      /plan      /implement       /verify      /review      /ship
                                  └──────────── /orchestrate ───────────────┘
```

The human owns **Ideate + Spec + Plan** — the decisions only a person can make. The agent then runs
**Implement → Verify → Review → Ship** unattended: it never blocks waiting for input, and where one of
six named conditions fires it ends the slice and reports instead of waiting
([safety-rails](./references/safety-rails.md)). Every run stops at **open, risk-banded draft pull
requests** for an async human merge. It never merges to `main`.

---

## Why this exists

Coding agents are fast, and that speed amplifies three failure modes. This suite is built to close each.

- **Misalignment — "the agent built the wrong thing."** The common failure is not bad code; it is
  confidently-built code answering the wrong question. This forces the disagreement *upward*, into a
  human-led Ideate → Spec → Plan phase that produces a signed `acceptance.md`, the decision records and
  a shared `CONTEXT.md` glossary before a line is written. The agent never gets to guess what you meant.

- **The ball of mud — entropy at machine speed.** Agents accelerate coding, so they accelerate decay.
  Design discipline is baked into the work itself: deep-module interfaces, contract-first boundaries,
  behaviour-preserving simplification, and an implementer that ships thin revertible slices rather than
  sprawling rewrites.

- **The silent false green — "all tests pass" proving nothing.** A green run is evidence only if the
  tests test outcomes. The *method* (`test-driven-development`) is kept separate from an independent,
  code-cold Verify pass (`quality-verification`) and a parallel Review fan-out. The maker never grades
  its own work.

---

## Repository layout

| Path | What it is |
|---|---|
| `skills/` | The 39 skills — one discipline per `SKILL.md` |
| `commands/` | The 12 slash commands — thin entry points over the skills |
| `references/` | What more than one skill reads: the checklists, `safety-rails.md` (the stop list, the dispatch rules, the verdict vocabulary), `state-schema.md`, `principles.md` |
| `docs/setup.md` | Install and run, on every host — one guide, not one per tool |
| `scripts/` | The six checks a change to this repo is measured against — see *How a change here is checked* in [CLAUDE.md](./CLAUDE.md) |
| `.claude-plugin/` | `plugin.json` and `marketplace.json`, the install manifests. `plugin.json` is the only file that states the version, and the only path the plugin loader reads |
| `CLAUDE.md` / `AGENTS.md` | The rules for working in this repository — written once in the first, with the second pointing at it |
| `CONTRIBUTING.md` | What a change to a skill or a command has to satisfy |

The artifacts the suite produces — `STATE.md`, `docs/adr/`, `docs/features/`, `docs/session-state.md`,
`docs/session-log.md`, `docs/lessons.md` — live in **your** project once `/setup` scaffolds them there,
not in this one. `CONTEXT.md` is the exception and is here for the same reason: this repo runs the same
loop, so it carries the glossary that loop produces.

---

## Commands

Twelve slash commands. Nine are lifecycle commands — one per stage, plus the unattended runner and the
one-time setup — and three stand outside the lifecycle and gate nothing.

| Command | What you are doing | Runs |
|---|---|---|
| `/ideate` | Front-door a fresh idea → `intent.md` | interview-me, then idea-refine |
| `/spec` | Survey the code as it is, then design: decision records, PRD, acceptance, environment, structure | codebase-research, then spec-grilling, then spec-review |
| `/plan` | Survey the aspect the decisions point at, then cut vertical slices and the DAG | codebase-research again, then plan-breakdown |
| `/implement` | One thin vertical slice, skeleton first, test first | incremental-implementation |
| `/verify` | A code-cold proof the slice meets its signed scenarios | quality-verification |
| `/review` | The quality gate before a pull request opens, as a parallel fan-out | code-review, code-simplification, security-and-hardening, performance-optimization |
| `/ship` | Open one slice's risk-banded draft pull request; the stage ends there | pull-request |
| `/orchestrate` | **The unattended wave-parallel DAG runner** — Implement through Ship | orchestrator |
| `/setup` | The one-time repo scaffold | project-setup |
| `/explain` | Standalone: a teaching artifact for a diff or a whole repo | literate-explainer |
| `/quiz` | Standalone: retrieval practice, graded before the reveal | comprehension-quiz |
| `/gauntlet-loop` | Standalone: a throwaway proof of concept against a named outside bar | gauntlet-loop |

---

## Quick start

Install as a Claude Code plugin:

```
/plugin marketplace add celestialdust/achilles-skills
/plugin install achilles-skills@achilles-skills
```

Or work against a local clone:

```bash
git clone https://github.com/celestialdust/achilles-skills.git
claude --plugin-dir /path/to/achilles-skills
```

Nothing here is Claude-specific: every skill is one `skills/<name>/SKILL.md` with two frontmatter keys.
On a host with a skill tool the `description` routes and the body loads; on a host without one, the body
is written to be pasted in as the prompt. [docs/setup.md](./docs/setup.md) covers both, the per-host
quirks, and what `/setup` scaffolds in your repository.

---

## All 39 skills

Each skill is a workflow with a verifiable end — purpose, triggers, inputs, method, rationalizations,
red flags, verification, outputs — not a reference document. The commands above are entry points; you
can also reach for any skill by name.

| Skill | Stage | What it does |
|---|---|---|
| [interview-me](./skills/interview-me/SKILL.md) | Ideate | One question at a time until the real intent is pinned; writes `intent.md` |
| [idea-refine](./skills/idea-refine/SKILL.md) | Ideate | Opens an idea into options, converges on one, pins the out-of-scope list |
| [codebase-research](./skills/codebase-research/SKILL.md) | Spec · Plan | Goal-blind parallel survey of the code as it is — one axis file each, compressed into `research.md` |
| [spec-grilling](./skills/spec-grilling/SKILL.md) | Spec | The Spec sitting: grills the design, records the decisions and glossary terms, drafts the bundle |
| [to-prd](./skills/to-prd/SKILL.md) | Spec | `prd.md` at product altitude — problem, solution, user stories, what is out |
| [acceptance-criteria](./skills/acceptance-criteria/SKILL.md) | Spec | Given/When/Then scenarios, an id per behaviour — the oracle the whole run is graded against |
| [environment-manifest](./skills/environment-manifest/SKILL.md) | Spec | Everything a run needs from outside the repo, as typed rows holding identifiers and no values |
| [architecture-design](./skills/architecture-design/SKILL.md) | Spec | `architecture.md` — six sections, every acceptance scenario traced to a path |
| [spec-review](./skills/spec-review/SKILL.md) | Spec | Code-cold last: fixes the draft bundle in place instead of listing complaints |
| [codebase-design](./skills/codebase-design/SKILL.md) | Spec · Plan | A lot of behaviour behind a small interface, at a seam something actually varies across |
| [api-design](./skills/api-design/SKILL.md) | Spec · Plan | The interface contract — typed in and out, one error envelope — before anything builds against it |
| [plan-breakdown](./skills/plan-breakdown/SKILL.md) | Plan | Vertical, demoable slices and the Blocked-by DAG a run schedules from |
| [incremental-implementation](./skills/incremental-implementation/SKILL.md) | Implement | One slice as thin, individually-tested increments — stub, mock, wire, fill |
| [test-driven-development](./skills/test-driven-development/SKILL.md) | Implement | The failing test before the code that passes it, named for the scenario it realizes |
| [source-driven-development](./skills/source-driven-development/SKILL.md) | Implement | Version-sensitive code grounded in docs fetched this run, with the URL cited in the code |
| [worktree](./skills/worktree/SKILL.md) | Implement | The isolated, clean-baseline workspace a slice gets built in |
| [quality-verification](./skills/quality-verification/SKILL.md) | Verify | Grades a finished slice cold against the signed scenarios; writes `qa.md` and a verdict |
| [browser-testing-with-devtools](./skills/browser-testing-with-devtools/SKILL.md) | Verify | Drives the browser MCP when only the running page can settle what renders |
| [code-review](./skills/code-review/SKILL.md) | Review | Five axes — correctness with test quality, readability, architecture, security, performance |
| [code-simplification](./skills/code-simplification/SKILL.md) | Review | Cuts a diff's complexity without moving behaviour; reports, edits nothing |
| [security-and-hardening](./skills/security-and-hardening/SKILL.md) | Review | Trust boundaries, OWASP and the GenAI ten, secrets and dependencies, code-cold |
| [performance-optimization](./skills/performance-optimization/SKILL.md) | Review | Judges a diff's cost on measurements, citing before and after |
| [pull-request](./skills/pull-request/SKILL.md) | Ship | The open draft pull request: Summary · Decided for you · Evidence · Risk band |
| [shipping-and-launch](./skills/shipping-and-launch/SKILL.md) | Ship | The release runbook once a person has merged — clearance, rollout, thresholds, rollback |
| [ci-cd](./skills/ci-cd/SKILL.md) | Ship | The quality-gate pipeline: the commands the repo really runs, wired into CI |
| [deprecation-and-migration](./skills/deprecation-and-migration/SKILL.md) | Ship | Retires a system from real usage data, before anything is deleted; writes `migration.md` |
| [using-agent-skills](./skills/using-agent-skills/SKILL.md) | cross-cutting | The router: a task → the one skill that owns it, and the artifact it opens |
| [project-setup](./skills/project-setup/SKILL.md) | cross-cutting | The one-time repo scaffold every other skill reads cold |
| [orchestrator](./skills/orchestrator/SKILL.md) | cross-cutting | Runs a signed slice DAG unattended, in waves, to open draft pull requests |
| [preflight-readiness](./skills/preflight-readiness/SKILL.md) | cross-cutting | Probes every `environment.md` row, value-blind, before a run goes unattended |
| [handoff](./skills/handoff/SKILL.md) | cross-cutting | Compacts a session into cold-start state, and appends the decisions to the log |
| [debugging-and-error-recovery](./skills/debugging-and-error-recovery/SKILL.md) | cross-cutting | Reproduce, localize, reduce, fix, guard — closing the cause, not the symptom |
| [doubt-driven-development](./skills/doubt-driven-development/SKILL.md) | cross-cutting | Cross-examines one in-flight decision through a fresh code-cold agent |
| [git-workflow](./skills/git-workflow/SKILL.md) | cross-cutting | Atomic commits, branches, secret hygiene; never merges, never commits to `main` |
| [observability-and-instrumentation](./skills/observability-and-instrumentation/SKILL.md) | cross-cutting | Structured logs, RED metrics, spans and symptom alerts — then exercised |
| [documentation-and-adrs](./skills/documentation-and-adrs/SKILL.md) | cross-cutting | The next decision record with what it ruled out, and the docs around it |
| [literate-explainer](./skills/literate-explainer/SKILL.md) | standalone | Turns a diff or an unfamiliar repo into a self-contained teaching artifact |
| [comprehension-quiz](./skills/comprehension-quiz/SKILL.md) | standalone | Retrieval practice, one question per message, graded before the answer is revealed |
| [gauntlet-loop](./skills/gauntlet-loop/SKILL.md) | standalone | Grinds a throwaway prototype until a blind critic picks it over a named outside bar |

---

## References

Shared material in [`references/`](./references/) that skills pull in on demand: the checklists
(security, performance, accessibility, observability, definition-of-done), the ten principles every
skill's Purpose line indexes, the state schema, the safety rails, and the unknowns pass in
[`finding-unknowns.md`](./references/finding-unknowns.md) that the discovery skills work from. A skill
names the file it needs by relative link; nothing here is loaded until something asks for it.

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
