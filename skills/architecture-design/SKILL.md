---
name: architecture-design
description: Reconciles a feature's structure into an artifact a person signs before any code is planned — `architecture.md` in Anthropic's five-part system-design format (requirements · high-level design · deep dive · scale and reliability · trade-offs) plus a sixth section of open questions, alongside the committed `architecture.html` read at the Spec gate. ALWAYS run this in Spec, once `acceptance.md` exists in draft and before `spec-review`, whenever a feature adds a component, adds a dependency between parts that already exist, or changes what the system must hold to under load — and before anyone plans, breaks down, or implements against a structure nobody wrote down. The artifact is a RECAP of decisions already taken — it traces every scenario through the structure, restates the requirements and the scale posture already decided, and grades what it wrote with two code-cold sweeps whose findings become questions for the person rather than edits. It may do the load arithmetic but never picks the posture. Never invent a layer order nobody decided, never invent a latency or cost target nobody stated, never pin a signature, field list, or schema — those are Plan's — and keep the file inside its 2000-line budget, cutting prose rather than rows.
---

## Purpose

**Stage: Spec — runs once `acceptance.md` exists in draft, before `spec-review`.**

At the Spec gate a person signs behaviour (`acceptance.md`), product (`prd.md`), decisions (`docs/adr/`)
and, for a UI, a look (`design-contract.md`). None of them says whether the structure those decisions imply
carries the behaviour the scenarios promise — a decision record cannot, because it was written before the
scenarios were. This pass is that check, plus a page that answers the gate's questions without the reader
opening a skill.

**The output format is Anthropic's `system-design` framework** — requirements, high-level design, deep dive,
scale and reliability, trade-offs — plus a sixth section this suite adds for what nobody has answered yet.
[`references/section-contract.md`](references/section-contract.md) carries the tables under each heading.

**Everything in it is a recap.** Every row cites where its fact was already settled; where nothing settled
it, the cell says so and the question goes to §6. That is what makes the file signable in one sitting rather
than a design session with a signature at the end.

Tracing alone cannot catch a structure that is consistent and poor — every scenario has a path, every edge
cites a decision, and the components still do not earn their rows. `spec-grilling` grills only the
structural questions somebody noticed were load-bearing, so one nobody thought to ask reaches the gate
unasked. That is why this pass also **grades** what it wrote, code-cold, and puts what that finds to the
person rather than fixing it.

## When to run

Reach for it when a feature adds a component, adds a dependency between parts that already exist, or
changes what the system must hold to under load — and when someone is about to cut slices against a
structure that exists only in their head.

It runs against a **draft** `acceptance.md`, and the two are signed together in one act at the gate, so the
scenarios cannot move between the trace and the signature. Running after `spec-review` instead would make
the one artifact a person signs the one artifact no code-cold reader ever checked.

These belong to other skills; this one references them as methods rather than absorbing them:

| Not this | Whose it is | Where it lands |
|---|---|---|
| interface signatures, schemas, endpoint shapes | `api-design` | `plan.md` |
| deep-module design inside one component | `codebase-design` | `plan.md` |
| the repository's decided look | `frontend-design` | `docs/design.md` |
| one hard-to-reverse decision, written up | `documentation-and-adrs` | `docs/adr/` |

`codebase-design` and `api-design` run in both Spec and Plan and own no artifact — what they produce lands
in a file another skill owns. In step 4 they act as **lenses**: they read §2, §3 and §5, return findings,
and their signatures and field lists still land in `plan.md` and nowhere else.

## Inputs

Refuse to run (fail-safe deny) unless these resolve:

- **REQUIRED — `docs/features/<slug>/acceptance.md`, draft or signed.** Absent → **STOP**, and say
  `acceptance-criteria` is the step that produces it. §2's data flow traces each scenario by id whatever its
  status.
- **REQUIRED — `docs/features/<slug>/research.md`** (from `codebase-research`). §2's edges are what the code
  does **today**, and §1's stack constraints come from here. Without the survey you are writing down what
  you assume the code does, and everything downstream is placed by it.
- **Read — `prd.md`** for scope and §1's functional and non-functional rows.
- **Read — `environment.md`** where it exists, for §1's stack constraints. A constraint nobody wrote down is
  why a later reader mistakes a forced choice for a bad one.
- **Read — `docs/adr/` and `CONTEXT.md`.** Every row cites the record it rests on; terms come from the
  glossary verbatim. A question grilling left open is a §6 row, not a chance to decide it alone.

## The pass

Seven steps. Read `references/section-contract.md` before writing a word; the two sweeps live in
[`references/lens-passes.md`](references/lens-passes.md).

**1 · Take the layer order, or record that there is none.** A layer order is a decision, so it lives in
`docs/adr/`.

- **An ADR declares one** → §2 states which edges it permits, cites the ADR per row, and an edge outside it
  is a §6 question rather than a line to quietly add.
- **No ADR declares one** → §2 records the edges `research.md` found and states **`layer order: not
  decided`**. Propose none. This is most repositories, and the rules for it are in the contract under
  *Where no layer order is decided*.

**2 · Write `architecture.md`** against the six sections, in order. Cite provenance in every row. Two cells
tempt an invented value, and an invented one is indistinguishable from a recalled one:

- **A non-functional target in §1** — a latency, availability, or cost number nobody stated is a promise to
  a user or to whoever pays, handed to the person as though they made it. Write `not stated`, ask in §6.
- **A posture in §4** — scaling direction, a replica, an accepted window of downtime. Do the arithmetic and
  show it, because a calculation is checkable by anyone reading the inputs; the choice that spends money or
  accepts an outage is the person's.

**The file has a budget: 2000 lines**, checked with `wc -l`. Long fails quietly in both directions — a
person at the gate skims, and a downstream agent's window holds part of it without knowing which part is
missing.

Over budget, **cut prose, never rows.** All six sections survive, every data-flow row survives, every edge
row survives. What goes is wording the ADR already holds. If the **tables alone** breach 2000, that is a
fact about the feature — likely two features wearing one slug. Say so in §6 and stay over budget: a trimmed
table reads exactly like a complete one, which is the failure this whole pass exists to prevent.

**3 · Trace every scenario** into §2's data flow, keyed by `acceptance.md` id. A scenario with no path is a
behaviour nothing was designed to handle, and while the contract is a draft the fix may be the structure
*or* the scenario. Hand it back to `acceptance-criteria` **once**; whatever survives is a §6 row.

**4 · Grade what you wrote.** Dispatch both sweeps in `references/lens-passes.md` as fresh, code-cold
subagents in one message, so they run in parallel. Each gets `architecture.md` and `research.md` and
nothing else, returns findings only, and edits nothing.

Merge what comes back into §6 under its second heading, dropping anything §5 already cites. **Never apply a
finding to §2, §3 or §4** — applying one takes a structural decision at the single moment nobody is
watching. Write the heading even when both sweeps return nothing.

**5 · Author `architecture.html`** — self-contained, theme-aware, with §2's component diagram drawn as
inline SVG so the person sees the structure rather than reassembling it from rows. **Splice** the source
block from `architecture.md`: read the file, place its bytes between the tags. A copy that was typed rather
than spliced is already drifting while looking exactly like one that is not.

**6 · Run the comparison** in the contract — a byte comparison, not a reading. `0` clean, `1` drifted, `2`
no block. Re-run after any later edit to either file, including one that only fixes a typo.

**7 · Hand it to the gate.** `spec-review` hardens both files and re-runs the comparison; then the person
reads the page and signs this and `acceptance.md` together. Nothing an agent does flips `status:`.

## Rationalizations

| The excuse | Why it does not hold |
|---|---|
| "`acceptance.md` is still a draft, so I will wait." | Waiting is what used to put the structure downstream of a contract nobody had traced. Trace the draft: they are signed together, so a scenario that traces through nothing can still be fixed instead of bent around. |
| "The edges already in the map tell me what is allowed." | Only where an order was decided. Under `layer order: not decided` those rows are observations, and an observation grants nothing. |
| "No latency target was stated, so I will put a sensible one in §1." | Then the person signs a promise they never made, and it reads exactly like one they did. `not stated` plus a §6 row costs them ten seconds and leaves the number theirs. |
| "The load estimate obviously implies one box, so I will write that in §4." | The estimate is arithmetic and yours; the posture spends money or accepts an outage and is theirs. Show the multiplication, say `not decided`, recommend in §6 — a recommendation they wave through is not a choice made for them. |
| "`Cost paid` is empty because this decision genuinely cost nothing." | Then it was not a trade-off: either the alternative was never real, or the cost is real and you have not found it. Both are §6 rows. |
| "I wrote §2 carefully, so grading it myself is the same thing." | It is the one thing it cannot be. You chose those components, so you cannot find what you were already not seeing — the reason Verify and Review run code-cold is the reason these sweeps do. |
| "This depth finding is obviously right, so I will just fix §2." | Then a structural decision was taken by an agent with nobody watching. The §6 row already carries the recommended answer; let the person spend ten seconds agreeing to it. |
| "I am 300 lines over, so I will trim the data flow to the scenarios that matter." | Every scenario matters; that is what signing `acceptance.md` means. A table missing rows reads exactly like a complete one, so this buys a shorter file by breaking the property the file is checked on. |
| "Retyping the markdown into the page is the same as splicing it." | It is the exact drift the block exists to catch, and it looks identical until the day it does not. |

## Verification

Each of these is **checked, not assumed**, and each one failing means the pass was violated rather than
untidy. The reasons live in `references/section-contract.md`; this is the closing checklist.

**Shape**
- Six headings, present and in order — Anthropic's five, then open questions.
- `wc -l docs/features/<slug>/architecture.md` ≤ 2000, or §6 carries the row saying the tables alone breach
  it. Run the command; length is the one property nobody estimates correctly by looking.
- `status:` still reads `unsigned`.

**§1** — all four non-functional dimensions have a row · every `not stated` has a matching §6 question (grep
for it) · no target appears that no source states.

**§2**
- **Set equality on the data flow:** extract the scenario ids from both files and compare the sets. Every id
  appears exactly once; no row names an id that is not there. A read-through misses the one in the middle.
- Rows keyed by `acceptance.md` id, never by feature or story name.
- Every edge, API-contract and storage row has a non-empty `Decision` — a §5 id, an `ADR-NNN` that resolves
  to a file, or `default — not contested`.
- No layer order the repository never decided, and no tier-numbering that decides one without saying so.
- The API contracts table names every consumer **including those outside the repository** — the ones the
  interface sweep is otherwise blind to.
- **Mermaid block, edge table and the page's SVG all agree** — one arrow per row, one row per arrow, same
  node names. Compare as sets; a diagram that quietly disagrees with the table is worse than none, because a
  reader believes the picture.

**§3** — all five topics have a block (table, or `_n/a — <why>_`) · no row pins a schema, field list,
signature or wire format.

**§4** — every load estimate shows its arithmetic, each input traceable to a §1 row · no posture chosen here
(every one cites a record or reads `not decided` with a §6 row behind it) · every monitoring row names what
emits it today, including `nothing`.

**§5** — every row names a cost (`Cost paid` neither empty nor "none") · every row cited, not decided here ·
every revisit `Trigger` an observable threshold, not a feeling.

**§6**
- Opens with the line the contract requires. `spec-review` cites it as its reason for leaving those rows
  alone, so a §6 missing it loses the protection without anything failing.
- Carries the sweeps' heading even when both found nothing. Whether each ran code-cold is **not** checkable
  here — no artifact records it, and making it a criterion would only invite an attestation to memory.
- Every finding is dropped as already cited in §5 or is a §6 row. None changed §2, §3 or §4 — diff those
  sections against what step 2 wrote.

**The page**
- **The comparison returns `0`, and you have watched it fail.** Drift one byte without re-splicing, confirm
  `1`; delete the block, confirm `2`. A check you have only seen pass is not known to work, and the two
  failures need different fixes.
- No `see ADR-NNN` pointing at a file that does not exist.
- No font, stylesheet or script from a remote host; it opens from a fresh clone with the network off and
  renders in both themes.

## Outputs & handoff

**Writes** — two files, and this skill is the only one that writes either:

- `docs/features/<slug>/architecture.md` — six sections, self-contained. There is no repository-level map to
  inherit from; a decided layer order lives in `docs/adr/`, cited by §2.
- `docs/features/<slug>/architecture.html` — committed beside it, self-contained, source block spliced.

**The two sweeps write nothing.** They return findings, which reach the person as §6 rows and reach nothing
else.

**Reads** — `acceptance.md` (draft or signed), `research.md`, `prd.md`, `environment.md` where it exists,
`docs/adr/`, `CONTEXT.md`.

**Never edits** `acceptance.md`, `prd.md`, or any signed artifact. A scenario that traces through nothing
goes back to `acceptance-criteria`; a structure that still will not fit is a §6 row, never a reason to
reword the contract.

**Read next by** `spec-review`, which hardens both files, re-runs the comparison, and resolves the ADR
citations; then the person at the gate. `plan-breakdown` reads `architecture.md` afterwards, so slices are
cut against a structure somebody agreed to rather than one the planner inferred.
