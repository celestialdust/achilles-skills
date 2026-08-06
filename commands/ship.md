---
description: "Ship the change — run the shipping-and-launch pre-launch checklist and rollback plan, then open a risk-banded draft PR via pull-request. Never auto-merges."
---

Invoke the **shipping-and-launch** skill as the spine of this stage, then **pull-request** to open the draft PR.

Ship is the terminal stage of Ideate → Spec → Plan → Implement → Verify → Review → Ship.

## Process

1. **shipping-and-launch** — run the pre-launch checklist, plan the staged rollout, and write the rollback plan. This is the release discipline: confirm the slice is launch-ready before any PR opens.
2. **pull-request** — open a per-slice, design-anchored **draft** PR with the read-the-code checklist and a risk band, anchored to the diff and the rollback plan.

## Mode

Ship is **agent-run** and **autonomous** — the agent owns Implement → Ship. It never pauses mid-stage to ask whether to continue. It can still stop, on what the two skills actually check. **pull-request** opens no PR unless the verify gate is green and the review fan-out is clear. **shipping-and-launch** refuses to run with an unprovisioned `environment.md` or no identifiable rollback path. Both hard-halt on a security CRITICAL/HIGH finding or a secret in the diff. High-risk work does not stop the stage — it raises the PR's **risk band** for the human at the merge gate. The terminal artifact is a **risk-banded open draft PR** left for async human merge. **Never auto-merge to main** — the human owns the merge decision.

## Notes

- Upstream: requires a slice that has cleared /verify and /review. Do not ship un-verified or un-reviewed work.
- The PR's risk band carries the blast-radius signal (auth, payments, data, secrets, or irreversible ops raise the band) so the human can triage the merge queue.
- In a full autonomous run, /orchestrate drives this same Ship stage per slice across the wave-parallel DAG, terminating at the same risk-banded draft PRs; /ship is the single-slice entry point to it.
- Keep the Ship → human-merge handoff exact: the rollback plan and the open draft PR are the contract.
