---
description: "Ship the change — open a risk-banded draft PR via pull-request. The shipping-and-launch release runbook follows on the far side of the human's merge. Never auto-merges."
---

Invoke the **pull-request** skill as the spine of this stage. **shipping-and-launch** follows once the human has merged.

Ship is the terminal stage of Ideate → Spec → Plan → Implement → Verify → Review → Ship.

## Process

1. **pull-request** — open a per-slice, design-anchored **draft** PR with the read-the-code checklist and a risk band, anchored to the diff and the upstream design (`prd.md` + ADRs, `acceptance.md`, `qa.md`).

That is the whole of this command. The stage terminates at the open draft PR.

## After the human merges

**shipping-and-launch** is the other half of Ship, and it is deliberately *not* a step of this command. One slice's draft PR is not a release, so a release runbook cannot gate it and `pull-request` does not read one. Once the human merges, run **shipping-and-launch** to produce `release.md`: the pre-launch checklist, the staged rollout, monitoring, and the rollback plan. It is **release-level, not per-slice** — it batches the slices that ship together, so it fires once per release rather than once per PR. The agent authors the runbook; the human runs every deploy / rollout / rollback step in it.

## Mode

Ship is **agent-run** and **autonomous** — the agent owns Implement → Ship. It never pauses mid-stage to ask whether to continue. It can still stop, on what **pull-request** actually checks: it opens no PR unless the verify gate is green and the review fan-out is clear, and it hard-halts on a security CRITICAL/HIGH finding or a secret in the diff. High-risk work does not stop the stage — it raises the PR's **risk band** for the human at the merge gate. The terminal artifact is a **risk-banded open draft PR** left for async human merge. **Never auto-merge to main** — the human owns the merge decision.

## Notes

- Upstream: requires a slice that has cleared /verify and /review. Do not ship un-verified or un-reviewed work.
- The PR's risk band carries the blast-radius signal (auth, payments, data, secrets, or irreversible ops raise the band) so the human can triage the merge queue.
- In a full autonomous run, /orchestrate drives this same Ship stage per slice across the wave-parallel DAG, terminating at the same risk-banded draft PRs; /ship is the single-slice entry point to it. Neither writes the release runbook — that is post-merge work.
- Ship never deploys, and it does not write the release runbook. The runbook, the deploy, the staged rollout, and any rollback all sit on the far side of the human's merge. The agent's span ends at the open draft PR, so nothing in this stage waits on a merge — the run terminates there and a person picks it up.
- Keep the Ship → human-merge handoff exact: the open draft PR is the contract. The rollback plan belongs to the release that follows the merge, not to the PR body.
