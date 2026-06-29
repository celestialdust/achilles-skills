---
name: environment-manifest
description: Capture every external thing the autonomous run needs — API keys, MCP servers, services, runtime deps, test fixtures, accounts — as a typed-kind manifest with NO values and NO commands. Use during Spec right after the PRD lands, and again during Plan once slices exist. ALWAYS run this before an AFK/autonomous wave so preflight-readiness can refuse to start on a missing dependency. If you are about to paste a secret value or a check command into a config file, STOP and use this instead.
---

## Purpose

Stage: **Spec** (pass 1, signed) + **Plan** (pass 2, appended). The autonomous Implement→Ship wave runs
AFK; the moment it hits a missing API key, an unprovisioned service, or a wrong runtime version, it fails
silently in the middle of a parallel wave. `environment-manifest` captures — **declaratively, never executably** —
every external thing the feature needs to run, so the value-blind `preflight-readiness` gate can refuse to start the
wave until each item is provisioned.

First principle: an environment need is *data* (a typed row), not *code* (a command). Encoding it as data
makes two whole classes of failure structurally impossible — a secret can't leak into a committed file
(there is nowhere to put a value), and an unreviewed shell string can't run unattended at the human→AFK
boundary (there is nowhere to put a command). You author the manifest; `preflight-readiness` checks it. Maker ≠ checker.

## When to use / when to skip  (depth: lite)

Use **twice** — two passes over one file:
- **Pass 1 — Spec (interface-level, signed):** right after `to-prd` lands `prd.md`. Capture the keys / MCPs /
  services the *product* needs. These rows are part of the single Spec gate sign-off.
- **Pass 2 — Plan (implementation-level, appended):** after `plan-breakdown` produces slices. Append the
  fixtures / version-pins / accounts the *implementation* needs; these re-surface at the Verify barrier.

Skip only when a pure-refactor feature introduces zero external dependency — but still emit a signed
manifest with an explicit `(no external dependencies)` note so the gate is explicit and `preflight-readiness` has
something to read. Never leave the file absent: absence is ambiguous, an empty-signed manifest is a decision.

## Inputs

- **Pass 1 consumes** `docs/features/<slug>/prd.md` — sections **Implementation Decisions** (names
  services / MCPs / keys), **Testing Decisions** (names fixtures), **Out of Scope** (what NOT to provision).
  **Refuse to run pass 1 if `prd.md` is absent** — without the PRD you'd be guessing at the feature's needs.
- **Pass 2 consumes** `docs/features/<slug>/plan.md` + its slices — to pick up impl-level needs (test
  fixtures, exact runtime versions, per-slice accounts) and tie each row to the slice id(s) that require it.
- Never consumes a `.env`, a secret store, or any live value. This skill reads *intent*, not *secrets*.

## Process

1. **Locate the file.** `docs/features/<slug>/environment.md`. Pass 1 creates it; pass 2 appends.
2. **Walk the source for external needs.** From `prd.md` (pass 1) / `plan.md` (pass 2), list everything the
   run touches outside the repo: keys, MCP servers, running services, language/tool versions, seed data,
   third-party accounts.
3. **Classify each into exactly one kind** (closed enum — see Kind playbook). If a need doesn't fit a kind,
   that's a signal you've mis-modeled it, not a license to invent a column.
4. **Write one row per need:** `kind · name · purpose · required-by · pass · attest`. **No value. No command.**
5. **Mark un-probeable items** with `manual: <yes/no question>` in `attest` — the single amber escape hatch
   for things a value-blind prober can't check (paid quota remaining, a human-owned SaaS account). The
   question is human-readable, never executable.
6. **Append-only after sign.** Pass 2 never rewrites a row signed in pass 1; if a signed interface-level fact
   genuinely changed, add a new row and flag the supersession for re-sign — don't silently mutate a signed row.
7. **Set status.** `draft` until the Spec gate signs pass-1 rows → `signed`.
8. **Do not probe.** You author; `preflight-readiness` checks. Running a check here would duplicate preflight-readiness and tempt
   a command cell into existence.

## The typed-kind manifest

Closed kind enum — **these six, no others**:

| kind | covers |
|---|---|
| `env-var` | a named secret/config the process reads from the environment (e.g. `POSTMARK_API_KEY`) |
| `mcp` | an MCP server the agent/app connects to (e.g. `supabase`) |
| `service` | a running backing service (e.g. `postgres`, `redis`) |
| `runtime-dep` | a language/tool/version the build needs (e.g. `node>=20`, `pnpm`) |
| `fixture` | seed data / a test artifact (e.g. `seed-users.json`) |
| `account` | a third-party account/tenant (e.g. `stripe-test`) |

Row schema — exactly these columns: `| kind | name | purpose | required-by | pass | attest |`
- `name` — the *identifier* only (the env-var name, the MCP name, the service name). **Never the value.**
- `purpose` — one line: why the feature needs it.
- `required-by` — the PRD-namespaced slice id(s) (e.g. `PWR-2`) or the feature slug; ties the row to `STATE.md`.
- `pass` — `spec` or `plan` (which pass added the row).
- `attest` — blank = auto-probed by `preflight-readiness`'s per-kind value-blind prober; `manual: <question>` =
  un-probeable amber escape hatch.

**Two columns that must never exist** (security fail-safe):
- **No `value` column.** Secrets are structurally unrepresentable — a key can never leak into this committed
  file because there is nowhere to put it.
- **No `command`/`verify` column.** A free-text command cell is an unreviewed shell string that `preflight-readiness`
  would run unattended at the AFK boundary. The reviewed prober-per-kind file in `preflight-readiness` replaces it.
  A new service is a **new row**, never a new command.

Example:
```
feature: password-reset
status: signed

## Manifest
| kind        | name              | purpose                          | required-by | pass | attest |
|-------------|-------------------|----------------------------------|-------------|------|--------|
| env-var     | POSTMARK_API_KEY  | send reset emails                | PWR-1       | spec |        |
| service     | redis             | store reset tokens with TTL      | PWR-2       | spec |        |
| mcp         | supabase          | user-table reads                 | PWR-1       | spec |        |
| runtime-dep | node>=20          | crypto.webcrypto for token gen   | PWR-1       | plan |        |
| fixture     | seed-users.json   | known users for reset E2E        | PWR-2       | plan |        |
| account     | stripe-test       | billing webhook on reset (paid)  | PWR-3       | plan | manual: is the stripe-test tenant funded this month? |
```

## Kind playbook

- Read from `process.env` / the environment → **env-var** (name it; never paste it).
- Talked to over MCP → **mcp**.
- A daemon/container that must be *up* → **service**.
- A version/tool the build assumes → **runtime-dep** (encode the constraint in `name`, e.g. `python>=3.11`).
- Data that must *exist* for a test to be meaningful → **fixture**.
- A tenant/login on a third-party platform → **account** (usually `manual:` attested).
If two kinds fit, pick the one `preflight-readiness` can check value-blind. If none fit, you've mis-modeled the need —
re-read the PRD, don't add a column.

## Rationalizations

- "I'll just drop the value in so `preflight-readiness` can check it." → No. The value is structurally unrepresentable
  on purpose; `preflight-readiness` probes value-blind. A value here is a committed secret.
- "A quick `curl`/`psql` verify command in a cell makes it runnable." → No. That runs unattended at the AFK
  boundary with no review. The prober-per-kind file is the reviewed replacement.
- "This dep is weird, I'll add a `notes`/`type` column." → No. The enum is closed; a misfit is a modeling signal.
- "It's un-probeable, so I'll skip the row." → No. Add it with `manual: <question>`; a missing row is an
  invisible dependency that fails AFK.
- "I'll just rewrite the signed Spec row during planning." → No. Append + flag for re-sign; signed facts are
  the Spec gate's contract.
- "Let me run the probe to be sure." → No. Maker ≠ checker; authoring and probing are separate skills.

## Red flags — STOP

- A value, secret literal, token, password, or connection string appears in **any** cell.
- A column named `value`, `command`, `verify`, `cmd`, or any shell string in a cell.
- A `kind` outside `{env-var, mcp, service, runtime-dep, fixture, account}`.
- You are about to **run** a command to check an item (that's `preflight-readiness`'s job).
- Pass 2 edits/overwrites a row that pass 1 signed.
- The manifest is absent for a feature heading into a wave.

## Verification (ending criteria)

- `docs/features/<slug>/environment.md` exists with a `## Manifest` table and a `status:` field.
- Every row's `kind` is one of the six enum values.
- **Greppable security check (load-bearing done-predicate):** no column header matches
  `value|command|verify|secret|cmd`; no cell contains a secret-shaped literal (`sk_`, `AKIA`,
  `-----BEGIN`, or a URL embedding credentials).
- Every row has a non-empty `purpose` and `required-by`.
- Un-probeable rows carry `manual: <question>`; all others leave `attest` blank for `preflight-readiness`.
- Pass-1 (`pass: spec`) rows are part of the Spec sign-off bundle; `status: signed` only after that gate.

## Outputs & handoff contract

- **Emits** `docs/features/<slug>/environment.md`.
- **Stable sections** consumers depend on: the `status:` field and the `## Manifest` table with the fixed
  `kind · name · purpose · required-by · pass · attest` columns. **Consumer:** `preflight-readiness` reads the Manifest,
  runs its per-kind value-blind prober per row, honors `manual:` attestations, and refuses the wave on any
  red / un-attested amber.
- **Contract rule:** change the manifest's shape (a new kind, a renamed column) → update `preflight-readiness` + its
  prober registry **in the same commit** (a new kind needs a new prober file; OCP).
- **STATE.md update:** the feature sits in `feature: spec` while pass-1 is unsigned; the plan-pass append
  happens while `feature: plan`. This skill creates no slice rows.
- **Per-stage handoff:** the signed manifest is one of the 4–5 Spec-gate artifacts (intent + prd + acceptance
  + environment [+ design contract when UI]); the next cold reader (`preflight-readiness`) needs nothing but this file.
