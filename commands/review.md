---
description: Review stage — code-review, code-simplification, security-and-hardening and performance-optimization dispatched code-cold in parallel over the diffs under review. A floor, not a list. Reports findings; never merges.
---

Review — code-cold, before any pull request opens.

Dispatch each skill itself as its own fresh subagent, in parallel, over the union of the diffs under
review ([safety-rails](../references/safety-rails.md), *Code-cold dispatch*): `code-review` — five axes,
test quality inside readability — with `code-simplification`, `security-and-hardening` and
`performance-optimization`. No role is played on top of the skill.

Those four are a floor. A fact about the diff adds a reviewer — a caller outside it that breaks
(`api-design`), a rename that strands one (`deprecation-and-migration`), changed pipeline configuration
(`ci-cd`), a new error or outbound path emitting nothing (`observability-and-instrumentation`) — and no
fact removes one.

Emits one ranked, de-duplicated list, Critical → Required → Optional → Nit → FYI, each finding cited
`path:line` and attributed to its owning slice by file, and one `pass · concerns · block` verdict —
`block` being a stop-list item. It edits no code and no test.
