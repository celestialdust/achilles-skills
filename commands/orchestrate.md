---
description: Run the build AFK — the autonomous wave-parallel DAG executor that drives every slice through Implement → Verify → Review → Ship, ending at risk-banded open draft PRs. Never auto-merges.
---

Invoke the **orchestrator** skill — THE autonomous wave-parallel DAG runner. It reads the whole board, sorts the slice DAG into topological waves, runs each wave's ready slices in parallel (one worktree per slice, disjoint files only), and ends the run at risk-banded OPEN draft PRs for async human merge.

## Mode

Fully autonomous — this is the agent-owned span (Implement → Verify → Review → Ship). The human owns Ideate, Spec, and Plan upstream; once those are signed, this runs the build with **no mid-run human halt** and **never auto-merges to main**. Sequential execution is just the degenerate case (a wave of one) — still gets a worktree, the gates, and the TERMINAL barrier.

Per ready slice, the orchestrator drives the same loop /implement, /verify, and /review expose as commands: `incremental-implementation` (applies `test-driven-development`) → `quality-verification` → Review fan-out (`code-review` + `code-simplification` + `security-and-hardening` + `performance-optimization`, each fresh code-cold) → evaluator floors → `pull-request` (DRAFT).

## Notes

- **Refuses to run** unless: `STATE.md` holds a `feature: building` with a slice DAG (`Blocked by` column), `preflight-readiness` verdict is GREEN, and the signed `acceptance.md` + `plan.md` slices (with file-ownership) exist. Missing any → stop; the human finishes Spec/Plan first.
- Frozen artifacts (`acceptance.md`, RED tests, each slice's `Regression surface`) are immutable under retry — weakening a gate to go green is a HALT, not a pass.
- Terminal state is an OPEN, gates-green, risk-banded PR on the cluster branch. Auto-deploy is out of scope; the human merge is the surviving downstream gate.
