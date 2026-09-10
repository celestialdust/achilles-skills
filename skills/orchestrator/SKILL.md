---
name: orchestrator
description: Run a signed slice DAG unattended — sort it into waves, dispatch each wave in parallel worktrees through Implement → Verify → Review → Ship, ending at open draft pull requests a person merges. Not for one slice by hand (`incremental-implementation`) or cutting a plan into slices (`plan-breakdown`).
---

# Orchestrator

## Purpose

**Stage: cross-cutting.** Principles 1, 7, 8.

The autonomous span: it sorts a signed slice DAG into waves and drives every slice through Implement →
Verify → Review → Ship in parallel worktrees until each reads `ship` or `blocked`, and ends at open
draft pull requests a person merges. Hand-running slices throws away the parallelism the DAG was cut
for.

## When to use / when to skip

- The spec is signed, the plan is cut into slices, and the build should run unattended.
- A run resumed after an interruption or a compaction, where the board reads `state: building`.
- A single ready slice — it still gets its worktree, barriers and gates, so run the loop.
- Not here: a slice by hand (`incremental-implementation`), cutting the plan (`plan-breakdown`), grading a slice (`quality-verification`), the pull request (`pull-request`).

## Inputs

- `STATE.md` — helps: the rows and their `Blocked by` cells are the DAG · without it: derive the slices from `plan.md` or the prompt, write the board, mark it `derived`
- `docs/features/<slug>/plan.md` and `plan/<slice-id>.md` — helps: each slice's steps, tests and owned files · without it: derive ownership from the steps, mark it `derived`, and give a slice whose files you cannot name its own sub-wave
- `docs/features/<slug>/acceptance.md` at `status: signed` — helps: the one human-anchored oracle, the run's single precondition · without it: name the missing signature by path, dispatch nothing, invent no scenarios
- `docs/features/<slug>/prd.md` — helps: the design reference a UI slice is graded against, and the Not-Doing list · without it: derive both from `intent.md`, marked `derived`
- `docs/session-log.md` — helps: what earlier waves decided, so a resumed run does not re-open it · without it: start it

## Process

1. Read `STATE.md` and `git log` first; re-dispatch nothing already at `ship` or `done` — after a compaction the board is the only witness.
2. Parse `Blocked by` into edges; sort into topological waves. A cycle stops nothing: cut the edge the plan supports least, log it, carry a decided-for-you row.
3. Open the run in one write — the header's `state:` to `building` and its `gate:` to `agent`, every row's `Gate` to `agent`, nothing else. Probe `environment.md` through `preflight-readiness` before the first wave: an unreachable row is decided and flagged, one needing a credential is a stop-list item.
4. A slice is ready when every blocker reads `ship` or `done`. Two ready slices that would write one file go into separate sub-waves (one writer per file — [`references/safety-rails.md`](../../references/safety-rails.md)); order the rest by longest downstream chain, then dependent count, then `plan.md` line order.
5. Give each ready slice a clean worktree (`worktree`); dispatch the wave in one response — `incremental-implementation`, then `quality-verification` code-cold in that worktree ([`references/safety-rails.md`](../../references/safety-rails.md), *Code-cold dispatch*). A brief carries the slice id, its `plan/<slice-id>.md`, the signed `acceptance.md` and the design reference `prd.md` points at — never session history. One dispatch primitive serves the run — parallel subagents, or the host's worktree-isolated workflow.
6. Hold the Verify barrier: no review starts until every dispatched slice has cleared Verify or is terminal, so the wave reads as one changeset.
7. Dispatch `code-review`, `code-simplification`, `security-and-hardening` and `performance-optimization` code-cold over the union of the wave's Verify-cleared diffs — all four, once per wave, never per slice. Each row below adds one more when its fact is checkable in the diff; design-reference fidelity stays Verify's, on a running interface.

| The fact, checkable in the diff | Adds |
|---|---|
| a symbol, route or schema a file outside the wave imports or calls | `api-design` |
| something deleted or renamed that is still named outside the diff | `deprecation-and-migration` |
| CI, build or deploy configuration changed | `ci-cd` |
| a new error branch, retry, job or call emitting no log, metric or trace | `observability-and-instrumentation` |

8. Attribute each finding to its owning slice by file, route only that slice back into the ladder, and re-review only its diff — carrying the round's `Critical` findings into the brief, or the next reviewer cannot tell a repaired slice from one never broken.
9. Climb a rung at a time, spending one only when the approach changed; an identical failure or diff twice promotes a rung rather than ending the slice. Budget two attempts at a gate and three implement→verify→review cycles per slice. A stop-list condition ([`references/safety-rails.md`](../../references/safety-rails.md)) skips to rung 5 unspent: a gate working, not a defect to repair.

| Rung | The move |
|---|---|
| 1 | Retry with the failure in context — the command, its output, the diff. |
| 2 | Root-cause it through `debugging-and-error-recovery`: reproduce, one hypothesis, prove it first. |
| 3 | Change the route, not the destination — the same `done_when`, another way. |
| 4 | Shrink the slice: ship what passes, name what the remainder owes. |
| 5 | Surface it — `blocked`, `Gate` to `you`, the report saying what each rung tried. |

10. Decide every ambiguity outside the stop list: default, reason, build, one `docs/session-log.md` entry, one Decided-for-you row for `pull-request`. When a plan section changes, re-read the decisions citing it and confirm or reverse each, logged. Nothing is frozen: a changed test or scenario is disclosed in the pull request.
11. Hold the TERMINAL barrier: advance only when every dispatched slice reads `ship` or `blocked`, never on "success". Write each transition to `STATE.md` as it happens, flip a blocked slice's dependents transitively, let every other branch drain, and carry each lesson a slice hands back into `docs/lessons.md`, in the checkout you hold.
12. Never summarise progress between waves; a run that stops terminates and reports rather than waiting.
13. Run the merged-union suite once in an integration worktree after a connected component goes green, routing a failure back into the ladder. Before each pull request, check the slice against `plan/<slice-id>.md` — every step has a hunk in the diff, nothing outside the row's `Regression surface` changed; a miss is a repair, not a note. Correctness and testing strategy are `code-review`'s verdict, attributed at step 8. End at one open draft pull request per shipped slice through `pull-request`, reproducing the band that skill computed — never compute one, never let a HIGH band hold a slice.

## Rationalizations

| You catch yourself thinking… | Reality |
|---|---|
| "The board reads `state: plan`, so the plan is unsigned." | Nothing writes `building` but step 3; a person starting the run is that signature. |
| "Both ready slices touch one file, but it is a tiny edit." | Two writers on one file is a race whose loser's work vanishes with no error. |
| "Five dependents beats four — start that one." | Five leaves is one step; four in a row is four, and the clock waits on the chain. |
| "This axis never finds anything — trim the fan-out." | Speed comes from ordering and parallelism, not from fewer checks. |
| "Same failure twice — the slice is unfixable." | An identical failure means that rung is finished, not the slice. |
| "I should check in before the next wave." | Nobody is watching; a mid-run summary reaches an empty chair. |

## Red flags

- Two slices in one wave owning the same file.
- A sub-wave picked by feel rather than by chain depth.
- A review fan-out run per slice instead of once over the wave union.
- A barrier advanced on "success" rather than a terminal state.
- A risk band computed or adjusted here, or read as a reason to hold a slice.
- A slice already at `ship` dispatched again, or a handed-back lesson left in a worktree.

## Verification

- [ ] No slice sits mid-loop: each is at `ship` with its draft pull request open, or `blocked` with `Gate` at `you`.
- [ ] Each shipped slice passed Verify, cleared its attributed findings, every plan step realized and nothing changed outside its `Regression surface`, with tests and build green, on one open draft pull request, `main` untouched.
- [ ] Each blocked slice names the stop-list condition that ended it, its verdict written `block`.
- [ ] Every handed-back lesson is in `docs/lessons.md` word for word, and every settled ambiguity is one log entry plus one Decided-for-you row.
- [ ] A replay against the same plan and `git` state starts the same slice first.

## Outputs & handoff

- `STATE.md` — the feature header's `state:` and `gate:`, each row's `State` and `Gate`, nothing else; tokens and shape: [`references/state-schema.md`](../../references/state-schema.md). A run ends with every row at `ship` or `blocked`, `Gate` at `you`, the header still `building` — `done` is the word a person writes on merging.
- `docs/session-log.md` — append only, one entry per decision, 60 words each; a reversal is a new entry naming the old, never an edit.
- `docs/lessons.md` — append only, 80 words each, carried word for word from the slice that wrote it.
- Every verdict the run carries or writes reads `pass · concerns · block`, where `block` is a stop-list item.
- The run report, in conversation rather than a file: what could not be settled first — per blocked slice the rung reached, what each rung tried, and the one thing a person has that the run did not — then each shipped slice's band, highest first.
- Measure each entry against its cap; report an over-cap one with its length rather than handing it on.
- Nothing else: no run-record file, no acceptance scenarios, no pull request body. Run `handoff` if context fills mid-run.
