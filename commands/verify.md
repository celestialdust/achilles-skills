---
description: Prove a finished slice actually works — a fresh, code-cold, maker≠checker pass against the signed acceptance scenarios and the design reference.
---

Verify — the code-cold grade of a finished slice.

Run `quality-verification` in a fresh subagent that never saw the maker's context
([safety-rails](../references/safety-rails.md), *Code-cold dispatch*), over the slice named or the row
sitting at `verify`.

It exercises every acceptance scenario id this slice realizes against the running app — happy,
error/edge and security-observable — driving whatever renders through `browser-testing-with-devtools`,
and grades each named state of the design reference `prd.md` points at, plus the mechanical floor of
[accessibility-checklist](../references/accessibility-checklist.md).

Emits `docs/features/<slug>/qa.md`, cap 600 words: a ledger by scenario id with its evidence and status,
the design gate, and one `pass · concerns · block` verdict.

A pass advances the slice to `review`, never to `done`. An `exercised-fail` routes to
`debugging-and-error-recovery`, then re-verifies that id.
