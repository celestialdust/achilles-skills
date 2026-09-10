---
description: Front door for a fresh idea — interview to surface intent, then diverge/converge into a framed concept. Produces intent.md.
---

Ideate — human-led, the first stage of the chain.

Run `interview-me`, then `idea-refine`.

1. `interview-me` — one question at a time, each carrying its own guess, until the outcome, the user,
   why now, what success looks like and the binding limit are pinned. It writes
   `docs/features/<slug>/intent.md`.
2. `idea-refine` — widen that idea into variations to react to, converge on one, and pin the
   `## Out-of-scope` list. It refines the same file in place; there is never a second one-pager.

Skip step 1 where the intent is already clear.

Emits `intent.md`, cap 600 words — `## Outcome` · `## User` · `## Why` · `## Success` ·
`## Constraints` · `## Out-of-scope`, the first link in the chain.

Think and frame here; no tasks, no code. `/spec` reads it next.
