# Test contract

Scenarios this repository must never lose. Not one feature's behavior — the behavior that outlives every
feature that touches it. "A password-reset link expires after an hour" belongs to the password-reset
feature. "No response ever contains a password hash" belongs here.

The file starts empty, and an empty one costs nothing. Every rule below is a no-op until the first ACTIVE
row exists. A repo that never adds a row is exactly as it was; a repo that adds rows gets a guarantee no
run can trade away.

## The two states

Every row is **PENDING** or **ACTIVE**.

- **PENDING** — written down so it is not forgotten. Nothing enforces it. Work may fail against a PENDING
  row and nothing stops.
- **ACTIVE** — permanent. It may never be skipped, weakened, or narrowed. Not by a slice, not by a retry,
  not by any run, ever.

**Activation is a human act, and it is one-way.** A person moves a row PENDING → ACTIVE when they decide
the behavior is permanent. Nothing moves it back. The agent never moves a row in either direction — it
reads this file and does not edit it.

The one-way rule is the whole point. A guarantee the agent can switch off is not a guarantee; under
retry pressure, switching it off is always the cheapest way to make a failing gate green. Taking that
move away is what makes an ACTIVE row worth writing.

If an ACTIVE row turns out to be wrong, that is real and worth fixing — as a decision a person makes and
records outside any run, the same way a signed contract changes.

## How to add a row

1. Write the scenario as Given/When/Then prose in a `### TC-<n>` block under `## Rows`, taking the next
   free number. "Row format" below shows the shape.
2. Set `state: PENDING`. That is where every row starts, including one you are certain about.
3. When a person decides it is permanent, they change `state:` to `ACTIVE` and record who activated it and
   when. That line is the record of the human act; without it the row is not activated.

Write **observable outcomes only** — what a user, a caller, or an attacker can see. No file paths, no
function signatures, no table or column names, no library names, no design tokens. A row that names a file
path dies at the first refactor, and this row is meant to outlive every refactor. This is the same
behavioral-only discipline `acceptance.md` keeps.

Keep ids stable once written. Append new rows with new ids rather than renumbering — a halt names a row by
id, and a renumbered id points at the wrong guarantee.

## Row format

**Only rows under `## Rows` are rows.** Nothing outside that section binds anything, including the shape
below. Enforcement reads that section and no other.

```
### TC-1 — a password hash never reaches a client        state: PENDING
Given any request to any endpoint that returns account data
When the response is returned to the caller
Then it contains no password hash, no session key, and no API secret
```

An activated row is the same block with `state: ACTIVE` and one more field on that line —
`activated: <date> by <person>`. That field is the record of the human act; a row marked ACTIVE without it
was not activated by anyone, and is treated as PENDING until a person adds their name.

**Verify checks the stamp.** `quality-verification` reads this file every run. A row marked ACTIVE with no
stamp is not graded and never fails a slice, and it is reported in that slice's `qa.md` by row id, which
carries it to a person as an acknowledgement line in the pull request. Reporting is the point: an unstamped
row reads like a permanent guarantee and binds nothing, so someone has to be told. Deleting or editing a
stamp is not a way around a real ACTIVE row — that is editing the row's state, which stops the slice.

## Rows

<!-- Add rows here. Every row starts PENDING; only a person flips one to ACTIVE, and nothing flips it back. -->

_None yet._

## Boundary with `acceptance.md`

Two files hold scenarios, and they must never be able to contradict each other. One home each:

| file | holds | lifetime |
|---|---|---|
| `docs/test-contract.md` | cross-feature scenarios that hold for the whole repo | forever, once ACTIVE |
| `docs/features/<slug>/acceptance.md` | one feature's behavioral scenarios | re-signed when that feature's `prd.md` moves |

A scenario belongs in exactly one of them. The test is lifetime, not importance: if the scenario dies when
the feature is deleted, it is a feature scenario; if it still has to hold afterwards, it belongs here.

That difference in lifetime is why the contract cannot simply live inside `acceptance.md`. An
`acceptance.md` is re-signed whenever its `prd.md` moves, so a permanent guarantee parked there is one
product-spec edit away from being renegotiated. This mirrors the boundary `acceptance.md` already keeps
against a UI feature's design contract: two signed artifacts, neither able to contradict the other,
because each owns its content outright.

If a feature's scenario would contradict an ACTIVE row, the ACTIVE row wins and the feature scenario is
wrong. Settle that at Spec, before any run starts.

## When an ACTIVE row is touched

Skipping, deleting, weakening, or narrowing an ACTIVE row to make a gate pass **stops the slice**. It
halts and does not advance toward review, and the halt **names the row id that changed**. Naming it is the
requirement, not a courtesy: "gate erosion" alone tells nobody which guarantee was about to be traded
away, and the person reading the halt cannot check whether the trade was reasonable.

This ends one slice, not the whole run; the other slices keep going.

**The next move is a person's, on that slice.** The halted slice's `gate` flips from the agent to you, and
nothing further is attempted on it. Read the named row, decide whether the guarantee or the code is wrong,
and settle it outside any run — the agent will not pick this slice back up on its own.

This freeze is stronger than the one on a slice's own oracles. `acceptance.md`, the failing tests written
before the code, and a slice's declared **regression surface** — the existing behavior that slice said it
must not break — are frozen **for that slice's retry loop**: they can change between runs, by a Spec change
a person signs. An ACTIVE row is frozen **permanently, in every run**. There is no retry loop it thaws
after.

**Reporting a scenario unreachable is not weakening it.** A slice that cannot construct a row's Given —
because the state depends on work that does not exist yet — reports it as not reachable. The row stays
ACTIVE, unproven, and goes to a person through the required acknowledgement line in the pull request.
Nothing stopped being checked, so nothing halts. The test is whether the scenario survives the act: still
in the contract with a person named → honest reporting; gone from the contract, or rewritten to assert
less → the stop above.
