---
name: to-prd
description: 'Synthesize the grilled intent + design substrate into a product-altitude prd.md — NO interview, just synthesis of what you already discussed. Reach for this the moment intent.md is pinned and the ADRs are written and you need the dual-audience product spec the whole pipeline reads. STAY at product altitude: reference ADRs by id, use CONTEXT.md terms verbatim, and NEVER paste a file path, signature, or schema into the PRD.'
---

## Purpose

**Stage: Spec (human-led).** Every downstream stage reads `prd.md`: `acceptance-criteria` turns its user stories
into Given/When/Then, `frontend-design` builds against it, `plan-breakdown` decomposes its decisions into
slices, and `pull-request` anchors its summary back to it. So the PRD must be *one document, two audiences* — the
product reader (Problem · Solution · User Stories) and the dev reader (Implementation · Testing · Out of
Scope) — written at a single altitude: **what** and **interface**, never **how** and **implementation**.

It exists because the thinking is already done. By the time you reach here, `interview-me`/`idea-refine`
have pinned `intent.md` and `spec-grilling` has written the ADRs + CONTEXT.md. The PRD does not re-decide
anything; it *synthesizes* the decided into the shape the chain consumes. That is why it does **not**
interview — interviewing here means the upstream stages were skipped.

## When to use / when to skip

**Use** when intent is grilled, the design substrate (ADRs/CONTEXT.md) exists, and you need the product
spec the rest of the pipeline reads. Typically the last authored artifact of Spec before `acceptance-criteria`.

**Skip / don't** when:
- intent is *not* yet pinned and the design is *not* yet grilled → run `interview-me` / `spec-grilling`
  first. This skill synthesizes; it has nothing to synthesize from raw idea + no ADRs.
- you feel the urge to ask the user a clarifying question → that is the signal an upstream stage was
  skipped, not a signal to interview here. Escape hatch: stop, name the missing input, send the user back
  to the upstream skill.
- the change is a pure refactor with no product-observable behavior → there is no PRD to write.

User-invoked: a human opens this during the human-led Spec stage. (No `disable-model-invocation` key —
the house format is two-key; this section carries the triggering nuance instead.)

## Inputs

Refuse-to-run unless these are resolvable:

- **REQUIRED — `docs/features/<slug>/intent.md`** (the WHAT, from `interview-me`/`idea-refine`): sections
  Outcome · User · Why · Success · Constraints · Out-of-scope. If absent **and** no grilled intent exists
  in the conversation, **STOP** — there is nothing to synthesize and this skill does not interview.
- **REQUIRED substrate — `CONTEXT.md`** (repo-root glossary; its `## Glossary` section): you will use its terms *verbatim*.
- **REQUIRED substrate — `docs/adr/ADR-<NNN>-*.md`** (from `spec-grilling`): the mechanism rationale you
  will **reference by id**, never restate. (If the feature legitimately needed no ADRs, that is fine — but
  any product decision whose *why* is technical must point at an ADR that exists.)

If `STATE.md` / `CONTEXT.md` / `docs/adr/` / `docs/features/` do not exist, the repo was never set up →
run `project-setup` first.

## Process

1. **Read, don't re-derive.** Read `intent.md`, skim the relevant `docs/adr/*`, and load `CONTEXT.md`'s
   `## Glossary` section. Explore the repo only enough to ground the product framing (current behavior the user lives
   with). Do **not** open the codebase to harvest file paths or signatures — those never enter the PRD.

2. **Sketch the testing seams — at product altitude.** Name the *behavioral boundaries* at which the
   feature will be proven (the public HTTP surface, a module's public interface, a CLI command's
   contract). Prefer existing seams to new ones; use the **highest** seam possible — the fewer seams, the
   better (ideal: one). Express them as *interfaces/behaviors*, never as file paths or function signatures.
   Check with the user that these seams match their expectations (Spec is human-led).

3. **Write `prd.md` from the template below**, save it to `docs/features/<slug>/prd.md`, and update
   STATE.md (see Outputs). Do **not** publish to any external issue tracker — the local STATE.md board is
   the tracker, and the `gate` column carries the hand-off that mp's `ready-for-agent` label used to.

## PRD template

Use exactly these six stable section headers (downstream consumers depend on the names), `## Further
Notes` optional at the end.

```
## Problem

The problem the user is facing, from the user's perspective. Use CONTEXT.md terms verbatim.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories, each in the format:

1. As an <actor>, I want a <feature>, so that <benefit>

Example:
1. As a mobile bank customer, I want to see the balance on my accounts, so that I can make better
   informed decisions about my spending.

This list must be extensive and cover every aspect of the feature.

## Implementation Decisions

The product-altitude decisions that were made — the WHAT and the interface, not the HOW:

- Which modules/capabilities will be built or modified (by name, not path)
- The product-observable behavior of those modules
- Technical clarifications from the developer (at decision altitude)
- Schema *intent* and API *contract* described in prose
- Specific user-facing interactions

State product decisions plainly ("email is the reset channel"; "tokens expire in 1 hour"). For the
*reasoning* behind a decision, REFERENCE the ADR by id ("see ADR-007"), never restate it. If a decision
is encoded by a committed prototype, reference the prototype ("as committed in the frontend-design
prototype") — do not inline its code.

HARD BOUNDARY: this section — and the whole PRD — must NOT contain file paths, function/type
signatures, schemas-as-code, or driver/library internals. Those live in ADRs, the prototype, and later in
plan.md. The PRD is the narrow, stable interface; the design is the deep hidden body.

## Testing Decisions

- What makes a good test here: only test external/observable behavior, never implementation details.
- Which modules/behaviors will be tested (the seams from Process step 2).
- Prior art: similar kinds of tests already in the codebase (by description, not path).

## Out of Scope

What is explicitly NOT being built in this PRD.

## Further Notes  (optional)

Anything else worth recording at product altitude.
```

## Rationalizations

Stop signals disguised as good reasons:

- "Let me just ask the user one quick question." → No. If you need to ask, an upstream stage was skipped.
  Synthesize from `intent.md` + ADRs, or send the user back upstream. This skill never interviews.
- "Pasting the handler signature / the file path will help the dev." → No. That's structurally
  illegal in `prd.md`; it goes stale and turns the narrow interface into a shallow module. Reference the
  ADR/prototype instead.
- "Let me re-explain *why* we chose email, the ADR is terse." → No. Restating ADR rationale duplicates a
  piece of knowledge that can diverge (DRY-of-knowledge). Link it: "see ADR-007".
- "CONTEXT.md calls it a 'reset token' but 'recovery code' reads nicer." → No. Use the glossary term
  verbatim; divergent vocabulary is how the chain drifts.
- "The user-story list is long enough." → mp's strength is an *exhaustive* list. Thin coverage here means
  `acceptance-criteria` cannot enumerate scenarios. Keep going.

## Red flags

Stop and fix before saving if any are true:

- The PRD contains a `/` path segment, a `function`/`def`/type signature, a code-fenced schema, or a
  library-internal name. → Strip it; reference the ADR/prototype.
- A `see ADR-NNN` points at a file that does not exist in `docs/adr/`.
- You asked the user a clarifying question to write a *decision* (vs. to confirm a seam).
- A domain term in the PRD does not appear verbatim in `CONTEXT.md`.
- You wrote design rationale (the *why* behind a mechanism) into the PRD instead of linking the ADR.

## Verification (ending criteria)

Done when ALL hold:

- `docs/features/<slug>/prd.md` exists with all six stable headers present, in order.
- **grep gate is clean:** `grep -nE '(\b[a-zA-Z0-9_]+/[a-zA-Z0-9_]+|\.ts\b|\.py\b|\.tsx\b|function |def |=> |: [A-Z][a-zA-Z]+<)' docs/features/<slug>/prd.md` returns nothing (no paths/signatures/types).
- Every `ADR-<NNN>` referenced resolves to a file in `docs/adr/`.
- Every domain term used appears verbatim in `CONTEXT.md`.
- The User Stories list is extensive and every entry is in `As an <actor>, I want <feature>, so that
  <benefit>` form.
- No clarifying question was asked to make a decision (synthesis-only).
- The Spec **gate stays `you`** — to-prd does not sign the PRD; the human signs it at the Spec gate.
  (`spec-review` re-runs the grep gate + ADR-link check before the human reviews.)

## Outputs & handoff contract

- **Emits:** `docs/features/<slug>/prd.md` with stable sections `## Problem` · `## Solution` ·
  `## User Stories` · `## Implementation Decisions` · `## Testing Decisions` · `## Out of Scope`.
  Change a section's shape → update its consumer in the same commit (`acceptance-criteria`, `plan-breakdown`, `pull-request`).
- **Structural invariant:** `prd.md` contains no file paths, signatures, schemas-as-code, or
  driver/library internals; mechanism rationale is referenced by ADR id; CONTEXT.md terms used verbatim.
  ADRs + CONTEXT.md are referenced *substrate*, not chain links (no extra resume hop).
- **STATE.md update:** add `prd.md` to the feature's `origin:` line; feature state stays `spec`; gate
  stays `you` (the human owns the Spec sign-off). No slice rows yet (slices are born in Plan).
- **Downstream consumers:** `acceptance-criteria` (user stories → Given/When/Then, behavioral-only) · `frontend-design`
  (UI features) · `plan-breakdown` (Implementation + Testing Decisions → slices) · `pull-request` (anchors the PR
  summary to prd + ADRs).
