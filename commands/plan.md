---
description: Turn the spec into a concrete plan — survey again against the aspect the signed decisions point at, then plan-breakdown into vertical slices and a dependency DAG.
---

Plan — human-led: survey again, then cut slices.

1. `codebase-research`, second pass — scoped to the aspect the signed decisions now point at, and named
   as that aspect. It appends `## Plan pass — <aspect>` to `research.md`; the pass-1 axis files'
   `## Walked` sections say what was already searched.
2. `plan-breakdown` — vertical, demoable slices, each with owned disjoint files, a regression surface
   and one observable checkpoint, ordered by a `Blocked by` DAG. It elaborates the decisions already
   recorded rather than reopening them.

Emits `plan.md` (cap 1,200 words — the map and the slice table), one `plan/<slice-id>.md` of concrete
steps per slice, and the feature's block and slice rows on `STATE.md`.

Plan writes no code. Hand off to `/implement` for one slice, or `/orchestrate` for the whole DAG.
