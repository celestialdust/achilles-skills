---
description: Retrieval practice that makes understanding honest — about five medium-difficulty questions, one at a time, graded before the answer is revealed, recorded in the learning ledger. Never a gate.
---

Quiz — standalone; it blocks no merge, stage or run.

Run `comprehension-quiz`. With a fresh `literate-explainer` artifact in view it quizzes that artifact
and ties the session to its manifest entry. With none, it requizzes: weak or stale durable concepts
drawn from that workspace's ledger and glossary, and only those.

About five medium-difficulty questions, one per message, each answer graded before the correct one is
revealed — which is what makes the result honest rather than flattering.

Emits one appended line in `~/.achilles/comprehension/<repo-key>/ledger.jsonl`, `completed` or
`abandoned`, and nothing at all inside the target repo.

The turn protocol, the ledger fields and the derived measures live in the skill.
