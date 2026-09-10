---
name: plan-breakdown
description: Turn a signed prd.md into vertical, demoable slices and the Blocked-by DAG a run schedules from. Use when Plan opens, or on "plan this", "break it into tasks", "write the implementation plan". Elaborates decisions already recorded, never taking them (spec-grilling); writes no slice code (incremental-implementation).
---

# plan-breakdown — THE planner (Plan stage)

## Purpose

**Stage: Plan.** Principles 1, 5, 6, 7, 10.

THE planner: a signed `prd.md` becomes vertical demoable slices and the `Blocked-by` DAG a run
wave-schedules from — `plan.md` as the map, one `plan/<slice-id>.md` per slice, the slice rows in
`STATE.md`. It elaborates Spec's structural decisions rather than reopening them. Plan is the last
human-owned stage — the last depth anyone adds before the run.

## When to use / when to skip

- A signed `prd.md` exists and the work needs cutting into units an agent can build — "plan this",
  "break it into tasks", or a prose sketch about to reach a build agent.
- **Not here:** a structural decision still open (the Spec sitting, `spec-grilling`); building a planned
  slice (`incremental-implementation`); a one-file change whose scope is already obvious.

## Inputs

Resolve each in order: inline in the prompt, a path in the prompt, then the canonical file —
`docs/features/<slug>/` for all but `docs/adr/`. Where one is absent, derive from what its bullet names
and mark the value `derived`.

- `prd.md` — helps: the outcome and the `## User Stories` ids slices back-reference · without it: take
  both from `intent.md` or the prompt, coining ids.
- `research.md` — helps: the as-is map every `file`/`lines` is checked against, and the `## Structural
  facts` seams a new signature matches · without it: run `codebase-research`.
- `research/<axis>.md` — helps: the `path:line` behind the synthesis · without it: read the source.
- `architecture.md` — helps: this feature's signed structure and the ADRs it cites · without it: say so
  in `## Architecture`, building against `research.md` alone.
- `acceptance.md` — helps: the scenario id each step's `test` realizes · without it: write tactics from
  `## Testing Decisions`, ids left to Verify.
- `docs/adr/` — helps: the decisions to cite by id · without it: a choice faced here becomes a new ADR.

A `research.md` with no `## Plan pass — <aspect>` section is the Spec-era survey, older than the
decisions: run `codebase-research` again first. Plan is human-led — ask at most three questions, only
where the gap changes the plan's shape, then decide.

## The Planning Process

1. **Read, then cut — the output is a plan document and no code.** Pin no signature before
   `research.md`'s `## Codebase map` and `## Structural facts`; one written from recollection forks a
   second convention.

2. **Map what depends on what, and order bottom-up** — foundations first, high-risk work early while
   there is still plan left to change. Independent slices, tests and docs parallelize; migrations and
   shared-state changes stay sequential; a surface two slices share is pinned first.

3. **Cut vertical slices** — each a thin end-to-end cut, demoable on its own, two layers or more,
   inside the modules and behind the seams `architecture.md` names, with a PRD-namespaced id (`PWR-1`)
   back-referencing a `## User Stories` id and naming the siblings it is `Blocked-by`. Five files is the
   working size; two subsystems, more than three acceptance bullets, past one focused session, or "and"
   in the title makes it two slices. Owned files stay disjoint across a wave
   (`../../references/safety-rails.md`).

4. **End every slice at an observable checkpoint** — behaviour a person or a test can see ("submit a bad
   email → the inline error shows"), not "compiles". One sits after every two or three steps, each step
   leaving the system working. A checkpoint that asks permission mid-run is dead text.

5. **Give each slice its own step file** at `plan/<slice-id>.md`. Every non-trivial step names `file` ·
   `lines` · `snippet` · `test` — the snippet being the code that will appear in the diff, the `test` that
   step's own acceptance check, naming the `acceptance.md` scenario id it realizes. A rename, an import
   add or a one-line change may be a line of prose; "add validation" is neither.

6. **Land the depth inline in `plan.md`** — typed signatures and field lists (`codebase-design`) and the
   chosen surface's contract (`api-design`), in `## File Structure` and the step snippets. A recorded
   decision is cited by id and built to; one planning shows wrong is an `## Open Questions` entry, not a
   boundary quietly moved. A hard-to-reverse decision first faced here becomes an ADR
   (`documentation-and-adrs`), cited by id, never restated.

7. **Write the board** — slices are born here: one block per feature and one row per slice in
   `STATE.md`, per `../../references/state-schema.md`, each row at state `impl` and gate `you` until the
   person signs.

## No placeholders

Grep `plan.md` and every file in `plan/` for `TBD`, `TODO`, `implement later`, `fill in details`,
`add appropriate error handling`, `add validation`, `handle edge cases`, `Write tests for the above`,
`Similar to Step N`, any type or function no step defines, and any code step missing its `snippet`.
Rewrite each hit before handoff.

## Horizontal-plan rejection (self-check)

Left alone, models plan by layer, and only the explicit grep catches the slippage. Grep your own plan
and rewrite every hit: a slice or phase named for a layer (`Slice 1: Database`, `## All API changes`); a
slice whose owned files all sit in one directory, unless it is genuine scaffolding that still ends at a
cross-layer checkpoint; a checkpoint claiming no more than that it builds.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Schema first, then the API, then the UI — cleaner that way." | Nothing works end to end until the last slice, with no checkpoint in between to debug from. |
| "This slice is risky, so its checkpoint should ask a person first." | The run has no pause; the risk goes in `## Risks and Mitigations`, and as a fact in the box it reaches the PR. |
| "'Add validation' is clear enough — the implementer will work it out." | What gets worked out is code that bypasses the spec. |
| "Copying the row into the slice file saves the implementer a hop." | The copy goes stale the first time the table is corrected. |
| "The recorded decision is wrong, so I'll plan the better structure." | A person chose it, not an agent; a wrong one is an `## Open Questions` entry. |

## Red Flags

- A slice whose owned files all sit in one directory or one layer.
- A checkpoint box that says "compiles", "builds", or "the tests pass".
- A checkpoint box asking a person to approve mid-run.
- A step that says what to do without the code that will appear in the diff.
- A slice-table row whose `Steps` cell is blank.
- `## Open Questions` still holding an entry at handoff.

## Verification

- [ ] Every slice spans two layers or more, is demoable on its own, and ends at an observable checkpoint
      on top of the standing bar in `../../references/definition-of-done.md`.
- [ ] Every slice has a `plan/<slice-id>.md` on disk, and every file in `plan/` is named by exactly one
      row — compared as sets.
- [ ] Every non-trivial step carries `file` · `lines` · `snippet` · `test`.
- [ ] The placeholder grep and the layer-name grep both come back empty.
- [ ] The `Blocked-by` edges are acyclic, and `STATE.md` holds one row per slice.
- [ ] `## Architecture` carries the overview and not only a link.
- [ ] `## Open Questions` is empty — after the signature there is no channel back.
- [ ] Every derived value is marked `derived`, and each file's size is reported against its cap.
- [ ] The person has signed — the pre-run gate, the open draft pull request the post-run one, nothing
      between them.

## Outputs & handoff contract

**`docs/features/<slug>/plan.md`** — cap 1,200 words; the map, not the steps. Sections in order:
`## Goal` · `## Architecture` · `## Tech Stack` · `## File Structure` (one line of responsibility per
file) · `## Vertical slices` · `## Risks and Mitigations` (`| Risk | Impact | Mitigation |`) ·
`## Open Questions`. `## Architecture` carries an overview — modules touched, seams gone through,
layer order where one was decided — and points at `architecture.md` for the rest.

| Slice id | Story-ref | Steps | Files (owned, disjoint) | Regression surface | Checkpoint (observable) | Blocked-by |
|---|---|---|---|---|---|---|
| PWR-1 | US-1 | `plan/PWR-1.md` | `schema/user.ts`, `api/reset.ts`, `ui/ResetForm.tsx` | `auth/session.ts` | Submit a bad email → the inline error shows | — |

`Steps` is always `plan/<slice-id>.md`, with no `—` case: a blank cell means the file was never written.

**`docs/features/<slug>/plan/<slice-id>.md`** — cap 150 lines, named for the slice id alone, so an agent
handed only `PWR-2` finds its steps. A `Row:` pointer, then one block per non-trivial step:

````markdown
# PWR-1 — request a reset link

Row: `docs/features/<slug>/plan.md` → `## Vertical slices`

**Step 1 — add the reset-token table**
- **file:** `schema/user.ts` · **lines:** `new file`
- **snippet:** `export const resetTokenTable = pgTable("reset_token", {/* ... */});`
- **test:** `tests/reset.test.ts — rejects an expired token` (realizes `PWR-A1`)
````

Steps closing a checkpoint end with its `- [ ]` boxes naming the story ids they answer;
`Checkpoint (observable)`, `Files (owned)`, `Regression surface` and `Blocked-by` stay canonical in the
table, never copied down.

**`STATE.md`** — the feature block and one row per slice, per `../../references/state-schema.md`.
**`docs/adr/ADR-<NNN>-<slug>.md`** — cap 350 words, where this stage is first to face a hard-to-reverse
decision. **`docs/session-log.md`** — one 60-word entry per decision taken with nobody to ask.

Report each file's measured size against its cap; an over-cap draft is reported, never handed on as if
it fit. Then hand the signed plan and its DAG to `orchestrator`.
