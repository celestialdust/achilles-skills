---
description: Turn the spec into a concrete plan — codebase-research first, then plan-breakdown into vertical slices and a dependency DAG.
---

Invoke the **plan-breakdown** skill — the planner that turns the locked spec into vertical slices and a dependency DAG. Run **codebase-research** first so the plan is grounded in the codebase as it actually is.

## Mode

Plan is **human-led** — the human owns Ideate, Spec, and Plan. This command produces a plan for review; it does NOT write code. It terminates at a human gate, then hands off downstream.

## Process

1. **codebase-research first** — dispatch `codebase-research` for a goal-blind, parallel map of the codebase/DB as-is. Write `research.md`. Ground the plan in reality, not assumptions.
2. **plan-breakdown** — slice the work vertically (one complete path per slice, not horizontal layers), order the slices into a dependency DAG, and give each slice acceptance-anchored done-criteria. Pull in `codebase-design` (deep-module interfaces) and `api-design` (contract-first) as referenced disciplines wherever a slice defines a new module or interface.
3. Present the plan + DAG for human review. Write `plan.md`.

## Notes

- Requires the locked spec artifacts (`prd.md`, `acceptance.md`). If none exist, stop and tell the user to run /spec first — do not invent requirements.
- `plan.md` is the handoff to **/implement** (one thin slice at a time) or **/orchestrate** (the autonomous wave-parallel DAG runner to open draft PRs). Plan itself stays read-only.
