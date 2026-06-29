---
name: acceptance-criteria
description: 'Turn a prd.md into acceptance.md — the Given/When/Then prose contract that is the SOLE human-anchored oracle for the entire autonomous run. Reach for this the MOMENT a prd.md exists and BEFORE any planning, TDD, or QA — test-driven-development and quality-verification REFUSE to run without a signed acceptance.md. If you are about to write "acceptance criteria", "definition of done", test scenarios, or Given/When/Then for a feature, you need this first. Behavioral-only: keep ALL design floors out (those belong to frontend-design''s contract).'
---

## Purpose

**Stage: Spec (human-led — the agent drafts, the human signs).** `acceptance-criteria` authors one feature's
`acceptance.md`: its observable behavior, written as Given/When/Then scenarios in plain prose.

This is the highest-leverage artifact in the whole suite. Because the agent runs Implement → Verify →
Review → Ship **fully autonomously with no mid-run human halt**, `acceptance.md` is the **SOLE
human-anchored oracle** — the one place a human pins down "what *done* means" before going AFK. `test-driven-development`
realizes each scenario as a RED test; `quality-verification` grades the running app against these scenarios and keeps an
exercised/not-reachable ledger by id; `pull-request` forces a human-ack line for any scenario the run could not
reach. **A behavior you forget to write here is a behavior no gate will ever check.** Completeness is the
job.

It is a **prose contract, not a test framework**: no Cucumber, no step-defs, no `.feature` engine.
Rigid frameworks are anti-boring-tech and brittle on UI; the agent realizes each scenario as a test
through `test-driven-development` **by judgment**. Drift control is the intelligent Verify gate reading `acceptance.md`, not a
mechanical scenario↔test mapping.

## When to use / when to skip

**Use** right after `to-prd` lands `prd.md`, for every feature, before `plan-breakdown`/`test-driven-development`/`quality-verification`. It is
typically the artifact authored alongside (or just after) the PRD in the Spec stage. If you are reaching
for the words "acceptance criteria", "definition of done", or "let me write some test scenarios", you are
in this skill's territory — use it.

**Skip / don't** when:
- the change is a **pure refactor** with zero product-observable behavior change — there is no new
  behavior to pin. (Refactors are still covered by existing scenarios + regression tests.)
- you are tempted to write a **design** scenario ("the button is blue", "the modal slides in", "the focus
  ring is visible"). **STOP** — design floors, rubric, and prototype-fidelity live **wholly** in
  `frontend-design`'s signed design contract. Zero design content enters `acceptance.md`. The two
  signed artifacts must never be able to contradict each other.

**Escape hatch — `depth: lite`:** a one-story feature still writes the happy path **plus at least one
error/edge scenario**. Never zero error coverage; "the happy path is obvious" is the failure mode this
skill exists to prevent.

## Inputs

Refuse-to-run unless these resolve:

- **REQUIRED — `docs/features/<slug>/prd.md`** (from `to-prd`) with a populated **`## User Stories`**
  section (numbered list, `As an <actor>, I want <feature>, so that <benefit>`). The story numbers are the
  ids your scenarios back-reference. If `prd.md` is **absent** or has **no `## User Stories`** → **STOP**
  and send the user to `to-prd`. There is nothing to derive scenarios from.
- Also read (context, not back-referenced): `## Problem` / `## Solution` (to frame the happy paths) and
  `## Out of Scope` (the not-doing boundary — these are **never** scenarios; an out-of-scope item that
  needs a guarantee is a *security-observable* scenario stated as a behavior the system must refuse).

If `STATE.md` / `docs/features/` do not exist, the repo was never set up → run `project-setup` first.

## Process

1. **Read `prd.md` fully.** Note every numbered story id under `## User Stories`. Frame the user-observable
   happy paths from `## Problem` / `## Solution`. Read `## Out of Scope` to know the boundary.

2. **Enumerate behaviors per story — three classes (see below).** For each story, ask: what does the user
   observe when it works? when input/state is wrong? what must the system refuse or protect? Do **not**
   stop at the happy path — error/edge and security-observable are *required classes*, not extras.

3. **Write each behavior as a Given/When/Then scenario, behavioral-only.** Assert *outcomes the user or
   system can observe* — never a file path, signature, table name, library, or design token. Plain prose.

4. **Id every scenario.** Use the feature's PRD namespace + `A` + number: `PWR-A1`, `PWR-A2`, …
   (matching the STATE.md PRD-namespacing). Tag each scenario with the **story id it realizes**
   (`realizes: story 3`). Multiple scenarios may realize one story; every story must have ≥1 scenario.

5. **Set frontmatter `status: draft`. Do NOT sign.** Only the human signs at the Spec gate (`status:
   signed`). If you set `signed` yourself you have forged the oracle (Red flags).

6. **Self-check coverage + the behavioral-only boundary** (Verification below). Every story id → ≥1
   scenario; three classes present where applicable; zero design/impl/engine content.

7. **Present for sign-off.** Hand the human a complete draft. On their sign, `status → draft` becomes
   `signed` and the Spec gate can pass. Note for the human: **editing `prd.md` later re-invalidates
   `acceptance.md` to `draft`** — the contract must be re-signed if the product spec moves.

## The three required scenario classes

Every feature covers these classes (a story may not touch all three, but the feature must):

- **Happy path** — the feature working as intended, the user's main goal achieved. (≥1 per story.)
- **Error / edge** — invalid input, wrong state, boundary values, expiry, concurrency, empty/limit cases.
  The behavior the user observes when things go wrong (clear failure, no data loss, safe state).
- **Security-observable** — behavior a user/attacker can observe that proves a boundary holds: an expired
  token is rejected, an unauthorized actor is refused, a secret never appears in a response, rate limits
  trip. **Observable** only — not "the code uses bcrypt" (that is implementation, and design/threat
  rationale lives in ADRs/`security-and-hardening`, not here).

## Behavioral-only boundary

`acceptance.md` asserts **what is observable**, and nothing else:

- **NO design content** — no color, typography, spacing, layout, motion, focus-ring, pixel, breakpoint.
  All of that is `frontend-design`'s signed design contract (the 5th signed Spec artifact for UI
  features). `quality-verification`'s design gate grades that contract; `acceptance.md` grades behavior. One home each.
- **NO implementation content** — no file path, function/type signature, schema-as-code, table/column
  name, driver or library internal. Scenarios survive a rewrite of the implementation.
- **NO engine** — no `.feature` files, no `@given`/`@when` step definitions, no Cucumber/Behave/SpecFlow.
  Prose only; `test-driven-development` turns prose into tests by judgment.

## Scenario anatomy

```
### PWR-A2 — reset link rejected after expiry        realizes: story 3   class: error/edge
Given a password-reset link issued more than 1 hour ago
When the user opens that link and submits a new password
Then the system refuses the reset and tells the user the link has expired
And the user's existing password is unchanged
```

Keep ids stable once written (downstream `qa.md` ledgers reference them). Append new scenarios with new
ids rather than renumbering.

## Rationalizations

Stop signals disguised as good reasons:

- "I'll just cover the happy path; the errors are obvious." → No. Error/edge is a **required class**, and
  "obvious" failures are exactly where the autonomous run ships silent defects. Enumerate them.
- "This UI scenario needs the button colour / the modal animation." → No. Design lives **wholly** in
  `frontend-design`'s contract. Behavioral-only here — assert what the user *does*, not how it looks.
- "I'll name the function / endpoint path so the test is precise." → No. Outcomes only. Signatures and
  paths go stale and turn the oracle into an implementation mirror; `test-driven-development`/`plan-breakdown` own those.
- "It looks right — I'll mark it `signed`." → No. The **human signs**; `signed` set by the agent forges
  the sole human-anchored oracle. Leave it `draft` and present for sign-off.
- "Cucumber would make this executable." → No engine. Executability comes from `test-driven-development` realizing the
  prose, not from a brittle step-def framework.
- "The PRD has 8 stories but 3 are similar — I'll write 3 scenarios total." → Every **story id** needs
  ≥1 scenario. Coverage is the load-bearing property; thin it and a gate goes blind.

## Red flags

Stop and fix before presenting if any are true:

- A scenario mentions a `/` file path, a `function`/`def`/type signature, a table/column name, or a
  library/driver name. → Strip it; restate as an observable outcome.
- A scenario describes colour, font, pixel, spacing, layout, motion, or focus styling. → Move the intent
  to `frontend-design`'s design contract; delete it here.
- A `.feature` file or step-definition code was generated. → Delete; this is a prose contract.
- Any `## User Stories` id has **zero** scenarios. → The oracle has a hole; add scenarios.
- A feature with risky paths has **only** happy-path scenarios (no error/edge, no security-observable).
- Frontmatter says `status: signed` and no human signed it. → Revert to `draft`; present for sign-off.

## Verification (ending criteria)

Done when ALL hold:

- `docs/features/<slug>/acceptance.md` exists, frontmatter `status: draft` (never `signed` by the agent).
- **Coverage:** every numbered id in `prd.md`'s `## User Stories` is named by ≥1 scenario's `realizes:`
  tag. (This is the completeness invariant `spec-review` re-checks: every story id → ≥1 reachable
  exercised scenario.)
- Every scenario has a feature-namespaced id matching `^### [A-Z]{2,}-A[0-9]+` and a `realizes: story <n>`
  back-reference and a `class:` of happy / error/edge / security-observable.
- The three classes are represented across the feature (happy + ≥1 error/edge + ≥1 security-observable
  where the feature has any boundary to protect).
- **Behavioral-only grep is clean:** no file paths, signatures, schemas-as-code, library internals, or
  design tokens (colour/font/px/layout/motion). No `.feature`/step-def artifacts exist.
- Presented to the human for sign-off; the gate stays `you` until the human flips `status: signed`.

## Outputs & handoff contract

- **Emits:** `docs/features/<slug>/acceptance.md` — per-scenario `id` · `realizes: story <n>` · `class:` ·
  Given/When/Then prose; frontmatter `status: draft → signed`. Change the shape of a scenario id or the
  status field → update its consumers (`test-driven-development`, `quality-verification`, `spec-review`, `pull-request`) in the same commit.
- **STATE.md update:** add `acceptance.md` to the feature's `origin:` line; feature state stays `spec`;
  gate stays `you` (the human signs at the Spec gate). No slice rows yet (slices are born in Plan).
- **Downstream consumers:** `test-driven-development` (realizes each scenario as a RED test, test-first; refuses an
  unsigned/absent contract) · `quality-verification` (grades the running app per scenario, keeps an exercised/not-reachable
  ledger by id in `qa.md`; refuses an unsigned contract) · `spec-review` (checks every story id → ≥1
  reachable scenario before the human reviews) · `pull-request` (any "not-reachable" classification at run time
  → a required human-ack line in the PR body, never silently absorbed).
- **Frozen-under-retry invariant:** once signed, `acceptance.md` is **immutable during a slice's
  retry loop**. A retry diff that weakens or deletes a scenario to make a test pass = gate-erosion **HALT**
  (the reward-hack tripwire). The contract may only change by a fresh human re-sign (e.g. after `prd.md`
  edits re-invalidate it to `draft`).
- **Boundary with `frontend-design`:** design floors/rubric/prototype-fidelity live wholly in its signed
  design contract (the 5th signed Spec artifact for UI features); `acceptance.md` carries zero design
  content. No two signed artifacts can contradict.
