---
name: architecture-design
description: Reconciles a feature's structure into an artifact a person signs before any code is planned — one feature's `architecture.md`, written in Anthropic's five-part system-design format (requirements · high-level design · deep dive · scale and reliability · trade-offs) plus a sixth section holding the questions a person answers, alongside the committed `architecture.html` read at the Spec gate. ALWAYS run this in Spec, once `acceptance.md` exists in draft and before `spec-review`, whenever a feature adds a component, adds a dependency between parts that already exist, or changes what the system must hold to under load — and before anyone plans, breaks down, or implements against a structure nobody wrote down. The artifact is a RECAP: it traces every scenario through the structure, restates the requirements, storage, scale and reliability posture already decided, grades what it wrote with two code-cold sweeps whose findings become questions for the person rather than edits, and cites the decisions taken during `spec-grilling` rather than taking them itself. It may do the load arithmetic but never picks the posture; never invent a layer order nobody decided, never invent a latency or cost target nobody stated, never pin a signature, field list, or schema — those are Plan's — and keep `architecture.md` inside its 2000-line budget, cutting prose rather than rows.
---

## Purpose

**Stage: Spec — it runs once `acceptance.md` exists in draft, and before `spec-review`.**
`architecture-design` reconciles, grades, and renders: it traces every `acceptance.md` scenario through
the structure, recaps the requirements and the scale and reliability posture already decided, has what it
wrote graded code-cold against the two design disciplines, and cites the decisions taken during
`spec-grilling` rather than taking them itself.

**The output format is Anthropic's `system-design` framework, verbatim** — requirements,
high-level design, deep dive, scale and reliability, trade-offs — plus a sixth section this suite
adds for the questions nobody has answered yet. `references/section-contract.md` carries the tables that go
under each heading. The format is a recap of decisions already taken, which is what makes it signable in
one sitting rather than a design session with a signature at the end.

At the Spec gate a person signs behaviour (`acceptance.md`), product (`prd.md`), decisions (`docs/adr/`)
and, for a user interface, a look (`design-contract.md`). None of them says whether the structure those
decisions imply carries the behaviour the scenarios promise — a decision record cannot, because it was
written before the scenarios were.

This skill is that pass: one feature's structure, and a page that answers the gate's questions without
the reader opening a skill.

Tracing alone cannot catch a structure that is consistent and poor — every scenario has a path, every edge
cites a decision, and the components still do not earn their rows. `spec-grilling` grills only a structural
question somebody noticed was load-bearing, so a question nobody thought to ask reaches the gate unasked.
That is why this pass also **grades** what it wrote, code-cold, and puts what that finds to the person
rather than fixing it.

## When to use / when to skip

`architecture-design` runs against a **draft** `acceptance.md` — present, not signed — and the two are
signed together in one act at the Spec gate, so the scenarios cannot move between the trace and the
signature. A scenario that traces through nothing goes back to `acceptance-criteria` while it is still
editable. Running after `spec-review` instead would make the one artifact a person signs the one artifact
no code-cold reader ever checked.

Reach for it when a feature adds a component, adds a dependency between parts that already exist, or
changes what the system must hold to under load. Reach for it also when someone is about to break the work
into slices against a structure that exists only in their head.

These belong to other skills; this one references them as methods rather than absorbing them:

| Not this | Whose it is | Where it lands |
|---|---|---|
| interface signatures, schemas, endpoint shapes | `api-design` | `plan.md` |
| deep-module design inside one component | `codebase-design` | `plan.md` |
| the repository's decided look | `frontend-design` | `docs/design.md` |
| one hard-to-reverse decision, written up | `documentation-and-adrs` | `docs/adr/` |

`codebase-design` and `api-design` are referenced disciplines, not sequential stages: they run in **Spec
and Plan** — `spec-grilling` dispatches them in Spec to propose a structural variant, this pass dispatches
them in Spec again to grade the structure it wrote, and `plan-breakdown` reaches for them in Plan to pin
the interface into `plan.md`. They own no artifact of their own, because what they produce lands in a file
another skill owns.

The table above still holds while they run here, because **a lens is not an output**: in step 4 they read
sections 2, 3 and 5 and return findings, and the signatures and field lists they produce as a discipline
still land in `plan.md` and nowhere else. What they produced under `spec-grilling` reaches this pass as a
decision to cite.

## Inputs

Refuse-to-run (fail-safe deny) unless these resolve:

- **REQUIRED — `docs/features/<slug>/acceptance.md`, present in draft or signed.** `acceptance-criteria`
  emits it. If it is **absent** → **STOP**, and say that `acceptance-criteria` is the step that produces
  it. A draft is what this pass wants, and section 5 traces each scenario by id whatever its status.
- **REQUIRED — `docs/features/<slug>/research.md`** (from `codebase-research`, which `/spec` runs first).
  Section 2 records the dependency edges the code has **today**, and section 1's stack constraints come
  from it. Without the survey you would be writing
  down what you assume the code does, which is the one failure a structure document cannot recover from,
  because everything downstream is placed by it.
- **Read — `docs/features/<slug>/prd.md`**, for what is in scope and for section 1's functional and
  non-functional rows.
- **Read — `docs/features/<slug>/environment.md`** where it exists, for section 1's stack constraints. A
  constraint nobody wrote down is the reason a later reader mistakes a forced choice for a bad one.
- **Read — `docs/adr/` and `CONTEXT.md`.** Every edge cites the recorded decision it rests on, and terms
  come from the glossary verbatim rather than being coined here. Those decisions were taken during
  `spec-grilling`, with the person in the room: cite them. A question grilling left open is a section 6
  row here, not a chance to decide it alone.

## The Structure Pass

Seven steps. The format of everything written below lives in
[`references/section-contract.md`](references/section-contract.md) — the six sections, their tables, the
page, and the comparison. Read it before writing a word. The two sweeps step 4 dispatches live in
[`references/lens-passes.md`](references/lens-passes.md).

**1 · Take the layer order, or record that there is none.** A layer order is a decision, so it lives
where decisions live — in `docs/adr/`, recorded when somebody took it.

- **An accepted ADR declares an order** → section 2's edge table states which edges that order permits,
  and an edge outside it is a section 6 question for the person, not a line to quietly add. Cite the ADR in
  the `Decision` column.
- **No ADR declares one** → section 2 records the edges `research.md` found in the code today and states
  **`layer order: not decided`**. Propose none. This is most repositories.

That second case is the one that goes wrong. Its rules — what section 2 may contain, why numbering
components into tiers decides an order without saying so, and what a *later* feature may read out of those
rows — are in `references/section-contract.md` under **Where no layer order is decided**.

**2 · Write `architecture.md`** against the six sections, in order. Section 2 carries the gate's first two
questions — which parts are new, and which dependencies this feature adds — in the `New` column and the
edge table, so write them so a reader answers both without prose archaeology.

**Everything you write is a recap.** Each row cites where its fact was already settled: a record under
`docs/adr/`, a row in section 5, `prd.md`, `research.md`, `environment.md`, or `default — not contested`.
Where nothing settles it, the cell says `not stated` or `not decided` and the question goes to section 6.
Two places this bites hardest, because the temptation to fill the cell is strongest and the invented value
is indistinguishable from a recalled one:

- **A non-functional target in section 1** — a latency, availability, or cost number nobody stated. An
  invented one is a promise to a user or to whoever pays, handed to the person as though they made it.
- **A posture in section 4** — scaling direction, a replica, an accepted window of downtime. You may do the
  arithmetic and show it, because a calculation is checkable by anyone reading the inputs. The choice that
  spends money or accepts an outage is the person's.

**The file has a budget: 2000 lines.** Check it with `wc -l` before you hand off; it is not a target to
grow into. The budget exists because this artifact has two readers who both fail quietly when it is long —
a person at the gate who skims instead of reading, and an agent downstream whose window holds only part of
it and cannot tell which part it is missing. A structure document nobody finished reading grants approval
it never earned.

Over budget, **the thing you cut is prose, never structure.** All six sections survive; every data-flow row
in section 2 survives; every edge row in section 2 survives. What goes is wording — reasoning already
recorded in the ADR the row cites, a rationale restated in three places, an example carrying a point the
table already makes. Those cuts cost nothing, because the reasoning behind a decision lives in `docs/adr/`
and section 5 is a citation index into it; repeating it here was never this file's job.

If the **tables alone** breach 2000 lines, concision cannot save it and you should not try. That is a fact
about the feature, not the writing: something with that many scenarios and edges is likely two features
wearing one slug. Write it as a section 6 row for the person — they can split the feature, or accept the
size knowing why — and leave the file over budget rather than dropping rows to fit. A trimmed table looks
exactly like a complete one, which is the failure this whole pass exists to prevent.

**3 · Trace every scenario** into section 2's data-flow table, one row per scenario, keyed by its
`acceptance.md` id. A scenario with no path is a behaviour nothing was designed to handle, and it is far
cheaper to find here than in Verify — cheaper in both directions now that the contract is still a draft,
since the fix may be the structure *or* the scenario. Hand it back to `acceptance-criteria` once, and
whatever survives that single round trip is a section 6 row the person answers at the gate.

**4 · Grade what you wrote.** Dispatch both sweeps in
[`references/lens-passes.md`](references/lens-passes.md) as fresh, code-cold subagents — in one message, so
they run in parallel. The depth sweep reads section 2's components and section 3, with section 2's data
flow as evidence; the interface sweep reads section 2's API contracts and section 5. Each is given
`architecture.md` and `research.md` and nothing else, returns findings only, and edits nothing.

Merge what comes back into section 6, under the second of the two headings
`references/section-contract.md` gives it, dropping any finding section 5 already cites. **Never apply a
finding to sections 2, 3 or 4.** Applying one takes a structural decision at the single moment nobody is
watching; the person at the gate is who takes it. Write the heading even when both
sweeps return nothing — `references/section-contract.md` says what goes under it then, and why.

**5 · Author `architecture.html`,** self-contained and theme-aware, draw section 2's component diagram on
it as inline SVG so the person at the gate sees the structure rather than reassembling it from rows, and **splice** the
source block from `architecture.md` — read the file and place its bytes between the tags. **Never retype it.** A copy that
was typed rather than spliced is already drifting while looking exactly like one that is not.

**6 · Run the comparison** in `references/section-contract.md`. It is a byte comparison, not a reading —
`0` clean, `1` drifted, `2` no block at all. Run it again after any later edit to either file, including
one that only fixes a typo.

**7 · Hand it to the gate.** `spec-review` hardens both files and re-runs the comparison; then the person
reads the page and signs this file and `acceptance.md` together. Nothing an agent does flips `status:`.

## Rationalizations

| The excuse | Why it does not hold |
|---|---|
| "The structure is obvious from the PRD." | Then section 2 costs ten minutes. What is obvious to you at the gate is not in the repository, and the next agent reads the repository. |
| "`acceptance.md` is still a draft, so I will wait until it is signed." | Waiting is what used to put the structure downstream of a contract nobody had traced. Trace the draft: the two are signed together, so a scenario that traces through nothing can still be fixed instead of bent around. |
| "I will write the page once the code lands." | Then nobody signed anything. The artifact exists to be agreed *before* the plan; written afterwards it is a description of what got built. |
| "This repository has no declared layering, so I will propose one — somebody has to." | Not inside a feature's spec. Record what the code does, write `layer order: not decided`, and put the question to the person in section 6. A layer order chosen here makes one feature's convenience the repository's constitution. |
| "The edges already in the map tell me what is allowed." | Only where an order was decided. Where the map says `layer order: not decided`, those rows are observations of what the code does, and an observation grants nothing. |
| "Retyping the markdown into the page is the same as splicing it." | It is the exact drift the block exists to catch, and it looks identical until the day it does not. Splice the bytes. |
| "The check passed last time, so the page is fine." | It compares the two files as they are now. Every edit to either invalidates the last result. |
| "I will write the data flow from the PRD's stories." | Stories are not the oracle. Verify grades scenarios by id, and section 2's data-flow table is what makes each one's path through the structure checkable. |
| "I wrote section 2 carefully, so grading it myself is the same thing." | It is the one thing it cannot be. You chose those components, so you cannot find what you were already not seeing — the reason Verify and Review run code-cold is the reason these sweeps do. |
| "This depth finding is obviously right, so I will just fix section 2." | Then a structural decision was taken here, by an agent, with nobody watching. A section 6 row already carries the recommended answer; let the person spend the ten seconds agreeing to it. |
| "This feature is genuinely complex, so it earns more than 2000 lines." | Complexity earns more *rows*, not more *prose*, and rows are compact. Measure which one you are over on before arguing for the exemption — nearly always it is restated rationale that `docs/adr/` already holds. |
| "I am 300 lines over, so I will trim the data flow to the scenarios that matter." | Every scenario matters; that is what signing `acceptance.md` means. A data-flow table missing rows reads exactly like one that is complete, so this trade buys a shorter file by breaking the one property the file is checked on. Go over budget and say so in section 6. |
| "No latency target was stated, so I will put a sensible one in section 1." | Then the person signs a promise to a user that they never made, and it reads exactly like one they did. `not stated` in the cell plus a section 6 row costs them ten seconds and leaves the number theirs. |
| "The load estimate obviously implies one box, so I will write that in section 4." | The estimate is arithmetic and yours to do; the posture spends money or accepts an outage and is theirs to pick. Show the multiplication, say `not decided`, and recommend one in section 6 — a recommendation they can wave through is not the same as a choice made for them. |
| "`Cost paid` is empty because this decision genuinely cost nothing." | Then it was not a trade-off, and one of the two is wrong: either the alternative was never real, or the cost is real and you have not found it. Both are section 6 rows. |

## Red flags

Each of these means the pass is being violated, not merely that a file is untidy.

- Section 2 states a layer order the repository never decided — or numbers components into tiers, which
  decides one without saying so.
- A scenario has no row in section 2's data flow, or a data-flow row names no scenario in `acceptance.md`.
- Data-flow rows keyed by feature or story name instead of `acceptance.md` ids.
- An edge, API-contract, or storage row in section 2 with an empty `Decision` cell.
- A section 1 non-functional dimension with a target no source states — an invented number is
  indistinguishable from a recalled one, which is the whole problem.
- Fewer than four rows in section 1's non-functional table. A dimension nobody thought about and a
  dimension deliberately left out look identical in a table of three.
- A section 3 row that pins a schema, a field list, a signature, or a wire format. That is `plan.md`'s, and
  a second source for one fact is a fact that will disagree with itself.
- A section 3 topic with no block at all, rather than a block reading `_n/a — <why>_`.
- A section 4 load estimate stating a number with no arithmetic behind it, or a scaling, failover, or
  downtime posture picked here rather than cited.
- A section 4 monitoring row naming a signal nothing emits without saying `nothing` in `Emitted today by`.
- A section 5 row with `Cost paid` empty or reading "none".
- A section 5 "what we would revisit" trigger that is a feeling rather than an observable threshold.
- The page's source block differs from the file in whitespace or line wrapping only — the tell of a block
  that was retyped.
- A `see ADR-NNN` in the artifact pointing at no file under `docs/adr/`.
- A section 5 row this pass decided rather than cited, or a section 6 question it answered on its own.
- The page pulls a font, a stylesheet, or a script from a remote host.
- A sweep's finding applied to section 2, 3 or 4 instead of raised as a section 6 row.
- A sweep run by the context that wrote the structure rather than dispatched as a fresh, code-cold subagent.
- Section 6 with no heading for the sweeps after they ran — nothing then distinguishes two sweeps that
  found nothing from two that were skipped.
- `architecture.md` over 2000 lines with no section 6 row accounting for it — or under 2000 because rows
  were dropped to get there.

## Verification (ending criteria)

The pass is finished when all of these hold, each checked rather than assumed:

- The six headings are present and in order, in every file written — Anthropic's five, then open questions.
- **`wc -l docs/features/<slug>/architecture.md` is at most 2000** — or it is over, and section 6 carries
  the row saying the tables alone breach it. Run the command; a file's length is the one property nobody
  estimates correctly by looking at it.
- **Set equality on section 2's data flow.** Every `acceptance.md` scenario id appears exactly once, and no
  row names an id that is not there. Extract both lists and compare them; a read-through is what misses the
  one in the middle.
- **Section 1's non-functional table has all four dimensions** — scale, latency, availability, cost — and
  every `not stated` cell has a matching section 6 question. Grep for `not stated` and check each one has a
  row; a target left blank with nothing asking about it is the gap this table exists to make visible.
- **Every section 4 load estimate shows its arithmetic**, with each input traceable to a section 1 row. A
  reader has to be able to disagree with the input rather than with the number.
- **No section 4 posture was chosen here.** Every scaling direction, failover plan, and accepted downtime
  window cites a record or reads `not decided` with a section 6 row behind it. Check each `Decision` cell.
- Every section 4 monitoring row names what emits it today — including `nothing`, where nothing does.
- **Every section 5 row names a cost.** `Cost paid` is not empty and does not read "none" on any row.
- Every section 3 topic has a block: a table, or the heading with `_n/a — <why>_` under it. And no row in
  any of them pins a schema, field list, signature, or wire format.
- **Section 6 carries the sweeps' heading**, in the form `references/section-contract.md` gives it. That
  heading is the only trace the sweeps leave in the artifact, so it is the only one a later reader can check.
  Whether each was dispatched code-cold is **not** checkable here — it is step 4's instruction, and no
  artifact records it. Stating it as a criterion would only invite the agent to attest to its own memory.
- **Section 6 opens with the line naming who answers its rows**, the one `references/section-contract.md`
  requires. `spec-review` runs after this pass and cites that line as its reason for leaving those rows
  alone, so a section 6 missing it loses the protection without anything failing.
- Every finding that came back is either dropped as already cited in section 5 or is a section 6 row.
  None of them changed sections 2, 3 or 4 — check by diffing those sections against what step 2 wrote.
- Every section 2 edge cites a decision id, an `ADR-NNN` that resolves to a file under `docs/adr/`, or
  `default — not contested`; or section 2 states `layer order: not decided` and its rows are the edges
  `research.md` recorded.
- Section 2's API contracts table names every consumer of this feature's surface, including the ones outside
  the repository that no edge row can carry. Those are the consumers the interface sweep is otherwise blind
  to.
- **Section 2's Mermaid block and its edge table say the same thing**, and the page's SVG says it a third
  time: one arrow per row, one row per arrow, same node names. Compare the three as sets rather than reading
  them — a diagram that quietly disagrees with the table is worse than no diagram, because a reader
  believes the picture.
- **The comparison returns `0`, and you have watched it fail.** Drift one byte in `architecture.md`
  without re-splicing, confirm `1`; delete the block, confirm `2`. A check you have only ever seen pass is
  not known to work, and the two failures have to be distinguishable because they have different fixes.
- The page opens from a fresh clone with the network off and renders in both light and dark.
- `status:` still reads `unsigned`. A person flips it, at the gate, after reading the page.

## Outputs & handoff contract

**Writes** — two files, and this skill is the only one that writes either:

- **Creates `docs/features/<slug>/architecture.md`** — this feature's structure in six sections:
  Anthropic's `system-design` five, then the open questions. It is self-contained: there is no
  repository-level map to inherit from, and a decided layer order lives in `docs/adr/`, cited by section 2.
- **Creates `docs/features/<slug>/architecture.html`** — committed beside the markdown, self-contained,
  its source block spliced from that file.

**The two sweeps write nothing.** Step 4 dispatches them, they return findings, and they own no artifact —
as everywhere else `codebase-design` and `api-design` run. What they find reaches the person as section 6
rows in the file above, and reaches nothing else.

**Reads** — `acceptance.md` (draft or signed), `research.md`, `prd.md`, `environment.md` where it exists,
`docs/adr/`, and `CONTEXT.md`.

**Never edits** `acceptance.md`, `prd.md`, or any signed artifact. A scenario that traces through nothing goes back to
`acceptance-criteria`, which owns that file; a structure that still will not fit after that round trip is
a section 6 row for the person at the gate, never a reason to reword the contract.

**Read next by** `spec-review`, which hardens both files, re-runs the comparison, and resolves the ADR
citations; then the person at the gate. `plan-breakdown` reads `architecture.md` afterwards, so the
slices are cut against a structure somebody agreed to rather than one the planner inferred.
