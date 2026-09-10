---
name: architecture-design
description: Draft `architecture.md` in the Spec sitting — six sections recapping the structure the decisions imply, every acceptance scenario traced to a path, then graded code-cold. Run it when a feature adds a component, an edge, or new load. Signatures, field lists and module internals stay with `api-design` and `codebase-design`.
---

# Architecture design

## Purpose

**Stage: Spec.** Principles 1, 3, 6, 8.

The sitting decides the structure; this writes it down. `architecture.md` recaps those decisions in six
sections, every row citing where its fact was settled and every acceptance scenario traced to a path
through the components; a code-cold pass then grades it, and what that finds becomes a §6 question
rather than an edit.

## When to use / when to skip

- A feature adds a component, adds an edge between parts that already exist, or changes the load the
  system carries.
- Someone is about to cut slices against a structure nobody wrote down.
- Inside the sitting, beside `to-prd`, `acceptance-criteria` and `environment-manifest` — one signature
  covers the drafts together, so a scenario cannot move between the trace and the signature.
- Not this: one hard-to-reverse decision written up alone — `documentation-and-adrs`.
- Not this: signatures, field lists, endpoint shapes, a module's internals, slices or the DAG —
  `api-design`, `codebase-design`, `plan-breakdown`, all landing in `plan.md`.

## Inputs

Under `docs/features/<slug>/` unless said otherwise:

- `acceptance.md`, draft or signed — helps: one traced path per scenario id · without it: trace what
  `prd.md` and `intent.md` promise and id them yourself, `derived`
- `research.md` — helps: §2's edges are what the code does today · without it: read the entry points
  and imports, `derived`
- `prd.md` — helps: §1's functional rows and the scope · without it: take scope from `intent.md` or the
  prompt, `derived`
- `environment.md` — helps: §1's stack constraints · without it: read the manifest and lockfile,
  `derived`
- `docs/adr/` and `CONTEXT.md` — helps: each row cites its record, terms verbatim from the glossary ·
  without it: cite the artifact that settled the fact or `default — not contested`, coin no term the
  codebase lacks

A present person is worth at most three questions, and only where the answer changes the shape — a
target, a layer order, a posture that costs money.

## The pass

Read [`references/section-contract.md`](references/section-contract.md) before writing a row: it carries
the columns and the per-section gotchas.

1. **Take the layer order, or record that there is none.** Where an ADR declares one, cite it per edge
   row and make an edge outside it a §6 question rather than a line quietly added. Where none does —
   most repositories — write `layer order: not decided` in those words, fill the edge table from
   `research.md`, and propose nothing, tier numbering included.

2. **Write the header block, then the six sections in order, every row carrying provenance** — a §5 id,
   a resolving `ADR-NNN`, a named artifact, or `default — not contested`. An empty cell means nobody was
   asked, so it becomes a §6 row rather than one filled from judgement. Nothing pins a signature, field list, schema, wire
   format or line number: that settles during Spec what the person signing cannot check.

3. **Write `not stated` for a target nobody stated, and do the arithmetic without picking the posture.**
   Show each load estimate's multiplication, its inputs cited to §1; for the scaling direction, the
   replica and the accepted downtime, cite a record or write `not decided` with a §6 row behind it.

4. **Trace every scenario into §2's data flow, one row per `acceptance.md` id.** A scenario with no path
   is a behaviour nothing was designed to handle; both files are drafts, so hand it to
   `acceptance-criteria` once and let whatever survives become a §6 row.

5. **Grade what you wrote with a code-cold pass.** Dispatch `codebase-design` and `api-design` as fresh
   subagents in one message ([`safety-rails.md`](../../references/safety-rails.md)), each given
   `architecture.md` and `research.md` — not the conversation that produced the structure, not your
   reasoning — and running the checks in [`references/lens-passes.md`](references/lens-passes.md), which
   also carries the shape a finding takes. Merge what returns into §6's second heading, drop
   anything §5 already cites, and apply nothing to §2, §3 or §4. That heading gets written with `_none_`
   under it where both found nothing.

6. **Measure and report.** Run `wc -w` against the 2,000-word cap. Over cap, cut prose and never rows;
   where the tables alone breach it, say so in §6 and stay over.

7. **Leave `status: draft`.** `spec-review` fixes the bundle in place, code-cold; the person signs
   once over the whole bundle, and nothing an agent does flips that line.

## Rationalizations

| The excuse | The reality |
|---|---|
| "Nobody stated a latency target, so §1 gets a sensible one." | The person signs a promise they never made, and it reads exactly like one they did. |
| "The load estimate obviously implies one box, so §4 can say so." | The arithmetic is yours; the posture spends money, so it is theirs. |
| "I wrote §2 carefully, so grading it myself is the same thing." | You chose those components, so you cannot see what you were already not seeing. |
| "This depth finding is plainly right, so §2 can absorb it." | The §6 row already carries the recommended answer; applying it decides for them. |

## Red flags

- A latency, availability or cost figure in §1 that no artifact states.
- Tier numbering or `subgraph` layering in §2 that no ADR decided.
- A scenario id with no data-flow row, or a row naming an id `acceptance.md` lacks.
- A §3 row carrying a column list, a signature or a wire format.
- §2, §3 or §4 edited after the sweeps returned.
- §6 empty, or missing the sweeps' heading.

## Verification

- [ ] The header block and the six headings match the shape in Outputs & handoff, `status:` still
      `draft`.
- [ ] The scenario ids in `acceptance.md` and §2's data flow were extracted from both and compared as
      sets, and the two sets are equal.
- [ ] Every row carries provenance; each cell that would have been empty left a §6 row.
- [ ] The Mermaid arrows and the edge-table rows were compared as sets and match.
- [ ] Every `not stated` cell has a matching §6 row (grepped, not read).
- [ ] §1 has all four non-functional dimensions; §3 all five topics, `_n/a — <why>_` where there is
      nothing of that kind.
- [ ] Nothing pins a signature, field list, schema, wire format or line number.
- [ ] §6 opens with its required line and carries both headings, the second `_none_` if the sweeps
      found nothing.
- [ ] Every value reconstructed from a missing input is marked `derived` where it stands.
- [ ] `wc -w` was run and its number reported against the cap.

## Outputs & handoff

`docs/features/<slug>/architecture.md` — cap **2,000 words**, measured with `wc -w` and reported as over
where it is. Nothing else: the sweeps return findings only, and `acceptance.md`, `prd.md` and the rest of
the bundle stay untouched, since a structure that will not fit is a §6 row rather than a reason to reword
the contract. No board row either; `plan-breakdown` opens the feature's block
([`state-schema.md`](../../references/state-schema.md)).

A fenced header block, then six stable headings:

```
feature:  <slug>
status:   draft
reads:    acceptance.md · research.md · prd.md · environment.md · docs/adr/
```

`## 1. Requirements` · `## 2. High-level design` · `## 3. Deep dive` · `## 4. Scale and reliability` ·
`## 5. Trade-offs` · `## 6. Open questions for the human`. What each holds and its columns:
[`references/section-contract.md`](references/section-contract.md).

Returned in conversation: the path, the word count against the cap, the §6 count, and that the sweeps
ran code-cold. Read next by `spec-review`, then the person who signs, then `plan-breakdown`.
