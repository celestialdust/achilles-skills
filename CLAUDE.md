# achilles-skills — repository guidance

The rules for working in this repository. They hold for every coding agent, whatever tool you run — the
filename is the one Claude Code reads, and nothing below is specific to it. `achilles-skills` is a
self-contained skill suite automating one development loop:
**Ideate → Spec → Plan → Implement → Verify → Review → Ship**.

## Start here: the router

Before writing any plan, spec, or code — and at the start of every session — invoke the
[using-agent-skills](./skills/using-agent-skills/SKILL.md) skill. It is the dispatcher: it maps the task
to the stage skill that owns it and keeps the artifact chain
(`intent.md → research.md → prd.md → plan.md → … → qa.md`) intact. Acting without consulting it is how
the wrong skill runs and a stage gets skipped.

**Never run `project-setup` against this repository.** The router routes to it whenever `STATE.md` is
absent, which is right in every repository the suite is installed into — and wrong here. This repo has
no `STATE.md` and must not get one: the suite is not a feature it runs on, so a scaffolded board would
track nothing. Finding none here is expected, not a gap; route the task to its own stage skill instead.

## Project structure

```
skills/          → 39 skills, one discipline each (skills/<name>/SKILL.md)
commands/        → 12 slash commands (*.md) — 9 lifecycle + 3 standalone
references/      → what more than one skill reads: the checklists, safety-rails.md (the stop list, the
                   dispatch rules, the verdict vocabulary), state-schema.md, principles.md
docs/setup.md    → the one install-and-run guide, for every host
scripts/         → the six checks CI runs over the whole tree — see *How a change here is checked*
.claude-plugin/  → plugin.json + marketplace.json (install manifests)
```

There is exactly **one** plugin manifest: `.claude-plugin/plugin.json`. It is the only file that states
the version, and the only path the plugin loader reads. Never add a second manifest at the repo root —
two files that both claim to be the manifest drift apart silently, because nothing forces them to agree.

`AGENTS.md` at the repo root is a pointer to this file and holds no rules of its own. It is short on
purpose: an agent whose tool reads that filename is sent here, so the rules stay written once. Never
answer a change to a rule by editing `AGENTS.md`.

## Where things are

The durable files this suite reads and writes, so a cold agent need not guess where something lives.

| File | Holds | Written by |
|---|---|---|
| `STATE.md` | the board — one block per feature, one row per slice, carrying `State`, `Gate` and `Blocked by` | `plan-breakdown` adds the block and its rows; the run flips the cells |
| `CONTEXT.md` | the glossary — one plain-language definition per domain term, no implementation detail | `project-setup` seeds it; `spec-grilling` appends terms |
| `docs/session-state.md` | where the work stands — five fields, rewritten whole each time, holding no history | `handoff` |
| `docs/session-log.md` | why it stands there — append-only, one entry per decision, never edited | `handoff`, and whichever skill decided |
| `docs/lessons.md` | what a root-caused defect turned out to be, and the guard against its return | `debugging-and-error-recovery` and `code-review` author entries; the run carries them in |
| `docs/adr/` | one file per decision, with the reasoning and what it ruled out | `spec-grilling`, `documentation-and-adrs` |
| `docs/features/<slug>/` | one feature's artifacts: `intent.md`, `research.md` and `research/<axis>.md`, `prd.md`, `acceptance.md`, `environment.md`, `architecture.md`, `plan.md` and `plan/<slice-id>.md`, `qa.md`, `<SLICE-ID>/security-findings.md`, `reviews/<SLICE-ID>-perf.md`, plus `migration.md` and `release.md` where the work calls for them | the stage that produces each one |

Shapes, tokens, caps and writers for the four state files are stated once, in
[state-schema](./references/state-schema.md) — cite it rather than restate a shape.

This repository is the suite, not one the suite runs in, so most of these rows have no file here.
[README.md](./README.md) under *Repository layout* says which ones it keeps and why.

## The 12 commands → which skill they run

Slash commands are thin entry points. Nine map one lifecycle stage each to its skill(s); the other
three are standalone and belong to no stage.

| Command | Runs | Owner |
|---|---|---|
| `/ideate` | interview-me, then idea-refine | human |
| `/spec` | codebase-research, then spec-grilling — applying to-prd, acceptance-criteria, environment-manifest and architecture-design as disciplines — then spec-review | human |
| `/plan` | codebase-research again, scoped to the aspect the signed decisions point at, then plan-breakdown | human |
| `/implement` | incremental-implementation, which applies test-driven-development | agent |
| `/verify` | quality-verification | agent |
| `/review` | code-review, code-simplification, security-and-hardening and performance-optimization, each dispatched code-cold in parallel | agent |
| `/ship` | pull-request — the spine of the stage; shipping-and-launch is release-level and follows once the human has merged | agent |
| `/orchestrate` | orchestrator — the wave-parallel DAG runner | agent |
| `/setup` | project-setup — the one-time repo scaffold | agent |
| `/explain` | literate-explainer — **standalone**, not a lifecycle stage | human |
| `/quiz` | comprehension-quiz — **standalone**, not a lifecycle stage | human |
| `/gauntlet-loop` | gauntlet-loop — **standalone**, not a lifecycle stage; offered, never auto-selected | human |

The **human owns Ideate + Spec + Plan**; the agent runs **Implement → Ship** unattended. `/explain`,
`/quiz` and `/gauntlet-loop` sit outside that loop entirely — run any of them at any time without
advancing a stage.

## Safety and autonomy (must-follow)

- **Risk-banded draft pull requests only.** An unattended run ends at an open draft pull request
  carrying a risk band, and never blocks waiting for input. Six named conditions do end a slice early —
  the stop list in [safety-rails](./references/safety-rails.md) — and a stopped slice reports rather
  than waiting.
- **Never auto-merge to `main`.** The agent opens the pull request; a human decides.
- **maker ≠ checker.** Verify and Review run as fresh, code-cold subagents that never saw the maker's
  context, each dispatched as the skill itself. There is no role to play on top of the method; the maker
  never grades its own work.
- **Test first.** The failing test is written and seen red before the code passing it
  (`test-driven-development`, applied by `incremental-implementation`). One thin vertical slice at a
  time, skeleton first.
- **One writer per file.** Two agents in parallel never own the same file; an unowned overlap is a race
  whose loser's work vanishes silently.

## Conventions

- Every skill lives at `skills/<kebab-case-name>/SKILL.md`, its frontmatter exactly `name` and
  `description`.
- Reference another skill by name and a file by relative link; never restate what either one says.
- The `SKILL.md` envelope — its eight sections and their order — is specified in
  [CONTRIBUTING.md](./CONTRIBUTING.md) and encoded once in code, in `scripts/check-envelope.mjs`. Those
  two are meant to agree: change the envelope and you change both in the same commit, or the check
  enforces the old contract while the prose describes the new one.
- Refer to a skill by its full name (`performance-optimization`, not `perf`; `quality-verification`, not
  `qa`). Artifact filenames (`qa.md`, `acceptance.md`, `environment.md`, …) and the `git` tool keep
  their own names — they are not skill pointers.

## How a change here is checked

Most of this repository is prose, and prose is where its defects live: a registry row naming a stage the
skill no longer runs in, a hand-counted roster total that went stale two deletions ago, a link to a
renamed file. Six checks under `scripts/` read the whole tree for exactly those, and
`.github/workflows/repo-checks.yml` runs them on every push and pull request, deliberately **not**
path-filtered — the drift these catch is usually introduced by a file far from the claim it invalidates.

Run all six before you open a pull request. All six must exit 0:

```
node scripts/check-envelope.mjs        # every SKILL.md has the eight sections, in order
node scripts/check-registries.mjs      # no registry omits a skill or command, and none lists a ghost
node scripts/check-references.mjs      # every relative link and shipped path resolves
node scripts/check-enumerations.mjs    # every hand-written count matches what is there
node scripts/check-stages.mjs          # the stage a registry assigns matches the stage the skill declares
node scripts/check-budget.mjs          # instructions, lines, words and description length, against the caps
```

There is no ratchet and no baseline file: never edit a number inside a script, or a count in prose, to
make a red check green. There is no root `package.json` or `Makefile` either — the six are plain Node
scripts you run directly. What they cannot check is whether the prose is any good: for that the checker
is still you, via the pre-PR list in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Boundaries

- Always: invoke `using-agent-skills` first to pick the stage skill, then follow the matched skill exactly.
- Always: run Verify and Review as code-cold subagents before a pull request opens.
- Never: auto-merge, push to `main`, or skip the failing-test-first order.
- Never: add a skill that is vague advice instead of an actionable process, or duplicate another skill.
