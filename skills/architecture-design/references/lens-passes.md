# Grading the structure — the two lens passes

Two sweeps over a written `architecture.md`, each run by a fresh agent that did not write it. `SKILL.md`
carries the method and `section-contract.md` the format; this carries the grading.

Sections referenced below: §1 Requirements, §2 High-level design, §3 Deep dive, §4 Scale and reliability,
§5 Trade-offs, §6 Open questions.

## What both are given, and what neither may do

Each gets `architecture.md` and `research.md`. Nothing else — not the conversation that produced the
structure, not the author's reasoning.

Neither may:

- **Edit any file.** Both are read-only. A finding that would change §2, §3 or §4 is a question for the
  person.
- **Decide.** A finding names what is wrong and recommends an answer. It never resolves one.
- **Raise what §5 already cites.** Those are decisions the person took during `spec-grilling`. Put one to
  them twice and §6 fills with questions they have already answered, which is how a section stops being read
  to the bottom.

## Sweep 1 — depth

`codebase-design`'s lens, over §2's components and §3, with §2's data flow as evidence.

**D1 · A component no data-flow row traverses.** No scenario needed it, so nothing in the signed behaviour
asks for it to exist. The deletion test answers itself here: name what would reappear across callers if it
went, or recommend it go.

**D2 · Two components whose data-flow paths never vary independently.** Every scenario reaching one reaches
the other, same order, every time. Either they are one component, or the boundary is somewhere other than
where a caller would ever cut. Say which you believe and why.

**D3 · A `Responsibility` cell holding two reasons to change** — joined by "and", "also", or a comma. The
column asks for one because that is what decides whether a later diff touches one component or two.

**D4 · Walk two rules nothing else walks.** Both are already written; what is new is that something walks
them. A rule nothing walks holds only when the author happened to remember it.

- **The deletion test, on every component row.** `Responsibility` should carry that test's answer — what
  reappears across which callers — rather than its verdict.
- **The never-pin rule, on every §3 row.** A row reading "`tokens(id uuid pk, expires_at timestamptz)`" pins
  during Spec what a person at the gate cannot check and gives `plan-breakdown` a second source for one
  fact. Name the row and the shape it pinned; recommend the decision it should have named instead.

## Sweep 2 — interface

`api-design`'s lens, over §2's API contracts and §5.

**I1 · A consumer with no recorded contract** — `What it may depend on` or `Decision` empty. Its surface then
gets settled during Implement by whichever slice reaches it first, and the person never sees the choice.

**I2 · A row that contradicts a surface `research.md` already found** — a second error envelope, a second
pagination style, a second way of naming the same thing. The One-Version Rule: consumers pay for the fork,
and the fork is invisible from inside the feature that introduces it.

**I3 · Something observable at the surface that no row says is committed** — ordering, error message text,
the presence of a field, timing. Hyrum's Law: if a consumer can see it, a consumer will depend on it,
whatever the table promises. Name what is observable and recommend whether it is a commitment or should stop
being observable.

## What a finding looks like

Every finding becomes a §6 row, so it must satisfy §6's contract: the question, a **recommended** answer, one
sentence of reasoning, answerable at the gate without opening a skill.

That last clause is the one these sweeps fail. You are running a discipline whose vocabulary the person
signing has not read, so a finding written in it tells them what to conclude and not what they would conclude
it from:

> `store/tokens` is a shallow component and the boundary is misplaced.

Nothing there is actionable by someone who has not read `codebase-design`. Write the fact instead:

> **3.** `store/tokens` is reached by every scenario that reaches `core/reset`, always immediately after it,
> and by nothing else. Recommended: fold it into `core/reset` — a second caller would justify the split, and
> there is no second one yet.

Same finding. The person can disagree with the second one, which is the whole point of putting it to them.

## Handing the findings back

Return findings only. The dispatching pass places them in §6, drops anything §5 already cites, and writes
nothing else. Where you found nothing, return an empty list rather than returning nothing at all.
