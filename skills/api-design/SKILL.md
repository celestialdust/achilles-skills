---
name: api-design
description: Pin an interface contract before anything builds against it — typed input and output, one error envelope, what a consumer may depend on. Use it for a Spec variant, to land signatures in `plan.md`, or code-cold over a diff that moves a surface. Module internals stay with `codebase-design`, components and edges with `architecture-design`.
---

# API and Interface Design

## Purpose

**Stage: Spec · Plan.** Principles 1, 5, 6, 7, 8.

Pins the contract of a surface one piece of code offers another — endpoint, exported type, module
boundary, component props — before anything builds against it. It writes no artifact of its own; the
contract lands in the caller's file. The types are the documentation, so a surface pinned after its
implementation documents whatever that implementation happened to do.

## When to use / when to skip

- A surface something else calls is about to exist or change.
- The Spec sitting, as a variant for a load-bearing "what may a consumer depend on here" (`spec-grilling`).
- Plan, where two slices build against one surface and `plan-breakdown` needs its signatures and error
  envelope pinned first.
- Code-cold over a written `architecture.md` (`architecture-design`), or a diff moving a symbol, route or
  schema something outside it calls (`orchestrator`).
- A pure interface refactor by hand, the exported signatures and their callers as substrate.
- Skip — a module's internals and where its seam falls: `codebase-design`.
- Skip — which components exist and the edges between them: `architecture-design`.
- Skip — retiring a surface consumers still call: `deprecation-and-migration`.

## Inputs

- `docs/features/<slug>/research.md` — helps: `## Structural facts`, the seams and the conventions in use
  · without it: read the exported types and one caller, `derived`
- `docs/features/<slug>/prd.md` — helps: `## Solution` and `## Implementation Decisions` name the surfaces
  · without it: take them from `intent.md` or the prompt, `derived`
- `CONTEXT.md` — helps: `## Glossary` terms, used verbatim · without it: reuse the names the exported types
  already use, coining nothing, `derived`
- `docs/adr/` — helps: surface decisions already taken, cited by id · without it: treat this choice as new
- `docs/features/<slug>/architecture.md` — helps: the components this surface sits between · without it:
  `research.md`'s boundaries, `derived`

A present person is worth at most three questions, where the answer changes the surface's shape: the
resource model, the error envelope, the versioning posture.

## Process

[`references/surface-conventions.md`](references/surface-conventions.md) draws what this body only names:
the error body and status map, the naming table, the REST and pagination forms, the typed-interface patterns.

1. **Match the conventions already there, or say what the fork buys.** Read `## Structural facts` and one
   existing caller first: a second error envelope, pagination style or name for one thing is paid for by
   every consumer and invisible from inside the feature adding it.

2. **Write the contract before the implementation.** Input and output are separate types with
   server-generated fields absent from every input; variants are discriminated unions; ids are branded.

3. **One error strategy at every point on the surface** — the reference's structured body and status map,
   never a mix of throwing, `null` and `{ error }`, never two shapes from one endpoint by outcome.

4. **Validate at the boundary, trust the types inside it** — route handlers, form submissions, environment
   loading, and every third-party response, untrusted whatever its documentation promises.

5. **Paginate every list from the first version; extend rather than modify** — a new field arrives
   optional, an existing field's type holds, a field is not removed.

6. **Name every observable behaviour and mark which are committed** — ordering, error text, timing, a
   field's presence. Given enough consumers each is depended on whatever the contract promises (Hyrum's
   Law), so design the removal path while the surface is on paper (`deprecation-and-migration`).

7. **Hand a hard-to-reverse choice to the person** — REST against GraphQL, a public surface's shape, a
   versioning posture, the error envelope: name it ADR-worthy with the alternative and its cost, for the
   caller to record (`documentation-and-adrs`); reversible detail stays inline. With nobody there: the
   default, its reason, a log entry, a Decided-for-you row.

8. **Land the contract where the builder reads it cold** — a Spec variant carrying your recommendation, or
   `plan.md`'s `## File Structure` and step snippets, exact enough that `incremental-implementation` builds
   to the signature and `test-driven-development` asserts the observable behaviour.

9. **Grade a written surface code-cold, changing nothing**
   ([`safety-rails.md`](../../references/safety-rails.md)) — the interface lens over a surface somebody
   already wrote, its checks catalogued in
   [`lens-passes.md`](../architecture-design/references/lens-passes.md) · Sweep 2. Each finding is the fact
   plus a recommended answer the person can disagree with. By hand, close with `pass · concerns · block`
   (`block` a stop-list item); dispatched by `architecture-design`, hand back findings only — an empty list
   where you found none.

## Rationalizations

- "We'll document the API later" → the first consumer reads the implementation and depends on what it finds.
- "Pagination can wait" → the need arrives at a hundred items, by which time the contract has consumers.
- "PATCH is fiddly, take the whole object" → two clients that read, edit and send it all back lose one edit.
- "Nobody uses that undocumented behaviour" → if it is observable, somebody depends on it.
- "Two versions side by side is fine" → that is a diamond dependency for everyone downstream of both (the
  One-Version Rule).
- "Internal surfaces need no contract" → the contract is what lets two slices build in parallel.

## Red flags

- One endpoint returning different shapes depending on the outcome.
- Error formats that differ from one endpoint to the next.
- Validation between two internal functions that already share a type.
- A field whose type changed, or a field that went away.
- A list endpoint with no pagination.
- A verb in a REST path (`/api/createNote`), or a third-party response used unparsed.

## Verification

- [ ] Every surface in scope has a typed input, a typed output, and one shared error shape.
- [ ] Every list carries pagination, and every added field is optional.
- [ ] Names are `CONTEXT.md`'s verbatim where the term exists there, and the naming table's otherwise.
- [ ] The observable behaviours are listed, each marked committed or not.
- [ ] No decision contradicts an ADR; each hard-to-reverse one is cited by id or named ADR-worthy.
- [ ] Each decision settled with nobody to ask has a logged reason and a Decided-for-you row.
- [ ] The types ship in the same change as the implementation they describe.
- [ ] Every value reconstructed from a missing input is marked `derived` where written.
- [ ] A code-cold pass left every file as it was and closed as its caller reads it: `pass · concerns ·
      block` by hand, findings only — empty where there were none — when dispatched.

## Outputs & handoff

**No artifact of its own, and no `STATE.md` row.** The contract lands in the caller's file — `plan.md` for
`plan-breakdown`, a §6 row for `architecture-design`, a record for `spec-grilling` — so one fact has one
writer, and the caller owns the slice's transition
([`state-schema.md`](../../references/state-schema.md)).

**`docs/session-log.md`** — one appended entry per surface decision taken with nobody to ask, cap 60 words,
matching its Decided-for-you row ([`state-schema.md`](../../references/state-schema.md)). Report the
measured count against that cap; an over-cap entry is trimmed, not handed on.

**Returned in conversation** — the contract (typed signatures, error shape, resource and pagination forms),
the observable behaviours and which are committed, any decision named ADR-worthy with its alternative, and
what each `derived` input came from. Dispatched code-cold, the findings alone; by hand, those and the
verdict.

**When a published contract's shape changes**, its consumers move in the same change — the plan section,
the tests asserting it, the pull request's design anchor; the caller supersedes the promoted ADR by link
rather than deleting it (`documentation-and-adrs`), and re-reads every Decided-for-you decision citing the
moved section, confirming or reversing each one in the log.
