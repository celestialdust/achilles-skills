---
name: spec-grilling
description: Use BEFORE writing any PRD or design doc — whenever the user wants to design a feature from an idea or intent.md, stress-test a design, pin down domain terminology, or record an architectural decision. Interview relentlessly, ONE question at a time, with a recommended answer each. Emits ADRs + CONTEXT.md; never a PRD.
---

## Purpose

Stage: **Spec** (human-led). This is where you design *how to build the product* from the intent — the
domain model, the mechanisms, the durable trade-offs — without writing a line of implementation or a PRD.
It exists because intent ("what the user wants") and design ("how the product is shaped") are different
processes; folding them together produces a shallow artifact that churns for two unrelated reasons.
The output is durable design **substrate** — ADRs and a glossary — that the PRD and plan reference by id,
never restate.

## When to use / when to skip

Use when you have an idea or an `intent.md` and need to design the product before the PRD: pin down domain
terminology, resolve mechanism choices, record the hard-to-reverse decisions. Trigger phrases: "grill me on
this design," "stress-test this plan before we build," "pin down the domain model," "what should I decide
before building X."

Skip (escape hatches):
- A pure refactor with no new domain concept and no cross-cutting decision → go straight to `plan-breakdown`.
- A trivial change touching one existing term and zero trade-offs → there is nothing to record; do not
  manufacture an ADR.
- Mid-implementation framework lookups → that's `source-driven-development`, not this.

`depth: lite` — if the feature has one obvious mechanism and no contested vocabulary, one or two questions and
a single CONTEXT.md term may be the whole session. Don't pad.

## Inputs

Refuse to run only if BOTH are absent:
- **`intent.md`** (preferred) under `docs/features/<slug>/`, from `interview-me`. Stable sections you rely on:
  **Outcome · User · Why · Success · Constraints · Out-of-scope ("Not Doing")**. Read it first — the design
  must serve that intent.
- **OR a raw idea in the prompt** — the user skipped `interview-me` and described the feature directly. Treat
  the prompt as the intent; offer to capture an `intent.md` if the idea is substantial, but don't block on it.

Also read, if present: repo-root `CONTEXT.md` (you will challenge against it and append to it) and existing
`docs/adr/` (never silently contradict an accepted decision — supersede it explicitly).

## Process

1. **Read the intent, then walk the design tree.** Identify the open design decisions and order them by
   dependency — resolve the decision others hang off *first*. Don't surface a downstream choice before its
   prerequisite is settled.

2. **Interview relentlessly, ONE question at a time.** Ask exactly one question, give **your recommended
   answer**, and wait for the response before the next. Asking several at once is bewildering and yields
   shallow answers. Keep going until you reach shared understanding of the whole tree — this is a grilling,
   not a single clarifying round.

3. **If a question is answerable from the codebase, go read it** instead of asking. Don't make the user
   recite what the code already says.

4. **Sharpen the domain model as you go** (the *active* discipline — you are changing the model, not just
   reading it):
   - **Challenge against the glossary.** If a term conflicts with `CONTEXT.md`, call it out: "Your glossary
     defines 'cancellation' as X, but you seem to mean Y — which is it?"
   - **Sharpen fuzzy language.** Propose a precise canonical term for vague/overloaded words: "You're saying
     'account' — do you mean the Customer or the User? Those are different things."
   - **Stress-test with concrete scenarios.** Invent edge-case scenarios that force precision about the
     boundaries between concepts.
   - **Cross-reference with code.** If a claim contradicts the code, surface it: "Your code cancels entire
     Orders, but you just said partial cancellation is possible — which is right?"

5. **Capture as you resolve, not in a batch.** The moment a term crystallises, append it to `CONTEXT.md`. The
   moment a decision meets the ADR test (below), write the ADR. Defer nothing — you'll lose the rationale.

## What you emit — and what you must NOT

You design at **interface altitude**, not implementation altitude. You emit two kinds of durable substrate and
**no `prd.md`**:

- **`CONTEXT.md`** (repo root, glossary-only) — append resolved terms in place under the `## Glossary`
  heading. It is **devoid of implementation detail**: a glossary, not a spec, scratch pad, or decision log. Be
  opinionated (pick one term, list rivals under `_Avoid_`); keep definitions tight (what it IS, not what it
  does); include only project-specific terms (no general programming concepts). Format:
  `references/CONTEXT-FORMAT.md`.

- **ADRs** (`docs/adr/ADR-<NNN>-<slug>.md`, repo-wide) — offer **sparingly**, only when ALL THREE hold:
  1. **Hard to reverse** — changing your mind later costs meaningfully.
  2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
  3. **The result of a real trade-off** — there were genuine alternatives and you picked one for reasons.
  If any one leg is missing, skip it. Use the ADR template/standard owned by `documentation-and-adrs` — do not
  invent a second ADR format. Scan `docs/adr/` for the highest number and increment.

You do **not** write product user-stories, file paths, function signatures, or library/driver internals —
those belong to `to-prd` (product altitude) and `plan-breakdown` (implementation altitude). Your design
rationale is **referenced** by `prd.md` ("see ADR-007"), never restated there.

(optional, Rule-of-Three escape hatch) a per-feature `design.md` — only when ~3+ ADRs need a connecting
narrative; default OFF.

## Rationalizations

- "I'll ask all my questions at once to save round-trips." → No. One at a time; batching produces shallow
  answers and hides the dependency order.
- "This decision is *probably* worth an ADR." → Apply the three-part test. "Probably" usually means one leg
  is missing. Sparingly.
- "I'll record the design in the PRD so it's all in one place." → That's the violation. Design substrate
  lives in ADRs/CONTEXT.md; the PRD references it. Co-location is not cohesion.
- "I'll note the term later." → You'll lose the rationale. Append to CONTEXT.md the moment it resolves.
- "Let me sketch the file structure / signatures while I'm here." → Wrong altitude. That's the plan's job.

## Red flags — stop if you catch yourself

- Asking a second question before the first is answered.
- Producing a `prd.md`, user stories, file paths, or signatures from this skill.
- Putting implementation detail into `CONTEXT.md`.
- Creating an ADR that fails any one of the three conditions.
- Answering a codebase-knowable question from assumption instead of reading the code.
- Editing or contradicting an accepted ADR without an explicit supersede link.

## Verification (ending criteria)

Done when:
- Every open design decision in the tree is resolved with the user, dependencies first.
- Every fuzzy/conflicting term is now a single canonical entry in `CONTEXT.md` (or consciously left out as a
  general concept).
- Every decision meeting all three ADR conditions has an ADR in `docs/adr/`; **no** ADR exists that fails the
  test.
- No `prd.md`, file path, or signature was produced here.
- Re-read `intent.md`'s Outcome/Success — the design satisfies them.

## Outputs & handoff contract

**Emits (design substrate — registry):**
- `CONTEXT.md` (repo root) — stable shape: `# {Context}` + a single `## Glossary` section of glossary entries.
  Repo-wide, cross-feature.
- `docs/adr/ADR-<NNN>-<slug>.md` — repo-wide design decisions, referenced **by id** from `to-prd` and
  `plan-breakdown`.

These are **referenced substrate, not chain links** — they add no resume-spine hop. Downstream consumers
(`to-prd`, `plan-breakdown`, `spec-review`) reference ADRs by id and use CONTEXT.md terms **verbatim**.

**Stable-section rule:** if you rename/supersede an ADR or change a CONTEXT term, update its referrers in
the **same commit**. ADRs are append-only/immutable once written — supersede via links, never delete.

**STATE.md update:** the feature stays in `feature: spec` (no slice rows yet — slices are born in Plan). Record
the ADR ids under the feature's `origin:` once `to-prd` runs.

**Next:** `to-prd` (writes `prd.md` referencing your ADRs) and, for UI, `frontend-design`. The Spec gate /
`spec-review` checklist includes "open the referenced ADRs" so your design isn't rubber-stamped unseen.
