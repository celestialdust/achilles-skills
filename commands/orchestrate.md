---
description: Run the build AFK — the autonomous wave-parallel DAG executor that drives every slice through Implement → Verify → Review → Ship, ending at risk-banded open draft PRs. Never auto-merges.
---

Orchestrate — the whole signed slice DAG, unattended.

Run `orchestrator`. It reads `STATE.md`'s slice rows, sorts them into topological waves, and dispatches
each wave's ready slices in parallel — one worktree per slice, disjoint files only — through
`incremental-implementation`, then `quality-verification` code-cold, per slice. Once the wave clears
Verify it runs one Review fan-out over the union of that wave's diffs, then `pull-request` per slice as
a draft. A barrier holds the wave until every slice is terminal.

It needs slice rows carrying `Blocked by`, and the signed `acceptance.md` and `plan.md` beneath them.

What ends a slice is the stop list ([safety-rails](../references/safety-rails.md)); everything else is
decided, logged, and put in the pull request's Decided-for-you table.

Emits open, risk-banded draft pull requests, the board's `State`/`Gate` cells, and the run report. A
person merges.
