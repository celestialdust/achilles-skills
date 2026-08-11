---
name: architecture-design
description: Reconciles a feature's structure into an artifact a person can sign before any code is planned — the repository's `ARCHITECTURE.md`, one feature's `architecture.md`, and the committed `architecture.html` read at the Spec gate. Use in Spec once `acceptance.md` exists in draft and before `spec-review`, whenever a feature adds a module, adds a dependency between parts that already exist, or introduces a seam — and whenever anyone is about to plan, break down, or implement against a structure nobody wrote down. It traces every scenario through the structure, records the invariants, and cites the decisions taken during `spec-grilling` rather than taking them itself; a scenario that traces through nothing goes back to `acceptance-criteria` while it is still editable. REFUSES to run with no `acceptance.md` at all, never scaffolds `ARCHITECTURE.md` into a fresh repository, never invents a layer order nobody decided, and never pins a signature or field list — those are Plan's.
---

## Purpose

**Stage: Spec — it runs once `acceptance.md` exists in draft, and before `spec-review`.**
`architecture-design` reconciles and renders: it traces every `acceptance.md` scenario through the
structure, records the invariants, and cites the decisions taken during `spec-grilling` rather than
taking them itself.

At the Spec gate a person signs behaviour (`acceptance.md`), product (`prd.md`), decisions (`docs/adr/`)
and, for a user interface, a look (`design-contract.md`). None of them says whether the structure those
decisions imply carries the behaviour the scenarios promise — a decision record cannot, because it was
written before the scenarios were.

This skill is that pass: a repository map, one feature's structural delta, and a page that answers the
gate's questions without the reader opening a skill.

## When to use / when to skip

`architecture-design` runs against a **draft** `acceptance.md` — present, not signed — and the two are
signed together in one act at the Spec gate, so the scenarios cannot move between the trace and the
signature. A scenario that traces through nothing goes back to `acceptance-criteria` while it is still
editable. Running after `spec-review` instead would make the one artifact a person signs the one artifact
no code-cold reader ever checked.

Reach for it when a feature adds a module, adds a dependency between parts that already exist, introduces
a seam, or is the first feature in a repository whose structure nobody has written down. Reach for it
also when someone is about to break the work into slices against a structure that exists only in their
head.

These belong to other skills; this one references them as methods rather than absorbing them:

| Not this | Whose it is | Where it lands |
|---|---|---|
| interface signatures, schemas, endpoint shapes | `api-design` | `plan.md` |
| deep-module design inside one component | `codebase-design` | `plan.md` |
| the repository's decided look | `frontend-design` | `docs/design.md` |
| one hard-to-reverse decision, written up | `documentation-and-adrs` | `docs/adr/` |

`codebase-design` and `api-design` are referenced disciplines, not sequential stages: they run in **Spec
and Plan** — `spec-grilling` dispatches them in Spec to propose a structural variant, `plan-breakdown`
reaches for them in Plan to pin the interface into `plan.md` — and they own no artifact of their own,
because what they produce lands in a file another skill owns. What they produced in Spec reaches this
pass as a decision to cite.

## Inputs

Refuse-to-run (fail-safe deny) unless these resolve:

- **REQUIRED — `docs/features/<slug>/acceptance.md`, present in draft or signed.** `acceptance-criteria`
  emits it. If it is **absent** → **STOP**, and say that `acceptance-criteria` is the step that produces
  it. A draft is what this pass wants, and section 5 traces each scenario by id whatever its status.
- **REQUIRED — `docs/features/<slug>/research.md`** (from `codebase-research`, which `/spec` runs first).
  Section 3 records the dependency edges the code has **today**. Without the survey you would be writing
  down what you assume the code does, which is the one failure a structure document cannot recover from,
  because everything downstream is placed by it.
- **Read — `docs/features/<slug>/prd.md`**, for what is in scope.
- **Read — `docs/adr/` and `CONTEXT.md`.** Every edge cites the recorded decision it rests on, and terms
  come from the glossary verbatim rather than being coined here. Those decisions were taken during
  `spec-grilling`, with the person in the room: cite them. A question grilling left open is a section 8
  row here, not a chance to decide it alone.
- **Read when the repository has one — `ARCHITECTURE.md`.** **No refuse-to-run here.** Its absence is
  correct rather than missing: this feature is the first to run a structure pass, so this pass writes it.

## The Structure Pass

Seven steps. The format of everything written below lives in
[`references/section-contract.md`](references/section-contract.md) — the eight sections, their tables, the
page, and the comparison. Read it before writing a word.

**1 · Find out which map you are writing.** Look for `ARCHITECTURE.md` at the repository root.

- **Absent** → this feature is the first structure pass here. Write `ARCHITECTURE.md` from `research.md`
  as the repository map, then this feature's `architecture.md` as its delta against it.
- **Present** → write the delta only, with `inherits: ARCHITECTURE.md` in the header block. Do not restate
  the repository map inside a feature file; a second copy of the layering is a second thing that has to
  stay true.

**2 · Take the layer order, or record that there is none.**

- `ARCHITECTURE.md` **declares an order** → section 3 states which edges that order permits, and an edge
  outside it is a section 8 question for the person, not a line to quietly add.
- It **declares none**, or does not exist yet → section 3 records the edges `research.md` found in the
  code today and states **`layer order: not decided`**. Propose none.

The second case is most repositories and it is the one that goes wrong. Its rules — what section 3 may
contain, what section 2's `Layer` column says, and what a *later* feature may read out of those rows —
are in `references/section-contract.md` under **Where no layer order is decided**.

**3 · Write `architecture.md`** against the eight sections, in order. Sections 2 and 3 carry the gate's
first two questions — which parts are new, and which dependencies this feature adds — so write them so a
reader answers both without prose archaeology.

**4 · Trace every scenario** into section 5, one row per scenario, keyed by its `acceptance.md` id. A
scenario with no path is a behaviour nothing was designed to handle, and it is far cheaper to find here
than in Verify — cheaper in both directions now that the contract is still a draft, since the fix may be
the structure *or* the scenario. Hand it back to `acceptance-criteria` once, and whatever survives that
single round trip is a section 8 row the person answers at the gate.

**5 · Author `architecture.html`,** self-contained and theme-aware, draw section 3's graph on it as inline
SVG so the person at the gate sees the structure rather than reassembling it from rows, and **splice** the
source block from `architecture.md` — read the file and place its bytes between the tags. **Never retype it.** A copy that
was typed rather than spliced is already drifting while looking exactly like one that is not.

**6 · Run the comparison** in `references/section-contract.md`. It is a byte comparison, not a reading —
`0` clean, `1` drifted, `2` no block at all. Run it again after any later edit to either file, including
one that only fixes a typo.

**7 · Hand it to the gate.** `spec-review` hardens both files and re-runs the comparison; then the person
reads the page and signs this file and `acceptance.md` together. Nothing an agent does flips `status:`.

### Never scaffold the repository map

`ARCHITECTURE.md` is written by the **first feature that runs this pass**, never by repository setup. An
empty one asserts a layering nobody chose, and a reader cannot tell an unfilled template from a decided
structure — the same reason `docs/design.md` is written by the first user interface built in a repository
rather than seeded with the substrate.

A fresh repository therefore has no structure map, and that is the correct state. What setup owes the
reader is the **name**: the entry point says what `ARCHITECTURE.md` is and who writes it, so its absence
reads as "not yet decided" rather than "missing".

## Rationalizations

| The excuse | Why it does not hold |
|---|---|
| "The structure is obvious from the PRD." | Then section 2 costs ten minutes. What is obvious to you at the gate is not in the repository, and the next agent reads the repository. |
| "`acceptance.md` is still a draft, so I will wait until it is signed." | Waiting is what used to put the structure downstream of a contract nobody had traced. Trace the draft: the two are signed together, so a scenario that traces through nothing can still be fixed instead of bent around. |
| "I will write the page once the code lands." | Then nobody signed anything. The artifact exists to be agreed *before* the plan; written afterwards it is a description of what got built. |
| "This repository has no declared layering, so I will propose one — somebody has to." | Not inside a feature's spec. Record what the code does, write `layer order: not decided`, and put the question to the person in section 8. A layer order chosen here makes one feature's convenience the repository's constitution. |
| "The edges already in the map tell me what is allowed." | Only where an order was decided. Where the map says `layer order: not decided`, those rows are observations of what the code does, and an observation grants nothing. |
| "Retyping the markdown into the page is the same as splicing it." | It is the exact drift the block exists to catch, and it looks identical until the day it does not. Splice the bytes. |
| "The check passed last time, so the page is fine." | It compares the two files as they are now. Every edit to either invalidates the last result. |
| "I will write section 5 from the PRD's stories." | Stories are not the oracle. Verify grades scenarios by id, and section 5 is what makes each one's path through the structure checkable. |

## Red flags

Each of these means the pass is being violated, not merely that a file is untidy.

- Section 3 states a layer order the repository never decided — or section 2 numbers modules into tiers,
  which decides one without saying so.
- A scenario has no row in section 5, or a section 5 row names no scenario in `acceptance.md`.
- Section 5 rows keyed by feature or story name instead of `acceptance.md` ids.
- An edge in section 3 with an empty `Decision` cell.
- The page's source block differs from the file in whitespace or line wrapping only — the tell of a block
  that was retyped.
- `ARCHITECTURE.md` created by anything other than a feature running this pass, or created empty.
- A `see ADR-NNN` in the artifact pointing at no file under `docs/adr/`.
- A seam in section 4 with one adapter.
- A section 6 row this pass decided rather than cited, or a section 8 question it answered on its own.
- The page pulls a font, a stylesheet, or a script from a remote host.

## Verification (ending criteria)

The pass is finished when all of these hold, each checked rather than assumed:

- The eight headings are present and in order, in every file written.
- **Set equality on section 5.** Every `acceptance.md` scenario id appears exactly once, and no row names
  an id that is not there. Extract both lists and compare them; a read-through is what misses the one in
  the middle.
- Every section 3 edge cites a decision id, an `ADR-NNN` that resolves to a file under `docs/adr/`, or
  `default — not contested`; or section 3 states `layer order: not decided` and its rows are the edges
  `research.md` recorded.
- Every section 7 invariant names what checks it today — including `nothing`, where nothing does.
- **Section 3's Mermaid block and its table say the same thing**, and the page's SVG says it a third time:
  one arrow per row, one row per arrow, same node names. Compare the three as sets rather than reading
  them — a diagram that quietly disagrees with the table is worse than no diagram, because a reader
  believes the picture.
- **The comparison returns `0`, and you have watched it fail.** Drift one byte in `architecture.md`
  without re-splicing, confirm `1`; delete the block, confirm `2`. A check you have only ever seen pass is
  not known to work, and the two failures have to be distinguishable because they have different fixes.
- The page opens from a fresh clone with the network off and renders in both light and dark.
- `status:` still reads `unsigned`. A person flips it, at the gate, after reading the page.

## Outputs & handoff contract

**Writes** — three files, and this skill is the only one that writes any of them:

- **Creates `ARCHITECTURE.md`**, and only where the repository has none. The first feature to run this
  pass writes it; nothing scaffolds it and nothing creates it empty.
- **Creates `docs/features/<slug>/architecture.md`** — the feature's structural delta, eight sections.
- **Creates `docs/features/<slug>/architecture.html`** — committed beside the markdown, self-contained,
  its source block spliced from that file.

**Reads** — `acceptance.md` (draft or signed), `research.md`, `prd.md`, `docs/adr/`, `CONTEXT.md`, and
`ARCHITECTURE.md` where the repository has one.

**Never edits** `acceptance.md`, `prd.md`, or any signed artifact. A scenario that traces through nothing goes back to
`acceptance-criteria`, which owns that file; a structure that still will not fit after that round trip is
a section 8 row for the person at the gate, never a reason to reword the contract.

**Read next by** `spec-review`, which hardens both files, re-runs the comparison, and resolves the ADR
citations; then the person at the gate. `plan-breakdown` reads `architecture.md` afterwards, so the
slices are cut against a structure somebody agreed to rather than one the planner inferred.
