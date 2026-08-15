---
description: Turn the spec into a concrete plan — survey again against the aspect the signed decisions point at, then plan-breakdown into vertical slices and a dependency DAG.
---

Invoke the **plan-breakdown** skill — the planner that turns the locked spec into vertical slices and a dependency DAG.

## Mode

Plan is **human-led** — the human owns Ideate, Spec, and Plan. This command produces a plan for review; it does NOT write code. It terminates at a human gate, then hands off downstream.

## Process

1. **Survey again, scoped to what the decisions now point at.** `research.md` already exists — `codebase-research` ran at the head of /spec so the ADRs were decided against the codebase as-is, and `plan-breakdown` refuses without it. Run `codebase-research` a **second pass** here, before slicing. That pass is expected, not exceptional, and `codebase-research` gives the structural reason. **Name the aspect** the signed decisions select and keep that statement with the work; that scope is what stops the pass re-walking ground `research.md` already maps, which is refused. Read the `## Walked` section of each pass-1 axis file under `docs/features/<slug>/research/` to see what was already searched — a dead end costs as much to walk twice as once. A different aspect, not a second opinion.
2. **plan-breakdown** — slice the work vertically (one complete path per slice, not horizontal layers), order the slices into a dependency DAG, and give each slice acceptance-anchored done-criteria. `codebase-design` and `api-design` are referenced disciplines, not sequential stages: they own no artifact of their own — what they produce lands in a file another skill owns. Each states where it runs and who dispatches it; there are more dispatch sites than this line could keep true. The structural choices therefore arrive already made and recorded in `docs/adr/`; Plan elaborates them into signatures, field lists and slices rather than reopening them.
3. Present the plan + DAG for human review. Write `plan.md` — the map: goal, an architecture overview pointing at `architecture.md`, the slice table, risks, open questions — plus one `plan/<slice-id>.md` beside it per slice, holding that slice's concrete steps.

## Notes

- Requires the locked spec artifacts (`prd.md`, `acceptance.md`) and `research.md` from /spec. If none exist, stop and tell the user to run /spec first — do not invent requirements, and do not paper over a missing survey by running one here.
- Reads the signed structure too — this feature's `architecture.md`. Slices sit inside the modules and behind the seams those name; a plan that moves a boundary a person signed at the Spec gate does so in the open or not at all.
- `plan.md` + `plan/` is the handoff to **/implement** (one thin slice at a time) or **/orchestrate** (the autonomous wave-parallel DAG runner to open draft PRs). Plan itself stays read-only.
