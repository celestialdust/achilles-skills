---
name: test-driven-development
description: Write the failing test before the code that passes it — one behaviour per test, named for the scenario id it realizes, red, then green, then refactored. Reach for it inside a slice's build and ahead of every bug fix. Not increment sequencing (`incremental-implementation`) or grading a built slice (`quality-verification`).
---

# Test-Driven Development (TDD)

## Purpose

**Stage: Implement.** Principles 1, 6, 7.

The test-first loop, one behaviour at a time inside a slice's build: red, green, refactor. It emits
tests and the minimal code passing them into the caller's checkout — the loop
`incremental-implementation` turns once per behaviour a slice owes.

## When to use / when to skip

- A slice's next behaviour, inside `incremental-implementation`'s increment loop.
- A bug fix — the reproducer first, so something proves the fix and catches its return
  (`debugging-and-error-recovery` root-causes; this writes the guard).
- A behaviour change, a refactor of code with tests to hold it still, or a hand call — a scenario, a
  ticket, "make it do X" in a repository with no scaffolding.
- Skip a throwaway prototype, generated code and configuration — none has behaviour to pin. "Too simple
  to test" is not on that list.
- Not sequencing the increments (`incremental-implementation` owns the loop this drives one turn of), nor
  re-cutting slices (`plan-breakdown`), nor grading what was built — `quality-verification` exercises the
  scenarios cold against the running app.

## Inputs

- `docs/features/<slug>/acceptance.md` — helps: the Given/When/Then scenarios and the feature-namespaced
  ids your test names carry · without it: take the behaviours from `prd.md`, the prompt and the code,
  give each a local id, `derived`
- `docs/features/<slug>/plan/<slice-id>.md` — helps: the behaviours this slice owes and the files holding
  them · without it: the slice row in `plan.md`, or infer it from the files the work reaches, `derived`
- the test framework and runner command — helps: red and green are real runs · without it: read
  `package.json`, the tests already there or the CI config, and name the command you chose, `derived`
- the caller's checkout or worktree — helps: tests and code land where the slice's commits are · without
  it: work in the repository and touch no board row

With a person present, ask at most three questions, and only where the gap changes which behaviours get
tested rather than how one is worded.

## Process

1. **One behaviour, one test, named for the scenario id it realizes** — `PWR-A3: retries a failed save
   three times`. Realize the Given/When/Then by judgment in the project's own framework; there is no
   step-definition engine here. A name carrying "and" is two tests. The id is what lets
   `quality-verification` key its ledger by behaviour.

2. **Write it before the code it judges, and delete the production code you wrote for this behaviour
   ahead of its own test** — code kept as reference, or adapted while the test is written, shapes
   that test around its own blind spots. Explore freely, then throw the exploration away and start
   from the test.

3. **Run it and watch it fail for the reason you predicted.** A test that errors is broken rather than
   red: re-run until the failure message is the missing behaviour itself. One passing first time is
   describing something that already worked.

4. **Write the simplest code that turns it green** — no options, no configuration, no second caller's
   needs. Assert on what the code does, never on what a mock was called with; a test needing everything
   mocked says the interface is too coupled, so inject the dependency or move the seam. Load
   [`references/testing-anti-patterns.md`](references/testing-anti-patterns.md) when adding a mock, a
   fixture or a test utility.

5. **Run it again and read the whole output** — this test green, every other still green, no warnings,
   no stray errors. Fix the code rather than the test: a relaxed assertion buys one green run and spends
   the only evidence downstream has.

6. **Refactor under green** — duplication out, names better, helpers extracted, no behaviour added; re-run
   before moving on.

7. **Repeat until the slice's list is spent**, covering error and edge paths as well as the happy one and
   giving every new function or method a test. Record a scenario whose Given this slice cannot construct
   as `not-reachable` with its reason and carry past it — nothing stopped being checked, so it ends no
   slice.

8. **Change a test the plan moved past rather than test a stale thing** — nothing here is frozen. Its
   before, its after and the reason go to the pull request and one `docs/session-log.md` entry, where the
   code-cold review meets the change inside the diff (`pull-request` shapes it). Only the stop list
   ([`safety-rails.md`](../../references/safety-rails.md)) ends a slice; the rest is a default with a
   reason, a log line and a Decided-for-you row.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll write the tests straight after" | A test written after its code passes first run, having shown nothing about what it catches. |
| "It's already written — keep it as reference" | A test shaped around existing code inherits that code's blind spots. Adapting is testing after, renamed. |
| "The feature works, the assertion is a bit off" | Then the code is wrong — or the plan moved and the test is stale, which travels in the PR body, not into the assertion. |
| "Mocking everything keeps it fast and isolated" | A test asserting on mock calls stays green when the product breaks and red on a correct refactor. |
| "This scenario can't be built yet, so drop it" | `not-reachable` by id leaves it in the contract, unproven and visible; removing it stops something being checked. |

## Red flags

- Production code in the diff that no test was ever red against.
- A new test that passed on its first run.
- An assertion counting mock calls where the returned value or stored row was there to assert on.
- A test loosened, skipped or deleted to reach green, with nothing in the PR body saying so.
- A test name carrying "and", or naming no scenario id where a contract supplies them.
- Green reported with no runner output behind it.

## Verification

- [ ] Every behaviour this slice owes has a test that failed first for the reason predicted, passes now,
  and carries its scenario id.
- [ ] Every new function or method has a test; error and edge paths are covered too.
- [ ] The suite is green and the output pristine — no warnings, no stray errors, nothing quietly skipped.
- [ ] Scenarios this slice could not construct are handed back `not-reachable` by id, with their reasons.
- [ ] Any changed test is handed back with its before, its after and why the plan moved.
- [ ] Every derived input is marked `derived` where written or handed back.

## Outputs & handoff

- **Tests and the code passing them, in the caller's checkout** — each named for its scenario id, each
  watched red before its production code existed, scoped to the files the caller named. Both ride the
  caller's commits; this pass opens no artifact of its own.
- **`docs/session-log.md`** — one appended entry, cap 60 words, where this pass changed a test or settled
  something itself; shape in [`state-schema.md`](../../references/state-schema.md). Where no such file
  exists, hand the entry back rather than create one — `project-setup` owns that.
- **No `STATE.md` row and no gate flip** — the caller owns the slice's transition
  ([`state-schema.md`](../../references/state-schema.md)).
- **Returned in conversation** — the red and green commands with their real output, the scenario ids
  proved, the `not-reachable` ids with reasons, the before/after of any changed test, and the log entry's
  measured size against its cap — an over-cap entry reported at that size, never handed on as if it fit.
