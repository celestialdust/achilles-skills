---
description: Run the build AFK — the autonomous wave-parallel DAG executor that drives every slice through Implement → Verify → Review → Ship, ending at risk-banded open draft PRs. Never auto-merges.
---

Invoke the **orchestrator** skill — THE autonomous wave-parallel DAG runner. It reads the whole board, sorts the slice DAG into topological waves, runs each wave's ready slices in parallel (one worktree per slice, disjoint files only), and ends the run at risk-banded OPEN draft PRs for async human merge.

## Mode

Fully autonomous — this is the agent-owned span (Implement → Verify → Review → Ship). The human owns Ideate, Spec, and Plan upstream; once those are signed, this runs the build with **no mid-run human halt** and **never auto-merges to main**. Sequential execution is just the degenerate case (a wave of one) — still gets a worktree, the gates, and the TERMINAL barrier.

Per ready slice, the orchestrator runs **Implement → Verify** — `incremental-implementation` (applies `test-driven-development`) → `quality-verification`, both per slice (behavioral acceptance is a per-slice property). Once every ready slice clears Verify, it runs **one aggregate Review fan-out over the whole wave**: the same `code-review` + `code-simplification` + `security-and-hardening` + `performance-optimization` axes (each fresh code-cold), but **once over the union of the wave's diffs** rather than once per slice — the token-cost win. Each finding is attributed to its owning slice by file (the disjoint-file guard makes this unambiguous); a finding sends only its owning slice back to Implement→Verify and re-reviews only that slice. Then **evaluator floors + `pull-request` (DRAFT)** close out each slice.

## Notes

- **Needs** a feature on `STATE.md` carrying **slice rows with a `Blocked by` column**, a GREEN `preflight-readiness` verdict, and the signed `acceptance.md` + `plan.md` slices with file-ownership. The feature reads `feature: plan` on a first run — that is where `plan-breakdown` leaves it — or `feature: building` on a resumed one. **Check for slice rows, not for a token:** a board with no slice rows means Plan is unfinished, and the run says so and stops rather than inventing a DAG.
- **A failing slice gets repaired before it gets reported.** It climbs the orchestrator's *escalation ladder* — the error in context, then root-cause, then a different route to the same signed outcome, then a smaller slice — and halts only when those are spent. Each rung is a different tactic; repeating one does not spend a rung, and an identical failure twice promotes to the next rung rather than ending the slice. What reaches you is what four repairs could not settle, with what each tried.
- Frozen artifacts (`acceptance.md`, RED tests, each slice's `Regression surface`) are immutable under retry — weakening a gate to go green is a HALT, not a pass. The HALT ends that slice, not the run. That holds on every rung: the ladder changes how an outcome is reached, never what the outcome is.
- `docs/design.md`, the repository's decided look, is read-only rather than frozen and is covered by the same rail. Moving it so a built surface matches is the same HALT, retry or not; only `frontend-design` writes that file.
- Terminal state is an OPEN, gates-green, risk-banded PR on the cluster branch. Auto-deploy is out of scope; the human merge is the surviving downstream gate.
