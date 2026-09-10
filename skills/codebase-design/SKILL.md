---
name: codebase-design
description: Shape a module before the code exists — a lot of behaviour behind a small interface, at a seam something actually varies across. Use it for a Spec variant, to land a module's contract in `plan.md`, on a split-or-merge refactor, or code-cold over a written structure. Consumer-facing surfaces stay with `api-design`, components and edges with `architecture-design`.
---

# Codebase and module design

## Purpose

**Stage: Spec · Plan.** Principles 1, 5, 6, 7, 8.

Shapes a **deep module** — a lot of behaviour behind a small interface, at a seam something actually varies
across, testable through that interface. Depth buys leverage for callers and locality for maintainers. The
Glossary is half the method: two people saying "boundary" agree to different things. It owns no artifact.

## When to use / when to skip

- A module is about to exist or change shape — planned, merged out of shallow ones, split for a second
  reason to change, or about to be built against.
- The Spec sitting, as a variant for a load-bearing structural question — what earns its existence, what
  has to be swappable, where the seam falls (`spec-grilling`).
- Plan, where `plan-breakdown` needs the interface pinned before a slice builds to it.
- Code-cold over a written `architecture.md` (`architecture-design`), or by hand on a refactor.
- Skip — what a consumer may depend on, the error envelope, pagination: `api-design`.
- Skip — which components exist and the edges between them: `architecture-design`.
- Skip — code that reads heavy but keeps its seam: `code-simplification`.
- Skip — nothing to shape: a config change, a data migration, glue.

## Inputs

- The candidate — helps: the module to shape and what it calls, so each dependency can be classified ·
  without it: name one from the prompt and the code in front of you, marked `derived`
- `docs/features/<slug>/research.md` — helps: `## Structural facts` has the seams, their adapter counts,
  the conventions in use · without it: read the candidate's imports and one caller, marked `derived`
- `CONTEXT.md` — helps: the `## Glossary` terms this module is named from, verbatim · without it: reuse
  the names the code uses, coining nothing, marked `derived`
- `docs/adr/` — helps: boundary decisions already taken, cited by id and built to · without it: treat this
  one as new, ADR-worthy if hard to reverse
- `docs/features/<slug>/prd.md` — helps: `## Solution` and `## Implementation Decisions` say what sits
  behind the seam · without it: take it from `intent.md`, marked `derived`

A present person is worth at most three questions, where the answer changes the module's shape: what
varies across the seam, which caller the interface is for, what may never be exposed.

## Process

[`references/seams-and-adapters.md`](references/seams-and-adapters.md) has the four dependency categories
and how a module is tested across each; [`references/design-it-twice.md`](references/design-it-twice.md)
has the variant fan-out.

1. **Name the structure in this file's Glossary terms and the domain in `CONTEXT.md`'s `## Glossary`
   verbatim, coining nothing** — no component, service, API or boundary. The interface is everything a
   caller must know, as the Glossary's Interface row lists it.

2. **Apply the deletion test and record what reappears.** Delete the module on paper: vanishing complexity
   was a pass-through, so do not build it; reappearing complexity is written down with the callers it lands
   on, since "it earns its keep" alone is a preference.

3. **Push for depth at the interface, not the implementation.** Cut methods, simplify parameters, move
   more behind the seam. An interface nearly as complex as what it hides is shallow at any size.

4. **Place the seam, then classify each dependency** — in-process, local-substitutable, remote-but-owned,
   true-external — since the category decides how it is tested across that seam. Two justified adapters,
   production and test, earn a port; one is indirection.

5. **Design a load-bearing interface more than once.** Where the shape is hard to reverse, produce
   genuinely different interfaces under different constraints, compare them on depth, locality and seam
   placement, and close with a recommendation or a hybrid — never a menu.

6. **Keep the interface the test surface, and cheap to test through.** A test asserting observable
   outcomes through the seam survives a refactor behind it; one reaching into internal state says the
   module is the wrong shape — move the seam rather than widen the interface for a test. Take dependencies
   rather than construct them; return results rather than mutate.

7. **Hand a hard-to-reverse boundary over rather than settling it.** All three of hard-to-reverse,
   surprising and a real trade-off: name it ADR-worthy with its alternative and its cost, for the caller
   to record (`documentation-and-adrs`); reversible detail stays inline. With nobody there — the default,
   its reason, one log entry, one Decided-for-you row.

8. **Land the contract where the builder reads it cold** — a Spec variant carrying your recommendation,
   or `plan.md`'s `## File Structure` and the owning slice's `plan/<slice-id>.md` step snippet
   (`plan-breakdown` owns both), exact enough that `incremental-implementation` builds to it and
   `test-driven-development` asserts through it.

9. **Grade a written structure code-cold, editing nothing**
   ([`safety-rails.md`](../../references/safety-rails.md)) — the deletion test and one-reason-to-change
   applied to a structure somebody already wrote, its checks catalogued in
   [`lens-passes.md`](../architecture-design/references/lens-passes.md). Each finding is a fact plus a
   recommended answer. By hand, close with `pass · concerns · block` (`block` a stop-list item);
   dispatched by `architecture-design`, hand back findings only — an empty list where you found none.

## Glossary

| Term | What it means here | Not |
|---|---|---|
| **Module** | anything with an interface and an implementation — a function, a package, a tier-spanning slice | unit, component, service |
| **Interface** | everything a caller must know: signature, invariants, ordering, error modes, required configuration, performance | API, signature — both stop at the type |
| **Implementation** | what sits inside; a small adapter can hold a large one | internals, guts |
| **Seam** | where behaviour can be altered without editing in that place; where an interface lives (Feathers) | boundary — DDD has it |
| **Adapter** | a concrete thing satisfying an interface at a seam — a role, not a substance | implementation, driver |
| **Depth** | behaviour a caller or a test reaches per unit of interface it has to learn | implementation lines ÷ interface lines, which rewards padding |
| **Leverage** | what callers get — one implementation paying back across N call sites and M tests | reuse |
| **Locality** | what maintainers get — change, bugs and verification in one place | cohesion |

## Rationalizations

- "I'll design the interface once the code exists" → by then the tests already cross the wrong seam.
- "Add the port now, we might need a second adapter later" → one adapter is a hypothetical seam, and
  every reader pays a hop for it.
- "Small module, depth doesn't matter" → depth is leverage per unit of interface, independent of size.
- "The tests need to see inside" → a test past the interface pins the implementation in place.
- "Fine to leave this boundary in plan prose" → a decision nobody was shown is one nobody agreed to.
- "Component, service, boundary — same thing" → inconsistent vocabulary is the failure this skill prevents.

## Red flags

- A test reaching into internal state, or an interface widened to let one in.
- An interface nearly as complex as the implementation behind it.
- A port or seam with one adapter and no second one named.
- Depth argued as implementation lines over interface lines.
- A hard-to-reverse boundary sitting only in `plan.md` prose.
- A deletion-test answer that is a verdict, not the complexity that reappears.

## Verification

- [ ] The module is named in this file's Glossary terms and the domain in `CONTEXT.md`'s, verbatim.
- [ ] The interface is written where Process 8 lands it — `plan.md`'s `## File Structure`, the owning
      slice's `plan/<slice-id>.md`, or the Spec variant — as the full contract, not a type signature alone.
- [ ] Every candidate has a deletion-test answer on record: what reappears, across which callers.
- [ ] Every seam has two justified adapters or the port is gone; each dependency is named by category
      and the testing approach across that seam is stated.
- [ ] The tests named for the module assert through its interface, and none reaches past it.
- [ ] Each hard-to-reverse boundary is cited by ADR id, named ADR-worthy with its alternative, or settled
      with a logged reason and a Decided-for-you row.
- [ ] Every value reconstructed from a missing input is marked `derived` where written.
- [ ] A code-cold pass left every file as it was and closed as its caller reads it: `pass · concerns ·
      block` by hand, findings only — empty where there were none — when dispatched.

## Outputs & handoff

**No artifact of its own, and no `STATE.md` row.** The interface lands in the caller's file —
`plan.md`'s `## File Structure` or the owning slice's `plan/<slice-id>.md` step snippet, a §6 finding for
`architecture-design`, a record for `spec-grilling` — so one fact keeps one writer and the caller owns the
transition ([`state-schema.md`](../../references/state-schema.md)). When the shape changes its referrers
move in the same change — the plan section, the tests asserting through the interface, the ADR (superseded
by link) — and every Decided-for-you row citing that section is confirmed or reversed, logged.

**`docs/session-log.md`** — one appended entry per boundary settled alone, cap 60 words, matching its
Decided-for-you row ([`state-schema.md`](../../references/state-schema.md)). Report the measured length
against that cap; an over-cap entry is trimmed, not handed on.

**Returned in conversation** — the module and its full interface, the deletion-test answer, the seam with
each dependency's category and its adapters, any boundary named ADR-worthy with its alternative, and what
each `derived` input came from. Dispatched code-cold, the findings alone; by hand, those and the verdict.
