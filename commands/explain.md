---
description: Turn a diff (daily) or a whole unfamiliar target repo (onboarding) into a self-contained teaching artifact so you understand code you didn't write. Mode-detecting; pairs with /quiz. NOT code-review, NOT codebase-research.
---

Explain — standalone; it blocks nothing and moves no board row.

Run `literate-explainer`. A diff in view — uncommitted changes, a named branch, a pull request
reference — runs diff mode; pointed at a target repo with no diff it runs codebase mode. An explicit
argument overrides the detection either way.

Emits a self-contained teaching artifact outside the target repo, at
`~/.achilles/comprehension/<repo-key>/<date>-<subject>.html`, cap 2,000 words: background before
mechanics, a tour in reading order, plain enough to re-teach. It also appends one `manifest.jsonl` line
and any new durable term to that workspace's `glossary.md`.

This makes a person understand. Judging a diff for merge is `/review`; mapping the code as it is for a
design decision is `codebase-research`.

Run `/quiz` next to make the understanding honest.
