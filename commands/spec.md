---
description: Design the product before any code — survey the codebase, hold one design sitting, then draft a spec bundle the person signs in a single act.
---

Spec — human-led: a goal-blind survey, one sitting, one signature.

1. `codebase-research` — parallel read sub-agents that never see the goal map the code as it is today,
   one axis file each under `docs/features/<slug>/research/`, compressed into `research.md`.
2. `spec-grilling` — the sitting. It grills the design against that survey, records the trade-offs in
   `docs/adr/` and the terms in `CONTEXT.md` as they resolve, and drafts `prd.md`, `acceptance.md`,
   `environment.md` and `architecture.md` unsigned in the same pass, applying `to-prd`,
   `acceptance-criteria`, `environment-manifest` and `architecture-design` as disciplines.
3. `spec-review` — code-cold last: it fixes the draft bundle in place and writes no file.

A feature that decides a look arrives with a design reference — a link or exported screens plus their
named states — that `prd.md` points at.

Emits that bundle as draft. The person signs all of it in one act, then `/plan`.
