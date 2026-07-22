---
description: Retrieval practice that makes understanding honest — about five medium-difficulty questions, one at a time, graded before the answer is revealed, recorded in the learning ledger. Never a gate.
---

Invoke the `comprehension-quiz` skill.

Standalone — not a lifecycle stage, and it blocks nothing. Two entry cases:

1. **Fresh explainer in view** — a `literate-explainer` artifact was emitted earlier in the session: quiz
   that explainer, and tie the session to its manifest entry.
2. **Standalone (no fresh explainer)** — run the **requiz**: draw weak or stale durable concepts from the
   learning ledger and learner glossary, and test only those.

## Notes

- Honesty is structural: one question per turn, the learner's answer graded before the correct answer is
  revealed, the session recorded as one line in the learning ledger (`completed` or `abandoned`).
- It is an honest self-check, never a gate — it does not block any merge, stage, or `/orchestrate` wave.
- The turn protocol, the ledger line format, and the derived measures live in the `comprehension-quiz`
  skill and the workspace format reference — this command is a thin entry point, not a restatement.
