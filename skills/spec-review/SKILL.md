---
name: spec-review
description: Use this LAST in the Spec stage, before the human signs off — a fresh code-cold agent that FIXES the spec instead of listing complaints. You MUST run it after spec-grilling/to-prd/acceptance-criteria/environment-manifest (and frontend-design for UI) land and before the Spec gate. It auto-fixes decidable facts (stray file paths/signatures in prd.md, dangling `see ADR-NNN`, non-verbatim CONTEXT terms, placeholders, embedded secrets/commands in environment.md) and applies-then-inline-flags contestable judgment fixes (coverage gaps, ADR-worthiness, one-feature-or-two), handing back a cleaned spec, not a punch-list.
---

## Purpose

**Stage: Spec — the last skill before the human Spec sign-off.** In the autonomy model the
downstream run is fully autonomous: `acceptance.md` (plus the rest of the signed bundle) is the **sole
human-anchored oracle** the agent cannot out-vote. A human reviewing a spec littered with stray file
paths, dangling ADR refs, placeholder TODOs, and coverage gaps burns scarce attention on mechanical
defects instead of the judgment calls only a human can make. `spec-review` is a **fresh, code-cold agent
(maker≠checker)** — never the agent that authored the spec — that **fixes the spec before the human sees
it**: decidable facts are silently corrected; contestable judgment is corrected **and flagged inline**.
The human then reviews a clean spec and spends attention where it counts. The silent-re-authoring risk is
resolved by making judgment changes **visible**, not by withholding the fix.

## When to use / when to skip

**Use:** runs **last in Spec**, after `spec-grilling` (ADRs/CONTEXT.md), `to-prd` (prd.md), `acceptance-criteria`
(acceptance.md), `environment-manifest` (environment.md), and — when the feature has UI — `frontend-design` (the
signed design contract) have all landed; immediately before the human Spec sign-off.

**Skip / boundaries (depth: lite escape hatch):**
- It is **not a third gate.** It signs nothing and blocks nothing; the human still reviews and signs.
- Do **not** skip because "the spec looks clean" — the entire value is a fresh code-cold relational read
  that catches what the author cannot see in their own work.
- For a one-artifact trivial fix with no cross-artifact relation, a single inline pass without the full
  bundle is acceptable — but the **default is the full relational grade** anchored on `intent.md`.

## Inputs

Read the full Spec bundle **in this order — `intent.md` first** (everything is graded *relationally*
against what the user actually asked for):

1. `intent.md` (interview-me / idea-refine) — Outcome · User · Why · Success · Constraints · Out-of-scope.
   **Read first; it is the oracle of intent.**
2. ADRs (`docs/adr/ADR-<NNN>-*.md`) + `CONTEXT.md` (spec-grilling) — referenced design substrate.
3. `prd.md` (to-prd) — Problem · Solution · User Stories · Implementation Decisions · Testing Decisions ·
   Out of Scope.
4. `acceptance.md` (acceptance-criteria) — Given/When/Then scenarios, **behavioral-only**, feature-namespaced ids
   (e.g. `PWR-A1`) back-referencing a story id.
5. `environment.md` (environment-manifest) — typed rows, closed kind enum {env-var|mcp|service|runtime-dep|fixture|
   account}; no value column, no command column.
6. design contract (frontend-design) — **only if the feature has UI**; the 5th signed Spec artifact.

**Refuse to run** if the minimum bundle (`intent.md` + `prd.md` + `acceptance.md`) cannot be resolved —
without `intent.md` there is no oracle to grade against. Missing optional items (ADRs, or the design
contract on a non-UI feature) are soft warnings; proceed. **Run as a fresh, code-cold subagent: the agent
that authored these artifacts must NOT be the one reviewing them** (maker≠checker; cr-evaluator §"Why
this stage exists").

## Process

1. **Dispatch a fresh, code-cold subagent.** No author memory, no conversation history from spec-grilling/
   to-prd. Read the bundle in the order above — `intent.md` first.
2. **Grade relationally.** For each downstream artifact ask: does it deliver what `intent.md` asked for?
   Walk the four classic axes (placeholders · internal consistency · scope · ambiguity) PLUS the
   artifact-boundary rules and the coverage ledger.
3. **Classify every issue** as **Decidable (fact)** or **Contestable (judgment)** — see the split table.
4. **Decidable facts → auto-fix in place**, then re-run the **deterministic re-check** (grep) until it
   converges. Greppable, so it converges cheaply. No inline flag — it was simply wrong.
5. **Contestable judgment → apply your best correction in place too**, but **mark each change inline**:
   `<!-- spec-review: changed X → Y because Z — revert if you disagree -->`. **No loop** — one pass; the
   human is the convergence point.
6. **Hand back the cleaned spec** + write `spec-review.md` (auto-fixes, flagged judgment changes, coverage
   ledger, "open the referenced ADRs" list). Tell the human: review the fixed spec, judgment changes are
   flagged inline, you keep final authority — revert any.

## The fact / opinion split

| Issue | Class | Action |
|---|---|---|
| File path / signature / driver-or-library internal appears in `prd.md` (prd MUST NOT contain these) | **Decidable** | Strip it; re-home to an ADR reference. Re-check: grep `prd.md` for paths/extensions/signatures. |
| Dangling `see ADR-NNN` — referenced ADR file does not exist | **Decidable** | Fix the ref or create the missing ADR pointer. Re-check: cross every `ADR-\d+` in prd.md against `docs/adr/`. |
| `CONTEXT.md` `## Glossary` term used non-verbatim in `prd.md` | **Decidable** | Normalize to the exact `## Glossary` term (prd uses CONTEXT terms verbatim). |
| Placeholder / `TODO` / `TBD` / incomplete section | **Decidable** | Fill from context or remove. |
| Value or command embedded in `environment.md` (no value column, no command column — structurally illegal) | **Decidable** | Remove. If it is a real secret → also a security STOP (see Red flags). |
| `acceptance.md` scenario contains a file path / signature / table (behavioral-only) | **Decidable** | Rewrite as an observable outcome. |
| Acceptance **coverage gap**: a `prd.md` user story or `intent.md` success-criterion with no scenario (every story must map to ≥1 reachable scenario) | **Contestable** | Draft the missing scenario; **flag it inline**. |
| **ADR-worthiness**: a hard-to-reverse ∧ surprising decision buried in prd prose instead of an ADR | **Contestable** | Propose extracting an ADR; **flag**. |
| **One feature or two**: `intent.md` describes two independent subsystems crammed into one spec | **Contestable** | Propose the split; **flag**. |
| Internal contradiction between `prd.md` and an ADR or `acceptance.md` | **Contestable** | Reconcile to one side; **flag the chosen side**. |

## ADR-open check (risk mitigation / handoff)

Design now lives in **referenced** ADRs that the single Spec gate does not name — so the gate could
rubber-stamp design it never opened. `spec-review` closes that gap: verify every `see ADR-NNN` in `prd.md`
(a) resolves to a real ADR file (decidable) and (b) was surfaced inline by `to-prd`; then put the full list
of referenced ADR ids into `spec-review.md` under `## Open the referenced ADRs` so the human opens each at
the gate. ADR cross-refs are immutable once written — rename/supersede → update referrers in the same commit.

## Rationalizations

- *"The spec looks clean, I'll skip the relational pass."* → The whole value is a fresh code-cold read;
  the author can't see their own gaps. Do the full grade against `intent.md`.
- *"I'll just list the issues for the human."* → No. Hand back a **cleaned spec, not a punch-list**.
  Apply the fix.
- *"This judgment call is too risky to change."* → Apply your best correction **and** flag it inline; the
  human reverts if they disagree. Withholding the fix IS the failure mode.
- *"I'll loop on the judgment fixes until they're perfect."* → No loop on contestable items — the **human**
  is the convergence point. Only decidable facts get the deterministic re-check loop.
- *"I wrote this spec, I can review it."* → maker≠checker. A fresh code-cold agent reviews, never the author.

## Red flags

- You are the agent that authored the spec → **STOP**; dispatch a fresh code-cold subagent.
- You are producing a list of complaints instead of edits → **STOP**; fix in place.
- You are looping on a judgment call → **STOP**; one pass, flag, move on.
- You silently re-authored a contestable section with no inline flag → **STOP**; every judgment change
  must be visible.
- `intent.md` is absent → **refuse to run**; there is no oracle to grade against.
- An embedded value in `environment.md` looks like a real, committed secret → remove it from the manifest
  AND treat the exposure as a security STOP per `security.md` (hard halt + surface to the human).

## Verification (ending criteria)

Done when ALL hold:
- Every **decidable** check greps clean: no file paths/signatures in `prd.md`; no dangling `ADR-NNN`; no
  non-verbatim `## Glossary` terms; no placeholders/TODO/TBD; no value/command in `environment.md`; no
  behavioral-only violations in `acceptance.md`.
- Every **contestable** change is applied **and** carries an inline `<!-- spec-review: … -->` flag.
- Every `acceptance.md` scenario id back-references a story id, and every story / `intent.md`
  success-criterion maps to ≥1 scenario (coverage ledger has no orphan story).
- `spec-review.md` written with the four stable sections, including `## Open the referenced ADRs`.
- The bundle is handed back **cleaned** (not a punch-list); the human is told judgment changes are flagged
  and they keep final authority.

## Outputs & handoff contract

- **Emits — fixed spec:** the bundle artifacts (`prd.md`, `acceptance.md`, `environment.md`, `CONTEXT.md`,
  ADRs) edited in place; decidable facts silently corrected, contestable judgments corrected + inline-flagged.
- **Emits — `spec-review.md`:** ephemeral, **OUT of the resume-spine** (not a chain link). Stable
  sections: `## Auto-fixed (facts)` · `## Flagged (judgment — revert if you disagree)` · `## Coverage
  ledger` (scenario↔story map + any not-reachable classification) · `## Open the referenced ADRs`.
- **Not a gate:** `spec-review` does **not** flip STATE.md feature state. The human Spec sign-off does that
  (feature `spec → plan`); `spec-review` runs immediately before it.
- **Stable-section discipline:** it reads consumer artifacts' stable sections (per the registry) and edits
  those sections in place — it never invents a new artifact or a new stable section.
