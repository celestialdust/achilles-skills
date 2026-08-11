---
description: Turn the spec into a concrete plan — survey again against the aspect the signed decisions point at, then plan-breakdown into vertical slices and a dependency DAG.
---

Invoke the **plan-breakdown** skill — the planner that turns the locked spec into vertical slices and a dependency DAG.

## Mode

Plan is **human-led** — the human owns Ideate, Spec, and Plan. This command produces a plan for review; it does NOT write code. It terminates at a human gate, then hands off downstream.

## Process

1. **Survey again, scoped to what the decisions now point at.** `research.md` already exists — `codebase-research` ran at the head of /spec so the ADRs were decided against the codebase as-is, and `plan-breakdown` refuses without it. Run `codebase-research` a **second pass** here, before slicing. That pass is expected, not exceptional: the Spec survey is goal-blind by construction, so it mapped what the *intent* implied, and then `spec-grilling` chose a direction that points at code it had no reason to open — the adapter the approach plugs into, the migration path an ADR assumed, the line ranges a step will edit. **Name the aspect** the signed decisions select and keep that statement with the work; that scope is what stops the pass re-walking ground `research.md` already maps, which is refused. A different aspect, not a second opinion.
2. **plan-breakdown** — slice the work vertically (one complete path per slice, not horizontal layers), order the slices into a dependency DAG, and give each slice acceptance-anchored done-criteria. `codebase-design` and `api-design` are referenced disciplines, not sequential stages: they run in **Spec and Plan** — `spec-grilling` dispatches them in Spec to propose a structural variant, `plan-breakdown` reaches for them in Plan to pin the interface into `plan.md` — and they own no artifact of their own, because what they produce lands in a file another skill owns. The structural choices therefore arrive already made and recorded in `docs/adr/`; Plan elaborates them into signatures, field lists and slices rather than reopening them.
3. Present the plan + DAG for human review. Write `plan.md`.

## Notes

- Requires the locked spec artifacts (`prd.md`, `acceptance.md`) and `research.md` from /spec. If none exist, stop and tell the user to run /spec first — do not invent requirements, and do not paper over a missing survey by running one here.
- Reads the signed structure too — this feature's `architecture.md` and, where the repository has one, `ARCHITECTURE.md`. Slices sit inside the modules and behind the seams those name; a plan that moves a boundary a person signed at the Spec gate does so in the open or not at all.
- `plan.md` is the handoff to **/implement** (one thin slice at a time) or **/orchestrate** (the autonomous wave-parallel DAG runner to open draft PRs). Plan itself stays read-only.
