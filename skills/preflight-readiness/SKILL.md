---
name: preflight-readiness
description: Environment-readiness gate that blocks an autonomous wave until every environment.md manifest row is provisioned — runs at the human→AFK boundary right after environment.md is signed and BEFORE the orchestrator dispatches slice one. Probes every manifest row with a read-only, value-blind prober and REFUSES to start the wave on any red or un-attested amber — never optimistically. Re-fire mid-run as a side-effect-free stall-recovery probe. Invoke whenever you are about to start, resume, or unblock an autonomous run, or whenever slices are failing in ways that smell like missing environment.
---

## Purpose

Stage: **cross-cutting gate** — the entry condition on the orchestrator's first wave barrier.

The autonomous run (D29) happens while the human is AFK. If the environment is not
provisioned, every slice fails the same way and burns the entire per-slice retry budget
(2/gate, 3 cycles/slice) on a problem no code change can fix. preflight exists to convert
"the environment is not ready" from a silent mid-run cascade into **one up-front go/no-go
with an actionable checklist**.

It is the maker≠checker partner to `environment-manifest`: `environment-manifest` *authors* the typed manifest
(human-collaborative); `preflight-readiness` *probes* it (independent, value-blind). It is **not**
`project-setup` — `project-setup` provisions the repo once; preflight is a fail-safe **gate** re-run before
every wave and safe to re-fire as a stall-recovery probe.

## When to use / when to skip

**Use** — at the human→AFK boundary, after `environment.md` is signed (Spec pass) and
appended (Plan pass), immediately before the orchestrator dispatches the first wave. Also
**re-fire mid-run** as a stall-recovery probe when slices fail in ways that smell like
environment (a previously-green service went down): probers are side-effect-free, so re-firing
is always safe (CQS).

**Do not skip** — this is a discipline gate, not `depth: lite`. There is no "trust me, it's
provisioned" path before an autonomous run. The only relief valve is the per-row
`manual <question>` attestation (below), and even that requires a human answer before the wave.

**Trivial pass** — a feature with zero external dependencies has an empty `environment.md`;
preflight runs and returns **go** (no rows to fail). It still runs — emptiness is *probed*,
not assumed.

## Inputs

Refuse-to-run (CRISPY refuse-to-run; fail-safe deny) unless ALL hold:
- `environment.md` exists for the feature about to build.
- Every row's `kind` is inside the closed enum `{env-var|mcp|service|runtime-dep|fixture|account}`.
- The manifest has **no value column and no command column** (D21). A `value:` or `verify:`/
  `command:` cell is **structurally illegal** — do NOT run it, do NOT read it; refuse and send
  the manifest back to `environment-manifest` to be re-authored. (A free-text command run unattended at
  the AFK boundary is exactly the attack this manifest shape was designed to make impossible.)
- `STATE.md` exists (so `project-setup` has scaffolded the repo) and names the feature/wave.

If any precondition fails, emit a **no-go** naming the precondition; do not fabricate a manifest
and do not partially probe.

## Process

For each row in `environment.md`, dispatch to the prober matching its `kind` and collect a
status (`green` | `amber` | `red`). One prober per kind, **value-blind** (it checks
presence/reachability — it never reads, prints, logs, or stores the underlying value, because
the manifest gives it no value to read). Then apply the verdict gate.

**The prober registry** (index; per-kind predicate detail in `references/probers/<kind>.md`):

| kind | what it probes (value-blind) | green | red | amber |
|---|---|---|---|---|
| [`env-var`](references/probers/env-var.md) | named var is set & non-empty in the env (never echo it) | set, non-empty | unset/empty | — |
| [`mcp`](references/probers/mcp.md) | named MCP server is connected & reachable | connected | absent | connected-but-unauthenticated |
| [`service`](references/probers/service.md) | named endpoint reachable (TCP/health, no creds in probe) | reachable | unreachable | reachable-but-degraded |
| [`runtime-dep`](references/probers/runtime-dep.md) | named tool on PATH satisfies declared version floor | present & ≥ floor | missing/too-old | — |
| [`fixture`](references/probers/fixture.md) | named seed/fixture exists at its declared location | present | missing | — |
| [`account`](references/probers/account.md) | external account usable WITHOUT spending paid quota or a human-only step | value-blind reachability passes | known-bad | un-probeable (needs `manual`) |

**The verdict gate (fail-safe deny — `design-principles.md` §11):**
- **All rows green** (or `manual`-attested OK) → **GO**. The orchestrator may start the wave.
- **Any red** → **NO-GO** + a per-row remediation checklist. The orchestrator does not dispatch.
- **Amber** → **NO-GO** *unless* the human has resolved it via `manual <question>` (below).
  Un-attested amber denies. Default is deny; a green start is never the default.

**OCP discipline (D21; `design-principles.md` §12):**
- A new external dependency = **a new ROW** in `environment.md`. preflight does not change.
- A genuinely new *check primitive* = **a new prober FILE** (`references/probers/<kind>.md`)
  plus a new enum member — never an `if`-branch grafted onto an existing prober, and never a
  probe-DSL embedded in the manifest. Adding a case is a new file, not an edit to a switch.

**Value-blindness invariant (`security.md`):** no prober reads, prints, logs, or writes any
secret value. A prober that *needs* the value to do its job is mis-designed — re-scope it to a
presence/reachability check. The verdict and ledger are guaranteed secret-free.

**Stall-recovery (CQS — `design-principles.md` §7):** the **probers** are pure queries — asking does
not change state, so re-firing preflight mid-run whenever an env regression is suspected is always
safe. The "never mutates" claim is scoped to the probers; the **gate action** (recording the go/no-go
verdict + ledger and flipping the gate) is preflight's only write, and it is idempotent under re-fire —
re-deriving the same verdict re-writes the same ledger. preflight emits the verdict and the gate flip;
the **orchestrator owns the `feature → building` transition** (registry: orchestrator drives `STATE.md`).

## The `manual <question>` escape hatch

For an item that is genuinely un-probeable without spending money or taking a human-only step
(paid quota, a SaaS account behind a human login), the row resolves to **amber** and preflight
emits a single `manual: <question>` line, e.g. `manual: is the OpenAI paid quota available? (y/n)`.
The human answers; a `y` flips that row to attested-OK for this run; anything else keeps it red.
preflight **never auto-attests** — the attestation is the human's, captured before the wave.
This is the *only* way amber becomes go.

## Rationalizations

- "The key is probably set — let's just start the wave." → Un-probed is **red**. The human is
  about to leave; an optimistic start burns the whole retry budget on a missing key.
- "This amber is fine, I'll let it slide." → Un-attested amber **denies**. Only a human `manual`
  answer flips it.
- "Let me read the env var to check its format." → **Value-blind.** Presence only. Reading the
  value is a security regression.
- "This service needs a slightly different check — I'll add an if-branch to the service prober."
  → **OCP violation.** New check primitive = new prober file + enum member.
- "environment.md has a `verify:` command — I'll just run it to be thorough." → That column is
  **structurally illegal** (D21). Refuse-to-run; the manifest goes back to `environment-manifest`.

## Red flags

STOP if you are about to:
- start (or resume) the wave with any **red** or **un-attested amber** row → emit no-go instead.
- **print, log, or store an env-var value** → security stop.
- **run a command string read from `environment.md`** → no command column exists; if one is
  present the manifest is malformed (refuse-to-run).
- add a **kind-specific branch** to a prober instead of a new prober file → OCP stop.
- **fabricate or guess** a manifest because one is missing → refuse-to-run; do not invent rows.

## Verification (ending criteria)

Done when ALL hold:
- Every row in `environment.md` was probed by its kind's prober, or carries a resolved
  `manual` attestation.
- The verdict is **GO iff** every row is green or manually-attested-OK; **NO-GO** otherwise
  (fail-safe deny).
- The per-row ledger and verdict are written; **no secret value appears anywhere** in the output.

BDD bind: the gate predicate is *"the wave may start ⟺ go"*. The orchestrator refuses to
dispatch the first wave on a no-go (this gate is the wave barrier's entry condition, D29).

## Outputs & handoff contract

- **Emits `go/no-go`** (registry artifact): a binary verdict + a per-row ledger keyed by
  `environment.md` row name — `kind · name · status{green|amber|red} · remediation-if-not-green`
  — written to ephemeral `docs/features/<slug>/preflight.md` (out of the resume spine; it is
  re-derivable by re-firing) and returned to the orchestrator.
- **Stable contract for the consumer (orchestrator):** it depends only on the binary go/no-go
  plus the ledger ids; the prose remediation is human-facing.
- **STATE.md update:** preflight's only write is the **gate flip** — it does **not** write the feature
  transition. On **go**, it emits the verdict and flips `gate: agent` so the orchestrator may start the
  wave; the **orchestrator owns the `feature → building` transition** (registry: orchestrator drives
  `STATE.md`). On **no-go**, do NOT advance into `building`; surface the checklist and set `gate: you`
  (the human provisions, then re-runs preflight).
- **Guarantee:** the output contains no secret values (value-blindness is part of the contract).
