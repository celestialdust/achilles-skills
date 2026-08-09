# achilles-skills — repository guidance

The rules for working in this repository. They hold for every coding agent, whatever tool you run —
the filename is the one Claude Code reads, and nothing below is specific to it. `achilles-skills` is
a self-contained skill suite that automates the development loop
**Ideate → Spec → Plan → Implement → Verify → Review → Ship**.

## Start here: the meta-dispatcher

Before writing any plan, spec, or code — and at the start of every session — invoke the
[using-agent-skills](./skills/using-agent-skills/SKILL.md) skill. It is the meta-dispatcher: it maps the
task to the right stage skill and keeps the artifact chain
(`intent.md → research.md → prd.md → plan.md → … → qa.md`) intact. Acting without consulting it is how
the wrong skill runs and a stage gets skipped.

## Project Structure

```
skills/          → 39 skills, one discipline each (skills/<name>/SKILL.md)
agents/          → 5 review personas (code-cold subagents)
commands/        → 12 slash commands (*.md) — 9 lifecycle + 3 standalone
references/      → shared reference material: checklists (security, performance, accessibility, …) and
                   language-style.md, the prose style guide for everything this repo ships
docs/            → per-agent setup guides + workflow.md and test-contract.md (this repo's own copies)
.claude-plugin/  → plugin.json + marketplace.json (install manifests)
```

There is exactly **one** plugin manifest: `.claude-plugin/plugin.json`. It is the only file that states
the version, and the only path the plugin loader reads. Never add a second manifest at the repo root —
two files that both claim to be the manifest drift apart silently, because nothing forces them to agree.

`AGENTS.md` at the repo root is a pointer to this file and holds no rules of its own. It is short on
purpose: an agent whose tool reads that filename is sent here, so the rules stay written once. Never
answer a change to a rule by editing `AGENTS.md`.

## Where things are

The durable files this suite reads and writes, so a cold agent does not have to guess where something
lives.

| File | Holds | Written by |
|---|---|---|
| `STATE.md` | the work board — one block per feature, one row per slice, and a `gate` column naming who owns the next action | `plan-breakdown` adds the rows; the orchestrator drives them |
| `CONTEXT.md` | the glossary — one plain-language definition per domain term, no implementation detail | `project-setup` seeds it; `spec-grilling` appends terms |
| `docs/workflow.md` | how work ships: the stages, who owns each gate, where a run ends, what stops one | `project-setup`, copied verbatim; never hand-edited |
| `docs/test-contract.md` | scenarios the repo must never lose, each `PENDING` or `ACTIVE` | a person; agents read it and never edit it |
| `docs/session-state.md` | where the work stands (five fields, rewritten each time) plus an append-only log of decisions | `handoff` |
| `docs/design.md` | the repository's decided look — what every interface shares, as against what one screen decides for itself | the **first** UI surface built in the repo, via `frontend-design`; nothing scaffolds it |
| `docs/adr/` | one file per architectural decision, with the reasoning and what was ruled out | `spec-grilling`, `documentation-and-adrs` |
| `docs/features/<slug>/` | one feature's `intent.md`, `research.md`, `prd.md`, `acceptance.md`, `environment.md`, `plan.md`, `qa.md` | the stage that produces each one |
| `references/language-style.md` | how this suite writes | a person; it ships with the plugin and is never scaffolded into a consumer's repo |
| `CONTRIBUTING.md` | what a change to a skill, command, or persona must satisfy — naming, the `SKILL.md` envelope, structure rules, the artifact-chain contract, and the pre-PR list | a person; contributor-facing, never scaffolded into a consumer's repo |

This repository is the suite, not a repo the suite runs in, so several of these rows have no file here.
[README.md](./README.md) under Repository layout says which ones this repo keeps and why.

**Never run `project-setup` against this repository.** `using-agent-skills` routes to it whenever
`STATE.md` is absent, which is right in every repo the suite is installed into — and wrong here. This
repo has no `STATE.md` and must not get one: the suite is not a feature it runs on, so a scaffolded
board would have nothing to track. Finding no `STATE.md` here is the expected state, not a missing one;
route the task to its own stage skill instead.

## The 12 commands → which skill they run

Slash commands are thin entry points. The first nine each map one lifecycle stage to its skill(s); the
last three are standalone and belong to no stage.

| Command | Runs | Owner |
|---|---|---|
| `/ideate` | interview-me, then idea-refine | human |
| `/spec` | codebase-research first, then spec-grilling (+ to-prd, acceptance-criteria, environment-manifest, frontend-design, spec-review) | human |
| `/plan` | plan-breakdown — reuses /spec's research.md; re-surveys only against a named gap | human |
| `/implement` | incremental-implementation (applies test-driven-development) | agent |
| `/verify` | quality-verification | agent |
| `/review` | code-review (+ code-simplification, security-and-hardening, performance-optimization fan-out) | agent |
| `/ship` | pull-request — the spine of the stage; shipping-and-launch is release-level and follows once the human has merged | agent |
| `/orchestrate` | orchestrator — the autonomous wave-parallel DAG runner | agent |
| `/setup` | project-setup — one-time repo ecosystem | agent |
| `/explain` | literate-explainer — **standalone**, not a lifecycle stage | human |
| `/quiz` | comprehension-quiz — **standalone**, not a lifecycle stage | human |
| `/gauntlet-loop` | gauntlet-loop — **standalone**, not a lifecycle stage; offered, never auto-selected | human |

The **human owns Ideate + Spec + Plan**; the agent runs **Implement → Ship autonomously**. `/explain`,
`/quiz`, and `/gauntlet-loop` sit outside that loop entirely — run any of them at any time without
advancing a stage.

## The 5 personas (agents/)

Personas are *roles* dispatched as fresh, code-cold subagents; the skill they point at is the *method*.
They exist to preserve **maker≠checker** — the reviewer never shares the maker's context.

| Persona | Method skill | Role |
|---|---|---|
| [code-reviewer](./agents/code-reviewer.md) | code-review | five-axis review before merge |
| [security-auditor](./agents/security-auditor.md) | security-and-hardening | OWASP / secrets / dependency audit of a diff |
| [test-engineer](./agents/test-engineer.md) | test-driven-development + quality-verification | designs honest tests; proves a slice behaviorally |
| [performance-auditor](./agents/performance-auditor.md) | performance-optimization | measure-first profiler; Core Web Vitals; hot paths |
| [adversarial-reviewer](./agents/adversarial-reviewer.md) | doubt-driven-development | independent skeptic for confident / high-stakes in-flight calls |

Composition rule: **a slash command (or the user) is the orchestrator; personas do not invoke other
personas.** A persona may invoke skills.

`/review` is **not** a multi-persona pattern. It dispatches each review *skill* — `code-review`,
`code-simplification`, `security-and-hardening`, `performance-optimization`, plus any specialist the
diff's facts add — as its own fresh-context, code-cold subagent, in parallel, over the union of the diffs
under review. Those four are a floor, not a list: a fact about the diff can add a reviewer, and nothing
removes one. The skill is the method; there is no role to play on top of it. Findings are attributed to
their owning slice **by file**, then merged into one ranked list. Reach for a persona when a human wants a single code-cold pass outside a run, or on
a platform with no skill tool — not to build the `/review` fan-out.

## Safety & autonomy rules (must-follow)

- **Risk-banded draft PRs only.** Autonomous runs terminate at an **open draft PR** with a risk band and
  never block waiting for input. Named conditions do stop a run early, but a stopped run terminates and
  reports rather than waiting — [docs/workflow.md](./docs/workflow.md) lists them.
- **Never auto-merge to main.** A human merges. The agent opens the PR; the human decides.
- **maker≠checker.** Verify and Review run as fresh, code-cold subagents that do not share the
  implementer's context — each one dispatched as the skill itself, not as a role played on top of it.
  The maker never grades its own work.
- **TDD order.** Write the failing test before implementation (`test-driven-development`, applied by
  `incremental-implementation`). One thin vertical slice at a time, skeleton-first.

## Conventions

- Every skill lives at `skills/<kebab-case-name>/SKILL.md` with `name` + `description` frontmatter.
- Description leads with what the skill does (third person), then trigger conditions ("Use when …").
- Reference other skills rather than duplicating their content.
- The `SKILL.md` envelope — the two frontmatter keys and the body sections in order — is stated once, in
  [CONTRIBUTING.md](./CONTRIBUTING.md). Read it there before you add or reshape a skill, and do not copy
  it back here: the second copy is the one that drifts.
- Use the **new** skill names everywhere (e.g. `performance-optimization`, not `perf`; `quality-verification`,
  not `qa`). Artifact filenames (`qa.md`, `acceptance.md`, `environment.md`, …) and the `git` VCS tool keep
  their names — they are not skill pointers.
- Write prose to [references/language-style.md](./references/language-style.md). It states its own scope.

## How a change here is checked

Most of this repo is prose — skills, commands, personas, docs — and no job checks prose. The one
exception is the vendored companion engine under `skills/frontend-design/scripts/`: that is Node and
Bash code with tests, and `.github/workflows/companion-tests.yml` runs them on Linux and macOS. The
workflow is path-filtered to that directory, so a change anywhere else in the repo lands with no CI at
all. Run the same four steps yourself, from `skills/frontend-design/scripts/`:

```
npm ci
npm test                          # node --test tests/*.test.js
bash tests/start-server.test.sh
bash tests/stop-server.test.sh
```

There is no root `package.json`, `Makefile`, or `pyproject.toml`, and nothing checks the repo as a
whole. For a prose change the checker is you: the pre-PR list in
[CONTRIBUTING.md](./CONTRIBUTING.md), read against
[references/language-style.md](./references/language-style.md).

## Boundaries

- Always: invoke `using-agent-skills` first to pick the stage skill; follow the matched skill exactly.
- Always: run Verify and Review as code-cold subagents before opening a PR.
- Never: auto-merge, push to main, or skip the failing-test-first order.
- Never: add a skill that is vague advice instead of an actionable process, or duplicate another skill.
