---
name: acceptance-criteria
description: Draft acceptance.md in the Spec sitting — the Given/When/Then scenarios and definition of done for one feature, an id per behaviour across the happy, error/edge and security-observable classes. The look is the design reference's; grading a built slice against them, `quality-verification`'s.
---

# Acceptance criteria

## Purpose

**Stage: Spec.** Principles 1, 5, 6, 10.

Writes one feature's `acceptance.md`: what *works* means for it, as Given/When/Then prose, one id per
behaviour. The plan cuts slices against those ids, a test is written red off them, Verify grades the
running app by them. A behaviour absent from this file is a behaviour nothing checks, so completeness
is the job and wording is not.

## When to use / when to skip

- A feature has a `prd.md` — or an intent standing in for one — and nothing says what *done* means:
  inside the sitting, after `to-prd`, before `architecture-design` traces the ids.
- Someone reaches for "acceptance criteria", "definition of done", "test scenarios" or Given/When/Then.
- A behaviour that has to hold — an expiry, a refusal, an empty state, a failed save — has nothing
  anywhere that would catch its absence.
- Skip a pure refactor with no product-observable change; the scenarios already written cover it.
- A scenario becomes a failing test in `test-driven-development`, and grades a built slice in
  `quality-verification`.
- The look belongs to the design reference `prd.md` points at, whose named states Verify grades.

## Inputs

- `docs/features/<slug>/prd.md` — helps: its user stories are the ids scenarios back-reference; Problem
  and Solution frame the happy paths, Out of Scope draws the boundary · without it: read the behaviours
  off `intent.md` or the prompt, number them in place of stories, and mark the set `derived`
- `docs/features/<slug>/intent.md` — helps: Success and the Not-Doing list mark which behaviours are
  load-bearing · without it: take them from `prd.md`'s Problem, marked `derived`
- `CONTEXT.md` and `docs/adr/` — helps: the domain's own words, and no re-argued decision · without it:
  use the words the codebase uses
- the **design reference** `prd.md` points at — helps: its named states (empty · loading · error · a
  failed save) carry behaviour a PRD omits · without it: write those states from the stories and note
  that none exists

With a person there, ask at most three questions, where the answer changes which scenarios exist.

## Process

1. **Read `prd.md` end to end and list every story id first.** Problem and Solution frame the happy
   paths; Out of Scope is the boundary, and none of its items becomes a scenario — one that still needs
   a guarantee belongs here as an observable refusal.

2. **Enumerate the behaviours story by story across the three classes below** — what the user observes
   when it works, what they see when input or state is wrong, what the system has to refuse.

3. **Write each as Given/When/Then prose asserting an outcome someone can observe**, inside the
   boundary below.

4. **Id every scenario — PRD namespace, `A`, a number — then leave that id alone.** `qa.md`'s ledger and
   the PR's human-ack line cite ids, so a renumber re-points them at other behaviours; append under a
   new id.

5. **Write `status: draft` and hand the file on inside the sitting.** `architecture-design` traces each
   id while both are drafts, `spec-review` fixes the bundle code-cold, and the person signs all of it in
   one act — an agent writing `signed` forges the run's only human-anchored oracle.

6. **Measure and report** — `wc -w` against the 1,200-word cap. Over cap, cut wording and never a
   scenario, then report the overrun: a thinned list reads exactly like a full one.

7. **Change a scenario when the plan has moved, and disclose it where the person reviews.** Nothing is
   frozen: the before and the after go in the PR body and one `docs/session-log.md` entry
   ([`state-schema.md`](../../references/state-schema.md)), which `code-review` reads code-cold.

## The three required scenario classes

| Class | What it pins down |
|---|---|
| `happy` | the story's goal reached, as the user observes it |
| `error/edge` | invalid input, wrong state, a boundary, expiry, concurrency, an empty or limit case — what the user sees and what survives it |
| `security-observable` | a boundary holding where someone can watch it: an expired token refused, an unauthorized actor turned away, a secret absent from a response |

Every story id gets a scenario, the feature at least one `error/edge`, and any feature with a boundary
at least one `security-observable` — a one-story feature included.

## Behavioral-only boundary

- **No implementation** — a file path, a signature, a schema, a table or column name, a library
  internal — so a scenario survives a rewrite of the code beneath it.
- **No look** — colour, type, spacing, layout, motion, focus ring, pixel, breakpoint: the design
  reference holds those, and two oracles able to contradict each other are worse than one.
- **No engine** — prose only, no `.feature` file and no step definitions. `test-driven-development`
  realizes a scenario as a test by judgment.

## Rationalizations

- "The errors are obvious." → An unattended run ships its silent defects exactly where the failure
  looked too obvious to write down.
- "Naming the endpoint makes it precise." → A path or a signature in a scenario is an implementation
  mirror, stale the first time the code moves.
- "This one needs the pill's colour." → The design reference names that state, and Verify grades it
  there.
- "`.feature` files make it executable." → Executability comes from a test written red off the prose.
- "It reads right, so `signed`." → A signature is the person's act; the agent's own is a forged oracle.
- "Three of these stories are alike, so three scenarios covers it." → A story id no scenario names is a
  gate reading nothing.

## Red flags

- A scenario naming a file path, a signature, a table or a column.
- A scenario describing colour, spacing, motion or a focus ring.
- A `.feature` file or a step-definition file in the tree.
- A story id that no `realizes:` names.
- A feature with no `error/edge` scenario, or one with a boundary and no `security-observable`.
- `status: signed` on a file no person signed.

## Verification

- [ ] `docs/features/<slug>/acceptance.md` exists at `status: draft`, signed by no agent.
- [ ] Every story id — or every behaviour marked `derived` in its place — is named by a `realizes:`.
- [ ] Each scenario carries a unique namespaced id, a `realizes:` and a `class:`, and no earlier id moved.
- [ ] At least one `error/edge` scenario is present, and a `security-observable` one wherever the
      feature has a boundary.
- [ ] A grep finds no path, signature, schema, table or column name, library internal or design token,
      and no `.feature` file or step definition exists.
- [ ] The measured `wc -w` is reported against the 1,200-word cap.

## Outputs & handoff

`docs/features/<slug>/acceptance.md` — cap **1,200 words**, measured with `wc -w` and reported; an
over-cap draft is handed on as over-cap, never as one that fit.

```markdown
---
status: draft
---

### PWR-A2 — reset link rejected after expiry        realizes: story 3   class: error/edge
Given a password-reset link issued more than an hour ago
When the user opens it and submits a new password
Then the reset is refused and the user is told the link has expired
And the existing password still works
```

One `###` per scenario, ided with the feature's PRD namespace, then `A`, then a number — the namespace
the board gives that feature's slices. `class:` is one of `happy` · `error/edge` ·
`security-observable`; `realizes:` names the story id the scenario backs, or the behaviour standing in
for one, marked `derived` there. Change the id form, the `class:` vocabulary or the `status` field
and every reader that cites them changes in the same commit — `architecture-design`, `plan-breakdown`,
`test-driven-development`, `quality-verification`, `spec-review`, `orchestrator`, `pull-request`.

`docs/session-log.md` — one appended entry, cap 60 words, when a scenario changes after the bundle was
signed. No `STATE.md` row: a board block and its slices are born from a sliced plan
([`state-schema.md`](../../references/state-schema.md)).

Returns the path, the scenario count by class, the measured words against the cap, and every behaviour
marked `derived`. No verdict — it drafts the oracle the later gates grade against.
