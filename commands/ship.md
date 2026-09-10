---
description: "Ship the change — open a risk-banded draft PR via pull-request. The shipping-and-launch release runbook follows on the far side of the human's merge. Never auto-merges."
---

Ship — the terminal stage, at one open draft pull request.

Run `pull-request`. It reads the diff, `prd.md` and the ADRs it cites, `acceptance.md` and `qa.md`,
bands the blast radius, and opens a **draft** pull request whose body carries `## Summary` ·
`## Decided for you` · `## Evidence` · `## Risk band`, cap 500 words.

It never merges, never promotes to ready, never deploys. High-risk work raises the band rather than
stopping the stage; a stop-list item ([safety-rails](../references/safety-rails.md)) ends the slice
instead. A person owns the merge.

`shipping-and-launch` is the other half of Ship and follows that merge — once per release, not per
slice. It writes `release.md`: pre-launch clearance, the flag and staged-rollout plan, the thresholds
deciding advance/hold/roll back, the rollback path and the monitoring. It authors the runbook and runs
none of it.
