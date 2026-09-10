# Project context

> Repo-wide glossary. Devoid of implementation detail — terms only. `project-setup` seeds this file;
> `spec-grilling` appends resolved terms under `## Glossary` as they land during Spec.

## Glossary

<!-- One entry per ubiquitous-language term: **Term** — plain-language definition (no code, no file paths). -->

The terms below are the structural vocabulary of the suite itself, not a consuming project's domain
language. Every term this repository defines lives in this one section.

- **Skill** — a single discipline written in the house envelope, living at `skills/<name>/SKILL.md`. Reachable
  by the agent automatically or by a command. Names are descriptive and function-implying (e.g.
  `performance-optimization`, not `perf`).
- **Command** — a slash command at `commands/<name>.md` that names the skill(s) that run it. A command is a
  thin entry point, not a restatement of the skill. Most are *lifecycle* commands, mapping one stage
  (Ideate · Spec · Plan · Implement · Verify · Review · Ship, plus `/orchestrate` and `/setup`). Three
  are *standalone* — `/explain`, `/quiz`, and `/gauntlet-loop` — and belong to no stage; they can run at
  any time without advancing one.
- **Artifact** — a contract file passed between stages (`intent.md`, `prd.md`, `plan.md`, `research.md`,
  `acceptance.md`, `environment.md`, `architecture.md`, `qa.md`, `STATE.md`). Artifact names are
  independent of skill names.
- **Design reference** — where a feature has a look, the material it is built against: a link or exported
  screens, plus the states each surface owes, named (empty · loading · error · success). `prd.md` points
  at it, and Verify grades each named state. A feature with no look has none, and that is correct rather
  than missing; a reference that was named but could not be reached is recorded with its reason, and it
  stops nothing.
- **Feature** — one unit of product work with its own set of documents, kept together under
  `docs/features/<slug>/`: the intent, the product spec, the signed behavioral contract, the plan, and the
  verification record. A feature is what a person signs off. It is then cut into slices, and a slice never
  spans two features. The board carries one block per feature and one row per slice inside it.
- **Slice** — one thin vertical path through the system, small enough to build and revert as one unit and
  complete enough to demonstrate. A slice crosses every layer it needs; it is never one layer on its own.
  The board carries one row per slice, and `plan.md` names the files each slice owns.
- **Run** — one pass over the plan's slices, Implement through Ship, executed by the agent without
  stopping to ask. Every slice ends at an open draft pull request or `blocked`, and a stop condition ends
  only the slice that met it — the rest of the graph keeps draining. The run reports what stopped and
  where; it never sits idle waiting for an answer.
- **Wave** — the slices in a run whose dependencies are already done, dispatched together in parallel. A
  run advances one wave at a time and holds a barrier: the next wave starts only once every slice in this
  one is `done` or `blocked`. Not the fan-out of reviewers over a single diff.
- **Board** — `STATE.md`: one table of features and their slices, with a `Gate` column on every row. The
  board is the run's memory — an agent that lost its context resumes from the board, not from a
  conversation it can no longer see.
- **building** — a feature-state token on the board: the plan is signed and the agent is working the
  feature's slices. Not a slice state, and the two vocabularies are listed once in
  [state-schema](./references/state-schema.md); one feature in `building` normally has slices sitting in
  several slice states at once.
- **Gate** — a point where work stops until something is true. Each gate has exactly one owner, the party
  that decides whether it opens; ownership is per gate, not per stage. The board's `Gate` column holds
  one owner token per row ([state-schema](./references/state-schema.md)).
- **Signed** — a document carries `status: signed` rather than `status: draft`, meaning a person read it
  and agreed to it. Only a person signs, and one signature covers Spec's whole bundle. A draft is read
  and worked from; what had to be derived instead is marked `derived` where it is used. An autonomous
  run is the one place the token is a precondition, on the `acceptance.md` it grades slices against.
- **Blocked** — a slice state, and the only way a slice ends other than at an open draft pull request:
  either a stop-list item ended it, or a slice it depends on ended and this one never ran. Its `Gate`
  flips from the agent to you, the report names which case it is, and the rest of the graph keeps
  draining. Distinct from the board's `Blocked by` column, which lists the slices a row waits on and is
  written by the planner before the run starts.
- **Code-cold** — dispatched with no memory of how the code was written. A code-cold agent reads the diff
  and the running build, never the implementer's reasoning. Verify and Review are always code-cold, so
  nobody grades their own work.
- **Risk band** — the label a draft pull request carries that tells a person how hard to look before
  merging: `LOW`, `MEDIUM`, or `HIGH`. Blast radius raises it — authentication, payments, data, deletions,
  deploys, secrets — and so does a quiet pass: a check that landed exactly at its threshold, a scenario
  nobody could reach, retries spent. It exists because nothing stops mid-run for a person to sign off, so
  the risk has to surface at the merge instead. Not the same vocabulary as a Verify or Review verdict,
  which is `pass`, `concerns`, or `block` — those grade one piece of work, this grades how carefully to
  read a whole diff before merging it.
- **Session log** — `docs/session-log.md`, the file beside `docs/session-state.md`: the record of decisions, one entry each,
  in the order they were made. `docs/session-state.md`'s five fields are a snapshot of where the work
  stands, rewritten every time; the log is why it stands there, and it is never rewritten. A session picking the work up cold
  reads both before it acts, so a question the log already answers does not get re-opened from zero.
- **Entry** — one decision in the session log, holding four things and nothing else: the decision, the
  reason, what was ruled out, and what is still open. It never records which files changed or what a diff
  did — git holds that already, and a second copy of a fact you can derive is a copy that can disagree with
  its source.
- **Append-only** — content is only ever added after what is already there; nothing already written is
  reworded, re-dated, re-ordered, or removed. The session log is append-only. An entry that turned out to
  be wrong is corrected by a new entry naming it, and the wrong one stays — that the call was once made
  that way is the fact worth keeping.
- **Substrate** — the durable files a stage reads and writes instead of remembering: the board, this
  glossary, the decision records, the per-feature documents, the lessons record at `docs/lessons.md`, and
  the session state with the log beside it — plus the `## Agent skills` block written into the repo's
  `CLAUDE.md` or `AGENTS.md`, which is what points a cold agent at the rest. `project-setup` creates them
  once so every later skill reads them cold. Files that only describe how this suite itself is written
  are not substrate; nothing scaffolds those into a consuming project.
- **Source-of-truth order** — the stated ranking that says which document governs when two of them say
  the same thing differently. It is written down so nobody has to guess, and so a disagreement an agent
  cannot settle ends that slice with both files named, rather than being resolved by whichever document
  the agent happened to read first.
- **Lesson** — one root-caused defect written down once: what broke, what it turned out to be, and the
  guard that would catch it if it happened again. The guard is named when the defect is understood, not
  when somebody later decides to enforce it — entries that do not each carry their own guard cannot be
  turned into guards later without working every one of them out from scratch.
