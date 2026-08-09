---
name: architecture-design
description: Produces the structure a person can sign before any code is planned — the repository's `ARCHITECTURE.md`, one feature's `architecture.md`, and the committed `architecture.html` page read at the Spec gate. Use in Spec the moment `acceptance.md` is signed and before `spec-review`, whenever a feature adds a module, adds a dependency between parts that already exist, or introduces a seam — and whenever anyone is about to plan, break down, or implement against a structure nobody wrote down. REFUSES to run without a signed `acceptance.md`, because it traces every signed scenario through the structure. It never scaffolds `ARCHITECTURE.md` into a fresh repository and never invents a layer order the repository has not decided.
---

## Purpose

At the Spec gate a person signs behaviour (`acceptance.md`), product (`prd.md`), decisions (`docs/adr/`)
and, for a user interface, a look (`design-contract.md`). They sign no structure. The disciplines that
describe structure — `codebase-design` and `api-design` — write into `plan.md`, and `plan.md` does not
exist yet at that gate. So the modules, the dependency edges between them, and the seams get settled
during Implement by whoever reaches them first, and nobody ever agreed to them.

This skill closes that gap. It produces a structure a person can read and sign **before any code is
planned**: a repository map, one feature's structural delta, and a page that answers the gate's questions
without the reader opening a skill.

## When to use / when to skip

Use it during Spec, **after `acceptance-criteria` signs `acceptance.md` and before `spec-review`.** That
position is load-bearing in both directions. Section 5 traces every signed scenario through the
structure, so it cannot run before the scenarios are signed; and running it after `spec-review` would
make the one artifact a person signs the one artifact no code-cold reader ever checked.

Reach for it when a feature adds a module, adds a dependency between parts that already exist, introduces
a seam, or is the first feature in a repository whose structure nobody has written down. Reach for it
also when someone is about to break the work into slices against a structure that exists only in their
head.

These belong to other skills, and this one references them as methods rather than absorbing them — a
method for designing one component and a map of the whole repository change for different reasons:

| Not this | Whose it is | Where it lands |
|---|---|---|
| interface signatures, schemas, endpoint shapes | `api-design` | `plan.md` |
| deep-module design inside one component | `codebase-design` | `plan.md` |
| the repository's decided look | `frontend-design` | `docs/design.md` |
| one hard-to-reverse decision, written up | `documentation-and-adrs` | `docs/adr/` |

## Inputs

Refuse-to-run (fail-safe deny) unless these resolve:

- **REQUIRED — `docs/features/<slug>/acceptance.md`, `status: signed`.** `acceptance-criteria` emits it.
  If it is **absent** or **`status: draft`** → **STOP**, and say that `acceptance-criteria` is the step
  that produces it. Do not write against the draft and re-check later: section 5 traces each signed
  scenario by id, so a scenario that is still moving takes its row with it, and the person would be
  signing a structure against a contract that had not settled.
- **REQUIRED — `docs/features/<slug>/research.md`** (from `codebase-research`, which `/spec` runs first).
  Section 3 records the dependency edges the code has **today**. Without the survey you would be writing
  down what you assume the code does, which is the one failure a structure document cannot recover from,
  because everything downstream is placed by it.
- **Read — `docs/features/<slug>/prd.md`**, for what is in scope.
- **Read — `docs/adr/` and `CONTEXT.md`.** Every edge cites the recorded decision it rests on, and terms
  come from the glossary verbatim rather than being coined here.
- **Read when the repository has one — `ARCHITECTURE.md`.** **No refuse-to-run here.** A repository whose
  layering nobody has decided has no such file, and that is correct rather than missing — nothing
  scaffolds it. Its absence means this feature is the first to run a structure pass, so this pass writes
  it.

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
  outside it is a decision this feature has to make and record in section 6, not a line to quietly add.
- It **declares none**, or does not exist yet → section 3 records the edges `research.md` found in the
  code today and states **`layer order: not decided`**. Propose none.

The second case is most repositories and it is the one that goes wrong. The rules for it — what section 3
may contain, what section 2's `Layer` column says, and what a *later* feature may and may not read out of
those rows — are in `references/section-contract.md` under **Where no layer order is decided**. The reason
they are strict: an architecture document that quietly invents a layering is worse than none, because
every later feature inherits an order nobody chose and nobody can point at who chose it.

**3 · Write `architecture.md`** against the eight sections, in order. Sections 2 and 3 carry the gate's
first two questions — which parts are new, and which dependencies this feature adds — so write them so a
reader answers both without prose archaeology.

**4 · Trace every signed scenario** into section 5, one row per scenario, keyed by its `acceptance.md` id.
Check it by set equality rather than by reading: pull the ids out of both files and compare the sets. A
scenario with no path through the structure is a behaviour nothing was designed to handle, and it is far
cheaper to find here than in Verify.

**5 · Author `architecture.html`,** self-contained and theme-aware, and **splice** the source block from
`architecture.md` — read the file and place its bytes between the tags. **Never retype it.** Two
hand-authored copies of one fact drift, and the embedded copy exists precisely so that drift is catchable;
a copy that was typed rather than spliced is already drifting while looking exactly like one that is not.

**6 · Run the comparison** in `references/section-contract.md`. It is a byte comparison, not a reading —
`0` clean, `1` drifted, `2` no block at all. Run it again after any later edit to either file, including
one that only fixes a typo.

**7 · Hand it to the gate.** `spec-review` hardens both files and re-runs the comparison; then the person
reads the page and flips `status:` to `signed`. Nothing an agent does flips it.

### Never scaffold the repository map

`ARCHITECTURE.md` is written by the **first feature that runs this pass**, never by repository setup. An
empty one asserts a layering nobody chose, and a reader cannot tell an unfilled template from a decided
structure — which is the same reason `docs/design.md` is written by the first user interface built in a
repository rather than seeded with the rest of the substrate.

A fresh repository therefore has no structure map, and that is the correct state. What setup owes the
reader is the **name**: the entry point says what `ARCHITECTURE.md` is and who writes it, so its absence
reads as "not yet decided" rather than "missing".

## Rationalizations

| The excuse | Why it does not hold |
|---|---|
| "The structure is obvious from the PRD." | Then section 2 costs ten minutes. What is obvious to you at the gate is not in the repository, and the next agent reads the repository. |
| "`acceptance.md` is basically signed." | Basically signed is draft. Refuse, and name `acceptance-criteria`. A structure traced against scenarios that can still move is a structure signed against a moving contract. |
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
- A signed scenario has no row in section 5, or a section 5 row names no signed scenario.
- Section 5 rows keyed by feature or story name instead of `acceptance.md` ids.
- An edge in section 3 with an empty `Decision` cell.
- The page's source block differs from the file in whitespace or line wrapping only — the tell of a block
  that was retyped.
- `ARCHITECTURE.md` created by anything other than a feature running this pass, or created empty.
- A `see ADR-NNN` in the artifact pointing at no file under `docs/adr/`.
- A seam in section 4 with one adapter.
- Section 8 empty on a repository's first structure pass — the questions were answered silently.
- The page pulls a font, a stylesheet, or a script from a remote host.

## Verification (ending criteria)

The pass is finished when all of these hold, each checked rather than assumed:

- The eight headings are present and in order, in every file written.
- **Set equality on section 5.** Every `acceptance.md` scenario id appears exactly once, and no row names
  an id that is not there. Extract both lists and compare them; a read-through is what misses the one in
  the middle.
- Every section 3 edge cites a decision id or an `ADR-NNN` that resolves to a file under `docs/adr/`, or
  section 3 states `layer order: not decided` and its rows are the edges `research.md` recorded.
- Every section 7 invariant names what checks it today — including `nothing`, where nothing does.
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

**Reads** — `acceptance.md` (signed), `research.md`, `prd.md`, `docs/adr/`, `CONTEXT.md`, and
`ARCHITECTURE.md` where the repository has one.

**Never touches** `acceptance.md`, `prd.md`, or any signed artifact. A structure that will not fit the
signed behaviour is a finding for section 8 and the person at the gate, never a reason to reword the
contract.

**Read next by** `spec-review`, which hardens both files, re-runs the comparison, and resolves the ADR
citations; then the person at the gate, who reads the page and signs. `plan-breakdown` reads
`architecture.md` afterwards, so the slices are cut against a structure somebody agreed to rather than one
the planner inferred.
