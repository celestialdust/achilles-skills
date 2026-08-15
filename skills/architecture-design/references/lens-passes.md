# Grading the structure — the two lens passes

Two sweeps over a written `architecture.md`, each run by a fresh agent that did not write it. `SKILL.md`
carries the method and `section-contract.md` the format; this file carries the grading.

## What both sweeps are given, and what neither may do

Each is given `architecture.md` and `research.md`.
Nothing else — not the conversation that produced the structure, not the author's reasoning.

Neither may:

- **Edit any file.** Both are read-only. A finding that would change §2 or §3 is a question for the person.
- **Decide.** A finding names what is wrong and recommends an answer. It never resolves one.
- **Raise what §6 already cites.** A row in §6 is a decision the person took during `spec-grilling`. Put
  it to them a second time and §8 fills with questions they have already answered, which is how a section
  stops being read to the bottom.

## Sweep 1 — depth

`codebase-design`'s lens, over §2 and §4, with §5 as evidence.

**D1 · A §2 module that no §5 row traverses.** No scenario needed it, so nothing in the signed behaviour
asks for it to exist. The deletion test answers itself here: name what would reappear across callers if it
went, or recommend it go.

**D2 · Two §2 modules whose §5 paths never vary independently.** Every scenario reaching one reaches the
other, in the same order, every time. Either they are one module, or the seam between them is somewhere
other than where a caller would ever cut. Say which you believe and why.

**D3 · A §2 `Responsibility` cell holding two reasons to change.** Joined by "and", by "also", or by a
comma. The column asks for one reason because that is what decides whether a later diff touches one module
or two.

**D4 · Walk the deletion test on every §2 row, and the two-adapter rule on every §4 row.** Both rules are
already written — the deletion test in §2's contract, the two-adapter rule in §4's. Neither is new. What is
new is that something walks them: a rule nothing walks holds only when the author happened to remember it,
and this sweep is the walk.

## Sweep 2 — interface

`api-design`'s lens, over §3's consumer list and §6.

**I1 · A consumer with no recorded contract.** §3 names who reaches this feature's surface, in the
repository and outside it. §6 records what each may depend on — resource model, single error envelope,
pagination stance, versioning and compatibility stance. A consumer with none of those recorded is one whose
surface gets settled during Implement by whichever slice reaches it first, and the person never sees the
choice.

**I2 · A §6 row that contradicts a surface `research.md` already found.** A second error envelope, a second
pagination style, a second way of naming the same thing. The One-Version Rule: consumers pay for the fork,
and the fork is invisible from inside the feature that introduces it.

**I3 · Something observable at the surface that §6 does not say is committed.** Ordering, error message
text, the presence of a field, timing. Hyrum's Law — if a consumer can see it, a consumer will depend on
it, whatever §6 promises. Name what is observable and recommend whether it is a commitment or should stop
being observable.

## What a finding looks like

Every finding becomes an §8 row, so it has to satisfy §8's contract: the question, a **recommended** answer,
one sentence of reasoning, and answerable at the gate without opening a skill.

That last clause is the one these sweeps fail. You are running a discipline whose vocabulary the person
signing has not read, so a finding written in it tells them what to conclude and not what they would
conclude it from:

> `store/tokens` is a shallow module and the seam is misplaced.

Nothing there is actionable by someone who has not read `codebase-design`. Write the fact instead:

> **3.** `store/tokens` has one adapter, the Postgres repository, and every scenario that reaches it also
> reaches `core/reset` immediately before, in that order. Recommended: fold it into `core/reset` and drop
> the port — a second adapter would justify the seam, and there is no second one yet.

Same finding. The person can disagree with the second one, which is the whole point of putting it to them.

## Handing the findings back

Return findings only. The pass that dispatched you places them in §8, drops anything §6 already cites, and
writes nothing else. Neither sweep writes to `architecture.md` itself. Where you found nothing, return an
empty list rather than returning nothing at all.
