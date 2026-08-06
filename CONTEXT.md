# Project context

> Repo-wide glossary. Devoid of implementation detail — terms only. `project-setup` seeds this file;
> `spec-grilling` appends resolved terms under `## Glossary` as they land during Spec.

## Glossary

<!-- One entry per ubiquitous-language term: **Term** — plain-language definition (no code, no file paths). -->

## achilles-skills vocabulary

> The structural vocabulary of the suite itself (not the consuming project's domain language).

- **Skill** — a single discipline written in the house envelope, living at `skills/<name>/SKILL.md`. Reachable
  by the agent automatically or by a command. Names are descriptive and function-implying (e.g.
  `performance-optimization`, not `perf`).
- **Persona** (a.k.a. *agent*) — a thin role file at `agents/<name>.md` that a skill dispatches as a fresh,
  code-cold subagent. The persona is the *role*; the skill it points at is the *method*. Personas exist to
  preserve maker≠checker — the reviewer never shares the maker's context.
- **Command** — a slash command at `commands/<name>.md` that names the skill(s) that run it. A command is a
  thin entry point, not a restatement of the skill. Most are *lifecycle* commands, mapping one stage
  (Ideate · Spec · Plan · Implement · Verify · Review · Ship, plus `/orchestrate` and `/setup`). Two are
  *standalone* — `/explain` and `/quiz` — and belong to no stage; they can run at any time without
  advancing one.
- **Artifact** — a contract file passed between stages (`intent.md`, `prd.md`, `plan.md`, `research.md`,
  `acceptance.md`, `environment.md`, `qa.md`, `STATE.md`). Artifact names are independent of skill names.
- **Feature** — one unit of product work with its own set of documents, kept together under
  `docs/features/<slug>/`: the intent, the product spec, the signed behavioral contract, the plan, and the
  verification record. A feature is what a person signs off. It is then cut into slices, and a slice never
  spans two features. The board carries one block per feature and one row per slice inside it.
- **Slice** — one thin vertical path through the system, small enough to build and revert as one unit and
  complete enough to demonstrate. A slice crosses every layer it needs; it is never one layer on its own.
  The board carries one row per slice, and `plan.md` names the files each slice owns.
- **Run** — one pass over the plan's slices, Implement through Ship, executed by the agent without
  stopping to ask. A run has exactly two endings: every slice reaches an open draft pull request, or a
  stop condition ends it early. Most stop conditions end only the affected slice, and the rest of the
  graph keeps draining; a few end the whole run. Either way the run reports what stopped, and where. It
  never sits idle waiting for an answer.
- **Wave** — the slices in a run whose dependencies are already done, dispatched together in parallel. A
  run advances one wave at a time and holds a barrier: the next wave starts only once every slice in this
  one is `done`, `halted`, or `blocked`. Not the fan-out of reviewers over a single diff.
- **Board** — `STATE.md`: one table of features and their slices, with a `gate` column on every row. The
  board is the run's memory — an agent that lost its context resumes from the board, not from a
  conversation it can no longer see.
- **origin** — the `origin:` line under a feature's block on the board, naming the documents that feature
  came from (`prd.md · acceptance.md · plan.md`). It is there so a reader who opens the board cold can find
  out what the feature is without asking anyone.
- **building** — a feature-state token on the board: the plan is signed and the agent is working the
  feature's slices. The four feature states are `spec`, `plan`, `building`, `done`. Not a slice state — a
  slice is `impl`, `verify`, `review`, `ship`, `done`, `blocked`, or `halted`, and one feature in
  `building` normally has slices sitting in several of those at once.
- **Gate** — a point where work stops until something is true. Each gate has exactly one owner, the party
  that decides whether it opens; ownership is per gate, not per stage. The board's `gate` column holds
  only `you`, `agent`, or `done`.
- **Signed** — a document carries `status: signed` rather than `status: draft`, meaning a person read it
  and agreed to it. Only a person signs. An agent that needs an unsigned document stops; it does not
  build against a draft nobody stands behind.
- **Design contract** — the signed document holding one feature's look: the design decisions, the quality
  floor the interface must clear, and the prototype production re-implements. Design never goes in
  `acceptance.md`, which holds behavior and nothing else, so the two can never contradict. Where the
  repository has a design system the contract records only the delta, so design is read across two files
  as one source: this one decides the surface, and `docs/design.md` decides every axis the contract marks
  inherited. Verify grades a slice's interface against both, and nothing is built for a slice whose
  contract is unsigned.
- **Design ref** — the board column, copied word for word into every dispatch brief, naming the design
  contract and prototype a slice builds against. A slice that builds no user interface carries `—`. It is
  never left blank: blank reads as "nobody looked", and both the builder and the code-cold checker are
  meant to be told which case they are in rather than infer it from a diff.
- **Design system** — the repository's decided look, written down once at `docs/design.md`: the choices
  every interface in the repository shares, as opposed to the ones a single screen makes for itself. The
  first user interface built there writes it from what that surface decided; every later one starts from
  it instead of re-opening the palette. What it covers, and in what shape, is
  `references/design-system-format.md`. A repository with no user interface has none, and that is correct
  rather than missing — nothing creates it in advance.
- **Delta** — what one feature's design contract records in a repository that already has a design system:
  only what differs from it, plus the names of the axes it takes unchanged. The inherited axes are not
  restated, because a second copy of a decision is a copy that can disagree with the first and a reviewer
  has no way to tell which one is stale.
- **Departure** — a design contract's stated, reasoned move away from the design system on something the
  system already decided, written under its own heading where a reviewer will see it. Distinct from a
  delta, which fills in what the system leaves to each surface. A departure presented as though it were
  the decided look — or one with no reason given — is a defect the Verify stage reports.
- **Design evidence source** — an optional local record of design material a repository already trusts, of
  whatever kind it happens to have: a component inventory, a token export, a screenshot library. Where one
  is configured, a design step may draw candidate choices from it, and the brief still decides — a
  suggestion that contradicts the brief is not taken. It is never required: where there is none, the work
  runs exactly as it did before such a source existed, and nothing checks for it or reports it missing.
- **Test contract** — `docs/test-contract.md`: the repository's list of scenarios it must never lose.
  Not one feature's behavior, but the behavior that outlives every feature that touches it. Each entry
  is a row, `PENDING` or `ACTIVE`. The file starts empty, and an empty one binds nothing. Distinct from
  `acceptance.md`, which holds one feature's behavior and is re-signed whenever that feature's `prd.md`
  moves.
- **PENDING row** — a test-contract row written down so it is not forgotten. Nothing enforces it. Work
  may fail against a PENDING row and nothing stops. Every row starts here.
- **ACTIVE row** — a test-contract row a person has made permanent. It may never be skipped, weakened,
  or narrowed — not by a slice, not by a retry, not by any run. Activation is a person's act and it is
  one-way: a person moves a row PENDING → ACTIVE, and nothing moves it back. The agent never moves a row
  in either direction; it may propose a new PENDING row freely, but it reads this file and does not edit
  it.
- **Frozen** — cannot be edited to make a failing check pass. Four things are frozen, on two different
  terms. Three are frozen **for a slice's retry loop**: the signed `acceptance.md`, any test written to
  fail before the code that makes it pass, and the behavior a slice declared it must not break. Those
  three can change between runs, as a Spec change a person signs outside the run. The fourth is frozen
  **permanently**: an ACTIVE row in the test contract, in every run, forever — there is no loop it thaws
  after and no Spec change unfreezes it. All four are frozen because they are the only evidence that did
  not come from whoever wrote the code.
- **Gate erosion** (written `gate-erosion` inside skills) — editing one of the four frozen things,
  deleting a guard, or weakening a check so that a failing gate goes green. It is a stop condition, not a
  shortcut, and it ends the **slice**, not the run: the slice halts, its `gate` flips from the agent to
  you, and the halt names what changed — the artifact, or for the test contract the row id. The rest of
  the graph keeps draining. Code that passes a test it rewrote proves nothing.
- **Halted** — a slice state: this slice's own gate failed and nothing further will be attempted on it.
  Its `gate` flips from the agent to you. The next move is yours, on this slice.
- **Blocked** — a slice state: this slice never ran, because a slice it depends on halted. Nothing is
  wrong with the blocked slice itself. The next move is yours too, but on the halted slice upstream —
  clear that one and this one becomes runnable again. Distinct from the board's `Blocked by` column,
  which lists the slices a row waits on and is written by the planner before the run starts.
- **Code-cold** — dispatched with no memory of how the code was written. A code-cold agent reads the diff
  and the running build, never the implementer's reasoning. Verify and Review are always code-cold, so
  nobody grades their own work.
- **Risk band** — the label a draft pull request carries that tells a person how hard to look before
  merging: `LOW` or `MEDIUM`. Blast radius raises it — authentication, payments, data, deletions,
  deploys, secrets — and so does a quiet pass: a check that landed exactly at its threshold, a scenario
  nobody could reach, retries spent. It exists because nothing stops mid-run for a person to sign off, so
  the risk has to surface at the merge instead. Not the same vocabulary as the environment probe, which
  reports `green`, `amber`, or `red` about whether a manifest row is provisioned — that grades the
  environment before a run starts, this grades a diff after one ends.
- **Session log** — the `## Log` zone of `docs/session-state.md`: the record of decisions, one entry each,
  in the order they were made. The five fields above it are a snapshot of where the work stands, rewritten
  every time; the log is why it stands there, and it is never rewritten. A session picking the work up cold
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
  glossary, the decision records, the per-feature documents, the test contract, the process contract at
  `docs/workflow.md`, the decided look at `docs/design.md`, and the session state — plus the
  `## Agent skills` block written into the repo's `CLAUDE.md` or `AGENTS.md`, which is what points a cold
  agent at the rest. `project-setup` creates them once so every later skill reads them cold — all but
  `docs/design.md`, which it names so nobody invents a path for it, and which the first user interface
  built in the repository writes. Files that only describe how this suite itself is written are not
  substrate; nothing scaffolds those into a consuming project.
