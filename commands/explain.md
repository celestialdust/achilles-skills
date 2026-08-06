---
description: Turn a diff (daily) or a whole unfamiliar target repo (onboarding) into a self-contained teaching artifact so you understand code you didn't write. Mode-detecting; pairs with /quiz. NOT code-review, NOT codebase-research.
---

Invoke the `literate-explainer` skill. Standalone comprehension suite — no lifecycle gates, nothing blocks, `/orchestrate` untouched.

- **Mode detection.** A diff in view (uncommitted changes, a named branch, or a PR reference) runs **diff mode**; pointed at a target repo with no diff it runs **codebase mode**. An explicit argument overrides detection either way.
- **Boundary.** `explain` makes the *human* understand — not `code-review` (which judges a diff for merge) and not `codebase-research` (the goal-blind survey run at the head of Spec, which Plan then reuses). See the skill's when-to-use table.

## Notes

- Follow-up: run **/quiz** to make the understanding honest — the quiz records the session that makes the next explainer skip what you've proven-known.
