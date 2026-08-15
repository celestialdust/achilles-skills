# Who writes what

The registry of write ownership across this suite: every file a skill may write, cut into parts, with one
writer named per part. `scripts/check-write-table.mjs` reads this file, collects the writes each `SKILL.md`
declares in prose, and judges each claim against the table below.

This is a maintainer's document. It ships with the plugin and is never scaffolded into a consumer's
repository — a consumer does not care which skill owns which zone, and the constraint it encodes is the
suite's internal integrity rather than anything about how their work ships.

Files here are named as the skills name them: per-feature documents live under `docs/features/<slug>/` and
are written unqualified (`prd.md`, `acceptance.md`), repository-wide ones carry their path.

## The rule

Every file has parts — the table calls one a **zone** — and each zone has exactly one writer. A file with
two writers is not by itself a problem: more than one party appends to the glossary, and they add
different terms. Two writers on the same zone is a problem, because neither can see what the other
assumed, and whichever runs second quietly decides.

Four things a writer may do to a zone:

- **create** — write it where nothing was. Writing it again replaces what was there.
- **append only** — add after what is there, and never reword, re-order, re-date, or remove any of it.
- **flip status** — change one declared token in place, and nothing else.
- **never** — do not write it at all.

The first covers the other two: a writer who may replace a zone outright may also add to it or flip a
token inside it. The narrower two never widen. **append only** does not license a rewrite, and **flip
status** does not license a create — which is the point of writing the permission down at all, since a
writer with a legitimate zone is exactly who would otherwise do more to it than was agreed.

**The table binds the agent.** Where the writer is **you**, no skill writes that zone at all. Where the
writer is a skill, that skill is the only *skill* that writes it — you may still hand-edit your own
repository, and `project-setup` says which of these files are yours to edit when it scaffolds them. A
skill in the writer column is not a claim that you may not touch the file.

**`Named by` says what makes a claim matchable.** A skill declares its writes in prose, so anything
checking the table has to recognize the zone from the words on the page. That column holds the zone's
**cue**: the tokens a declaration has to repeat, in backticks or bold, for the zone to count as named.
Alternatives are separated by `/`, and tokens are joined by `+` where all of them are needed. A token
counts where it stands in a sentence that says something is written, at any distance from the verb — a
sentence that only reports a state ("the feature stays in `feature: spec`") writes nothing and names no
zone. The cue, not the wording, is the zone's identity: rewording a gloss cannot hide a zone already
granted to somebody else.

A cue of `—` means the zone cannot be named from prose. Those zones of a file cannot be told apart, so a
claim naming none of a file's cues is **unresolved**: it might be a legal write to the claimant's own
zone or a trespass on a neighbour's, and whoever reads the check settles it by hand. Give a zone a cue
where that distinction has to hold and it settles itself from then on. A file with no row at all permits
nothing: a declared write to a file this table does not list is a conflict, not a gap, which is what
keeps the table from being shrunk until it stops catching anything.

## Who writes what

| File | Zone | Named by | Who writes it | What they may do |
|---|---|---|---|---|
| `CLAUDE.md` / `AGENTS.md` | the `## Agent skills` block | — | `project-setup` | create |
| `CLAUDE.md` / `AGENTS.md` | the pointer line, in whichever of the two does not hold that block | — | `project-setup` | create |
| `CLAUDE.md` / `AGENTS.md` | the bundled behavioral template at the top of `CLAUDE.md`, where the repository had neither file and `CLAUDE.md` is the one you chose | — | `project-setup` | create |
| `CLAUDE.md` / `AGENTS.md` | everything else in the file | — | you | create |
| `docs/adr/` | the directory | — | `project-setup` | create |
| `docs/adr/` | a record for a decision taken during Spec | — | `spec-grilling` | create |
| `docs/adr/` | a record for a decision taken during Plan | — | `plan-breakdown` | create |
| `docs/adr/` | a record for a decision taken outside Spec and Plan, and any record superseding another | — | `documentation-and-adrs` | create |
| `docs/adr/` | a record already written | — | nobody | never |
| `CONTEXT-MAP.md` | the file, in a repository that keeps more than one context | — | `project-setup` | create |
| `CONTEXT.md` | the file and its `## Glossary` heading | — | `project-setup` | create |
| `CONTEXT.md` | a term resolved during Spec | — | `spec-grilling` | append only |
| `CONTEXT.md` | a term a decision record introduces | — | `documentation-and-adrs` | append only |
| `CONTEXT.md` | a definition already written, corrected before the Spec gate | — | `spec-review` | create |
| `STATE.md` | the legend and the slice-row column list | — | `project-setup` | create |
| `STATE.md` | a feature block and its slice rows, at the `impl` they are born at | — | `plan-breakdown` | create |
| `STATE.md` | `origin:` — the `research.md` entry | `origin:` + `research.md` | `codebase-research` | append only |
| `STATE.md` | `origin:` — the ADR ids | `origin:` + `ADR-` | `spec-grilling` | append only |
| `STATE.md` | `origin:` — the `prd.md` entry | `origin:` + `prd.md` | `to-prd` | append only |
| `STATE.md` | `origin:` — the `acceptance.md` entry | `origin:` + `acceptance.md` | `acceptance-criteria` | append only |
| `STATE.md` | `origin:` — the `environment.md` entry | `origin:` + `environment.md` | `environment-manifest` | append only |
| `STATE.md` | `origin:` — the `plan.md` entry | `origin:` + `plan.md` | `plan-breakdown` | append only |
| `STATE.md` | a feature block's `feature:` state | `feature:` | `orchestrator` | flip status |
| `STATE.md` | a slice row's `State` and `Gate` once the row exists — every slice token but the `impl` it is born at | `verify` / `review` / `ship` / `done` / `blocked` / `halted` / `gate:` | `orchestrator` | flip status |
| `STATE.md` | `Artifacts` — the security findings entry | `security-findings.md` | `security-and-hardening` | append only |
| `STATE.md` | `Artifacts` — the release runbook entry | `release.md` | `shipping-and-launch` | append only |
| `STATE.md` | `Artifacts` — every other entry | `Artifacts` | `orchestrator` | append only |
| `docs/session-state.md` | the file, its five field headings and `## Log` | — | `project-setup` | create |
| `docs/session-state.md` | the five fields | — | `handoff` | create |
| `docs/session-state.md` | `## Log` | — | `handoff` | append only |
| `docs/session-state.md` | an entry already in `## Log` | — | nobody | never |
| `docs/design.md` | the whole file — written from the first user interface built here, and again where a later surface deliberately moves the repository's look | — | `frontend-design` | create |
| `docs/design.md` | any part of it, for a surface that inherits the look rather than moving it | — | nobody | never |
| `docs/features/<slug>/` | the directory | — | `project-setup` | create |
| `docs/features/<slug>/` | the committed prototype under `prototype/` | — | `frontend-design` | create |
| `intent.md` | the file | — | `interview-me` | create |
| `intent.md` | its sections, sharpened in place | — | `idea-refine` | create |
| `research.md` | the six stable sections, written by the Spec pass | — | `codebase-research` | create |
| `research.md` | the section the Plan pass appends for its own aspect | `## Plan pass` | `codebase-research` | append only |
| `research/<axis>.md` | the whole file, written by the one sub-agent that owns that axis | — | `codebase-research` | create |
| `research/<axis>.md` | a file an earlier pass wrote — a later pass adds its own axis instead | — | nobody | never |
| `prd.md` | the file | — | `to-prd` | create |
| `prd.md` | a decidable fact corrected before the Spec gate | — | `spec-review` | create |
| `acceptance.md` | the file, while it is draft | — | `acceptance-criteria` | create |
| `acceptance.md` | a decidable fact corrected before the Spec gate, while it is draft | — | `spec-review` | create |
| `acceptance.md` | any part of it, once signed | — | nobody | never |
| `environment.md` | the file | — | `environment-manifest` | create |
| `environment.md` | a decidable fact corrected before the Spec gate | — | `spec-review` | create |
| `architecture.md` | the file — one feature's structural delta | — | `architecture-design` | create |
| `architecture.html` | the file, its source block spliced from `architecture.md` | — | `architecture-design` | create |
| `design-contract.md` | the file | — | `frontend-design` | create |
| `plan.md` | the file | — | `plan-breakdown` | create |
| `plan.md` | the interface contracts written into it | — | `api-design` | create |
| `qa.md` | the file | — | `quality-verification` | create |
| `security-findings.md` | the file, one per owning slice | — | `security-and-hardening` | create |
| `release.md` | the file, one per release | — | `shipping-and-launch` | create |
| `spec-review.md` | the file | — | `spec-review` | create |
| `handoff.md` | the file | — | `handoff` | create |
| `docs/lessons.md` | the file, its `## Entry shape` heading and the template beneath it | — | `project-setup` | create |
| `docs/lessons.md` | an entry for a root-caused defect | `root-caused` | `debugging-and-error-recovery` | append only |
| `docs/lessons.md` | an entry for a Critical review finding | `Critical:` | `code-review` | append only |
| `docs/lessons.md` | an entry a slice handed back, appended at the TERMINAL barrier from the checkout the orchestrator holds | `TERMINAL barrier` | `orchestrator` | append only |
| `docs/lessons.md` | an entry already written | — | nobody | never |
| `docs/progress.md` | the file and its `## Entry shape` heading | — | `project-setup` | create |
| `docs/progress.md` | a slice's entry, where that slice ran on its own | `hand-run path` | `incremental-implementation` | append only |
| `docs/progress.md` | a slice's entry, where a run drove the slice | `per dispatch` | `orchestrator` | append only |
| `docs/progress.md` | an entry already written | — | nobody | never |

The lessons record is the case worth reading twice. Two parties author entries and neither is wrong: one
records what a defect turned out to be, the other records a Critical finding a review caught. They write
different entries for different reasons, so no zone of the file has two authors. A third row lets the
orchestrator append an entry a slice handed back, because an append made from inside a slice's worktree
lands on a branch that may never merge. Keyed by file alone, that arrangement would read as a violation
and the rule would have to carve an exception for it — which is why the key is the zone, not the file.

Never **scaffolded** is not never **written by a skill** — the row names its writer, and only the
create-it-empty step is absent. That is what the `docs/design.md` rows above mean.

**A change that adds a writer adds that writer's row, in the same commit.** A file with no row permits
nothing, so a new writer arrives as a decision somebody wrote down rather than as drift. A row reading
`never` outliving the wave that gave the file a writer is how this goes wrong: the table reads as current
while describing a repository that no longer exists. The rule is not what failed; skipping it is.
