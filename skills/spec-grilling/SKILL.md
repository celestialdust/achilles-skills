---
name: spec-grilling
description: Use BEFORE writing any PRD or design doc — whenever the user wants to design a feature from an idea or intent.md, stress-test a design, pin down domain terminology, surface design decisions the user hasn't considered, or record an architectural decision. Runs after codebase-research's goal-blind survey and refuses without research.md, so the design is decided against the codebase as it is rather than against recollection. Interview relentlessly, ONE question at a time, with a recommended answer each. Grills the structural branch too — which parts earn their existence, what has to be swappable, what a consumer's surface may depend on — fanning out codebase-design or api-design variants on a load-bearing one so the person chooses. Emits ADRs + CONTEXT.md; never a PRD.
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
- A pure refactor with no new domain concept and no cross-cutting decision → go straight to
  `plan-breakdown` (it still needs `research.md`, so the survey runs either way — only the grilling is
  skipped).
- A trivial change touching one existing term and zero trade-offs → there is nothing to record; do not
  manufacture an ADR.
- Mid-implementation framework lookups → that's `source-driven-development`, not this.

`depth: lite` — if the feature has one obvious mechanism and no contested vocabulary, one or two questions and
a single CONTEXT.md term may be the whole session. Don't pad.

## Inputs

**REQUIRED — `docs/features/<slug>/research.md`**, the goal-blind survey `codebase-research` produces at
the head of Spec. **Refuse to run without it**, and name what is missing rather than improvising:
> No `docs/features/<slug>/research.md` — run `codebase-research` first. I will not decide the design
> against recollection.

The blind-spot pass in step 1 scans territory; a survey is what makes that territory visible. Deciding
first and surveying afterwards produces ADRs written against whatever the grilling agent happened to open,
and an ADR is the hardest artifact in the chain to revise. Read three of its sections before your first
question:

- `## Codebase map`
- `## Open items for Plan` — a structural item in it is `spec-grilling`'s, not Plan's.
- `## Structural facts` — seams and their adapter counts, module boundaries, conventions in use; `_none_`
  where there are none. This is what a proposed variant stands on.

**REQUIRED — the intent.** Refuse to run only if BOTH are absent:
- **`intent.md`** (preferred) under `docs/features/<slug>/`, from `interview-me`. Stable sections you rely on:
  **Outcome · User · Why · Success · Constraints · Out-of-scope ("Not Doing")**. Read it first — the design
  must serve that intent.
- **OR a raw idea in the prompt** — the user skipped `interview-me` and described the feature directly. Treat
  the prompt as the intent; offer to capture an `intent.md` if the idea is substantial, but don't block on it.

Also read, if present: repo-root `CONTEXT.md` (you will challenge against it and append to it) and existing
`docs/adr/` (never silently contradict an accepted decision — supersede it explicitly).

## Process

1. **Read the intent and the survey, then walk the design tree.** Identify the open design decisions and
   order them by dependency — resolve the decision others hang off *first*. Don't surface a downstream
   choice before its prerequisite is settled.

   Then **grow the tree with a blind-spot pass**: the tree so far holds only decisions already on the
   user's map. Read the three survey sections named above — the blind spots are the decision points the
   survey surfaced that the intent never mentions: an invariant this feature would break, prior art that
   already settles a question you were about to ask, an open item somebody has to decide. Read existing
   `docs/adr/` and the domain alongside it, present a 3–5 item blind-spot brief, and add the real ones to
   the tree. (Step 3 answers questions already *in* the tree from the code; this finds the questions that
   aren't — which is why it reads a survey rather than your recollection. You cannot recall a decision
   point you never knew existed.) Ask up front which parts of the domain the user knows cold and which
   they know nothing about, and calibrate by that disclosure: skip the pass on familiar ground; run it in
   full on unfamiliar ground. Technique details: `../../references/finding-unknowns.md`.

   **Carry a structural branch.** An intent says what the product does, not what the code is arranged
   into, so a tree grown from one is all mechanism and no shape. Three questions fix that, each
   constraining the next:

   - **Which parts earn their existence?** `codebase-design`'s deletion test, on each part the feature
     seems to want.
   - **What has to be swappable, and what are the two things that swap?** If the second cannot be named,
     that is the answer, and worth having said out loud.
   - **What may a consumer of this feature's surface depend on?** Resource model, error envelope,
     pagination, versioning — `api-design`'s ground, and the leg most often skipped, because none of it
     looks structural until every consumer has already depended on it.

   A structural question is load-bearing when it clears the three-leg test before it is answered — hard to
   reverse, surprising without context, the result of a real trade-off. On one of those, `spec-grilling`
   dispatches `codebase-design` or `api-design` as fresh-context subagents that each produce a genuinely
   different design, then presents the set with a recommendation and its reasoning; the person picks or
   amends, and a variant set is still one question. Everything else is stated as a batched default, one
   line each, and the person objects to any of them.

   The record test is the same three legs, reused rather than a fourth gate: no question can be worth three
   subagents and not worth recording. An amendment — "C, but move the seam up" — is the decision the ADR
   records, not a note beside one. `codebase-design` and `api-design` are referenced disciplines, not
   sequential stages, and own no artifact of their own — what they produce lands in a file another skill
   owns. Each states where it runs and who dispatches it; there are more dispatch sites than this line
   could keep true.

2. **Interview relentlessly, ONE question at a time.** Ask exactly one question, give **your recommended
   answer**, and wait for the response before the next. Asking several at once is bewildering and yields
   shallow answers. Keep going until you reach shared understanding of the whole tree — this is a grilling,
   not a single clarifying round.

   Within the dependency order, spend questions where the answer changes the architecture; if your
   recommended answer is an uncontested default, state it as the default and move on — one line, not a
   round. A question whose every answer leads to the same design was never a question.

3. **If a question is answerable from the codebase, go read it** instead of asking. Don't make the user
   recite what the code already says. Check `research.md` first — it was surveyed for exactly this — and
   open the code directly only for what the survey does not cover.

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

6. **Close with a calibrated quiz.** For novel or high-stakes designs, don't end on the user nodding at
   the substrate they just signed. Ask 2–3 scenario questions against the recorded decisions ("given what
   we decided in ADR-NNN, what happens when X?"). A miss means an ADR and the user's mental model diverge —
   reopen that decision, don't paper over it. Skip for `depth: lite` sessions.

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
- "Structure isn't my branch — `architecture-design` covers it." → `architecture-design` reconciles,
  grades, and renders: it traces every `acceptance.md` scenario through the structure, records the
  invariants, and cites the decisions taken during `spec-grilling` rather than taking them itself. Its
  code-cold sweeps do catch a structural question nobody asked — and put it to the person at the gate, one
  row among several, answered cold. Here they can amend: "C, but move the seam up" is an answer a row at
  the gate leaves no room for.
- "The user approved every decision as we went, so we're aligned." → Approving one decision at a time is
  not holding the whole design. The closing quiz checks the assembled model, cheaply.
- "I know this codebase well enough to start grilling; I'll read the code as questions come up." → Reading
  as questions come up only answers questions you already have. The survey exists to hand you the ones you
  don't, before an ADR freezes the answer. Run `codebase-research` and come back.

## Red flags — stop if you catch yourself

- Asking a second question before the first is answered.
- Producing a `prd.md`, user stories, file paths, or signatures from this skill.
- Putting implementation detail into `CONTEXT.md`.
- Creating an ADR that fails any one of the three conditions.
- Answering a codebase-knowable question from assumption instead of reading the code.
- Opening the decision tree — or writing a single ADR — with no `research.md` in hand.
- Running the blind-spot pass off memory of the codebase instead of off the survey's `## Codebase map`,
  `## Structural facts`, and `## Open items for Plan`.
- Interviewing only the decisions the intent already lists — no blind-spot pass on unfamiliar ground.
- A tree with no structural branch on a feature that adds a part, adds a dependency, or exposes a surface.
- Settling a load-bearing structural question out of your own single answer — or fanning out variants on
  one that clears none of the three legs.
- Ending a novel or high-stakes session without the closing quiz.
- Editing or contradicting an accepted ADR without an explicit supersede link.

## Verification (ending criteria)

Done when:
- `research.md` was read before the first question, and the blind-spot brief drew on it.
- Every open design decision in the tree is resolved with the user, dependencies first.
- The structural branch was carried, or the feature adds no part, no dependency and no surface; each
  load-bearing question in it went to variants, and the rest were stated as defaults.
- Every fuzzy/conflicting term is now a single canonical entry in `CONTEXT.md` (or consciously left out as a
  general concept).
- Every decision meeting all three ADR conditions has an ADR in `docs/adr/`; **no** ADR exists that fails the
  test.
- No `prd.md`, file path, or signature was produced here.
- For novel/high-stakes designs, the closing quiz ran and any miss reopened its decision.
- Re-read `intent.md`'s Outcome/Success — the design satisfies them.

## Outputs & handoff contract

**Emits (design substrate — registry):**
- `CONTEXT.md` (repo root) — stable shape: `# {Context}` + a single `## Glossary` section of glossary entries.
  Repo-wide, cross-feature.
- `docs/adr/ADR-<NNN>-<slug>.md` — repo-wide design decisions, referenced **by id** from `to-prd` and
  `plan-breakdown`.

These are **referenced substrate, not chain links** — they add no resume-spine hop. Downstream consumers
(`to-prd`, `architecture-design`, `plan-breakdown`, `spec-review`) reference ADRs by id and use CONTEXT.md
terms **verbatim**. The structural branch's ADRs are what `architecture.md` cites in its `Decision`
columns; a question settled as a batched default is cited there as `default — not contested`.

**Stable-section rule:** if you rename/supersede an ADR or change a CONTEXT term, update its referrers in
the **same commit**. ADRs are append-only/immutable once written — supersede via links, never delete.

**STATE.md update:** the feature stays in `feature: spec` (no slice rows yet — slices are born in Plan). Record
the ADR ids under the feature's `origin:` once `to-prd` runs.

**Next:** `to-prd` (writes `prd.md` referencing your ADRs) and, for UI, `frontend-design`. The Spec gate /
`spec-review` checklist includes "open the referenced ADRs" so your design isn't rubber-stamped unseen.
