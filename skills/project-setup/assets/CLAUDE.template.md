<!--
Sections 1-4 adapted from Andrej Karpathy's notes on LLM coding pitfalls, via
https://github.com/multica-ai/andrej-karpathy-skills. Section 5 is achilles-skills' own.
Seeded into this repo by achilles-skills `project-setup` because no CLAUDE.md or
AGENTS.md existed yet.
This is a starting point, not a fixed contract — edit it to fit your project.
-->

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Docstrings Explain the Code, Not the Paperwork

**Write for the developer reading this file. Never substitute a pointer to a spec document for the explanation.**

A docstring reading `Implements US-3`, `see prd.md`, `per plan.md step 2`, or `satisfies acceptance.md AC-7` tells the next reader nothing about what the code does. Those files sit outside the source tree, they move as the feature moves, and a year from now the reader does not know which feature slug to look under — if the directory still exists at all. The code has to carry its own explanation.

Write instead:
- What it does, in terms of its inputs and outputs.
- Why it is built this way, where the reason is not obvious from reading it.
- The invariants it assumes, and the edge cases it deliberately handles.

```python
# Bad — the reader still has to go find out what this does
def expire_tokens(now):
    """Implements PWR-3. See docs/features/password-reset/plan.md step 2."""

# Good — stands on its own
def expire_tokens(now):
    """Delete password-reset tokens whose expiry has passed.

    Swept on a schedule rather than checked at lookup, so a token that is
    never presented still gets cleared. Callers must treat a missing token
    and an expired one identically — this deletes the row outright, so an
    expired token is indistinguishable from one that never existed.
    """
```

One narrow exception: a decision record (`docs/adr/ADR-NNN-*.md`) may be cited **after** the explanation, as provenance for a choice a reader would otherwise be tempted to reverse. ADRs are immutable once written, which is why a citation to one stays true; a feature's working artifacts are not. Even then the docstring has to make sense without following the link.

The test: could a developer who has never opened this project's `docs/` directory understand this code from its docstrings alone? If not, the docstring is not done.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, clarifying questions come before implementation rather than after mistakes, and docstrings explain the logic rather than citing the spec that asked for it.
