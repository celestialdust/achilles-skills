---
name: incremental-implementation
description: Build one assigned slice as thin, individually-tested increments — lessons first, skeleton first (stub, mock, wire, fill), test-first — the moment a planned slice's code is about to be written. Not for cutting slices (plan-breakdown), unattended plan runs (orchestrator), or grading what was built (quality-verification).
---

# Incremental Implementation

## Purpose

**Stage: Implement.** Principles 1, 6, 7.

Builds one assigned slice as thin vertical increments, each tested and committed atomically before the next,
and reports the commands it ran with their real output. A feature landed in one
pass leaves nothing runnable to debug from until the last line.

## When to use / when to skip

- One slice is assigned and its first line of code is about to be written.
- The pull arrives to write past ~100 lines untested, land a feature in one pass, or tidy a file the slice does not name.
- A hand call in an unscaffolded repository — derive what is missing and build anyway.
- Not cutting slices: `plan-breakdown` owns the plan; this pass re-opens none of it.
- Not running a plan unattended: `orchestrator` hands over one slice at a time.
- Not grading the result: `quality-verification` does that cold, against `acceptance.md`.

## Inputs

- `docs/features/<slug>/plan.md` and `plan/<slice-id>.md` — helps: the slice row, its blockers and owned surface, this slice's steps and checkpoint · without it: cut increments from `prd.md` and the code
- `docs/features/<slug>/acceptance.md` — helps: the scenario ids this slice turns green · without it: read them off `prd.md` and the prompt
- `docs/features/<slug>/prd.md` and the design reference it points at — helps: product intent, a UI slice's named states · without it: build behaviour alone, design gate `not-reachable`
- `docs/lessons.md` — helps: defects near this area, each naming its guard · without it: carry on, creating no record
- the worktree handed at dispatch — helps: isolation, so two slices share no file · without it: a hand call — work in the repository, writing no board row and no worktree of your own (`worktree` owns that)

Derive what is absent and mark it `derived`; with a person there, ask at most three questions, only where the gap changes the slice's shape.

## The Increment Cycle

Steps 1 and 7–9 run once per slice; 2–6 are the increment loop.

1. **Read `docs/lessons.md` before the first stub** for entries near this area; on a UI slice, open the design reference with its named states; on a retry, read what the last attempt ran and got back off `qa.md`, and off the pull request body once one is open. Read after and it buys a rewrite instead of a choice.
2. **Implement the smallest complete piece** — take the slicing strategy below (skeleton first unless a shared interface or an uncertain boundary makes contract- or risk-first the opening increment); the failing test first, watched fail (`test-driven-development`), then the code that greens it; ground a framework or library choice in fetched official docs (`source-driven-development`). Stop at ~100 lines untested.
3. **Test** — suite, build, type check and lint after a change that could move one, skipping a command whose code has not changed since it passed.
4. **Verify against a checkpoint that is an observable fact** — "the failed save shows the inline error", never "it compiles".
5. **Commit** in the shape `git-workflow` states, then carry forward rather than restart — back to step 2 until the slice's checkpoint is green.
6. **Root-cause a break rather than patch the symptom** (`debugging-and-error-recovery`) — no `--no-verify`, no skipped check, no loosened assertion. A test the plan has moved past may change: its before, after and reason go to the code-cold review. A checkpoint still red after root-causing climbs the repair ladder ([`safety-rails.md`](../../references/safety-rails.md)), bounded by `orchestrator`'s three implement→verify→review cycles; a spent ladder is a stop-list item, reported with the rung that failed.
7. **Decide the small things and leave a trace** — a default, its reason, the build, one `docs/session-log.md` entry, a Decided-for-you row for the pull request. Only the stop list ([`safety-rails.md`](../../references/safety-rails.md)) ends a slice.
8. **Carry out any lesson this slice owes** — the `docs/lessons.md` entry `debugging-and-error-recovery` authors for a root-caused defect: carry it out unopened, named as still owed, since an append inside the worktree reaches no reader.
9. **Hand over on a green checkpoint** — `impl → verify`, gate `agent`, written by the run ([`state-schema.md`](../../references/state-schema.md)); on a hand call, return the transition for the caller.

## Slicing Strategies

- **Skeleton first** — stub every layer so the whole path runs, mock at the real boundaries, wire one boundary at a time, then fill the edge cases and error paths.
- **Contract first** — where two sides advance together, pin the interface as its own increment.
- **Risk first** — prove the uncertain boundary before anything rests on it.

## Implementation Rules

- **The simplest thing that could work** — three similar lines beat an abstraction no third caller asked for. Re-read the result: fewer lines, abstractions that earn their complexity, no "why didn't you just", nothing built for a requirement nobody has yet.
- **Scope discipline** — touch the slice's `Files (owned)` and nothing beside it; the diff stays inside its `Regression surface`, and widening either is a Decided-for-you row, not a quiet edit. An adjacent improvement leaves as a note; a subagent handed an increment gets that boundary out loud.
- **One logical thing per increment** — a commit doing three things hides all three.
- **Green between increments** — the project builds and the existing tests pass at every checkpoint.
- **Revertable alone** — conservative defaults, an unfinished feature behind an off-by-default flag, a delete and its replacement in two commits.
- **~400 lines is the ceiling** — past it the slice was mis-sliced: shrink it, a rung of the ladder, rather than stretch it.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll test it all at the end" | A defect in increment one makes the next four wrong, and 500 changed lines hide which. |
| "This refactor is small enough to include" | A mixed diff resists review and bisect, and the file may belong to another slice. |
| "The assertion is too strict, I'll relax it" | It then proves nothing it used to; a test the plan moved past changes visibly, in the diff. |
| "Nobody is around, so this call has to wait" | A default with a stated reason, logged and shown as a Decided-for-you row, is the call. |
| "The lesson is written and the fix committed" | Nothing reads a worktree for lessons; unnamed on the way out, the entry is gone. |

## Red flags

- More than ~100 lines written with no test run behind them.
- A skeleton written without `docs/lessons.md` open, or UI built against a design reference nobody opened.
- One commit that adds a feature, refactors a neighbour and moves the config.
- A file in the diff the slice's plan file does not name.
- A green suite bought with a loosened assertion, a skipped check, or `--no-verify`.
- A `docs/lessons.md` entry appended inside the worktree, or carried out unnamed.

## Verification

- [ ] Every increment is committed with the test that proves it, each test seen red first.
- [ ] The suite is green, build and type check clean, nothing left uncommitted.
- [ ] The checkpoint was exercised and reported as the fact it names.
- [ ] The diff sits inside the slice's `Files (owned)` and `Regression surface`, or a widening is a Decided-for-you row.
- [ ] Every derived input is marked `derived` where it was written or handed back.
- [ ] Commands are reported with their real output; one not run is named with its reason.
- [ ] The finished slice clears [`definition-of-done.md`](../../references/definition-of-done.md).

## Outputs & handoff

- **Code and tests on the slice's branch** — atomic, individually-tested commits, one logical change each. This is the diff `quality-verification` grades cold.
- **`docs/session-log.md`** — one entry per decided-for-you call, at most 60 words, shaped as [`state-schema.md`](../../references/state-schema.md) states.
- **`STATE.md`** — this slice's `State` and `Gate` cells, inside a run only; a hand call writes no row.
- **Returned in conversation** — the commands and their real output for the pull request's Evidence, the Decided-for-you rows, any changed test's before and after, the design gate's `not-reachable` reason, and any `docs/lessons.md` entry still owed.

Report each write's measured size against its cap; an over-cap draft is reported at that size, not handed on as if it fit.
