---
description: Turn the spec into a concrete plan — reuse the Spec-stage survey, then plan-breakdown into vertical slices and a dependency DAG.
---

Invoke the **plan-breakdown** skill — the planner that turns the locked spec into vertical slices and a dependency DAG. It is grounded in `research.md`, the goal-blind survey **already written during /spec**. Do not re-survey by default.

## Mode

Plan is **human-led** — the human owns Ideate, Spec, and Plan. This command produces a plan for review; it does NOT write code. It terminates at a human gate, then hands off downstream.

## Process

1. **Reuse the Spec-stage survey.** `research.md` already exists — `codebase-research` ran at the head of /spec so the ADRs were decided against the codebase as-is. `plan-breakdown` reads that same file; it requires it and will refuse without it. Run `codebase-research` a second time **only against a gap you can name**: state what you are looking for and why the Spec-stage survey did not cover it, and keep that statement with the work. Plan legitimately needs ground Spec had no reason to record — existing test seams, module boundaries, the exact prior art a slice will extend — and a real gap names itself in one sentence. A second survey with no stated gap is refused: without that clause "run it again" becomes the default and the suite is back to surveying the same repository twice.
2. **plan-breakdown** — slice the work vertically (one complete path per slice, not horizontal layers), order the slices into a dependency DAG, and give each slice acceptance-anchored done-criteria. Pull in `codebase-design` (deep-module interfaces) and `api-design` (contract-first) as referenced disciplines wherever a slice defines a new module or interface.
3. Present the plan + DAG for human review. Write `plan.md`.

## Notes

- Requires the locked spec artifacts (`prd.md`, `acceptance.md`) and `research.md` from /spec. If none exist, stop and tell the user to run /spec first — do not invent requirements, and do not paper over a missing survey by running one here.
- Reads the signed structure too — this feature's `architecture.md` and, where the repository has one, `ARCHITECTURE.md`. Slices sit inside the modules and behind the seams those name; a plan that moves a boundary a person signed at the Spec gate does so in the open or not at all.
- `plan.md` is the handoff to **/implement** (one thin slice at a time) or **/orchestrate** (the autonomous wave-parallel DAG runner to open draft PRs). Plan itself stays read-only.
