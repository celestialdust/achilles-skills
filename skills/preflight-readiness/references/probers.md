# Probers

What a value-blind probe checks for each kind `environment-manifest` defines, what each status means,
and the gotcha that makes each one wrong in a different way. A genuinely new check primitive
is a new section here plus a new kind on the manifest — never an `if`-branch inside a section below,
and never a probe language embedded in the manifest itself. A new external dependency is only ever a new
row on the manifest, and changes nothing in this file.

Statuses are the suite's: `pass` · `concerns` · `block`
([`safety-rails.md`](../../../references/safety-rails.md)).

## `env-var`

The row names a variable; it never carries the value. Probe that something is set under that name and
is non-empty — test the name, never expand it into output:

```sh
[ -n "${STRIPE_SECRET_KEY-}" ] && echo pass || echo missing
```

- **pass** — set and non-empty.
- **block** — unset or empty, and the row is a secret. Remediation is `export <NAME>=…` into the
  run's environment or secret store, never a paste into a committed file.
- **concerns** — unset, and the row is plain configuration a default already covers.

Set-but-wrong reads as **pass** here. Whether the value is the *right* value is not knowable
value-blind, and the slice's own test is where a wrong key surfaces: this pass asserts provisioned,
not correct. A row tempting you to read the value "just to check its format" is the same violation
wearing a reason.

## `mcp`

Take the host's own connected-server listing, then one side-effect-free call — a resource or tool
list. Never take a mutating action to prove a server works; a read-only list is enough, and a probe
with side effects cannot be re-fired.

- **pass** — connected, and a read-only call answers.
- **concerns** — connected but reporting unauthenticated or unauthorized. It will fail the first
  slice that uses it, and the remediation differs from an absent server's, so say which of the two
  this is.
- **block** — the server is absent and wiring it up needs a credential.

## `service`

Probe at the transport or liveness layer only — a TCP connect, or an unauthenticated health path.
Send no credential and read no application data:

```sh
nc -z db.internal 5432
curl -fsS -o /dev/null https://billing.internal/health
```

A probe that needs a credential to succeed is mis-scoped: split the credential out as its own
`env-var` row and keep this one at reachability. Reachable is not authorized — whether a token is
accepted belongs to that row and to the slice's integration test.

- **pass** — the connect or the liveness path answers healthy.
- **concerns** — reachable but degraded or not-ready (a 503, a failing healthcheck), and reachable
  but unstarted. Starting a service is provisioning, which this pass reports and never performs.
- **block** — reaching it at all needs production data or a paid tenant.

## `runtime-dep`

Resolve the binary on PATH, ask it for its version, compare against the declared floor. Parse
conservatively — at the precision the floor declares:

```sh
command -v node >/dev/null 2>&1 && node --version
```

- **pass** — on PATH and at or above the floor.
- **concerns** — missing, or below the floor. Never auto-install and never auto-upgrade: installing
  is the person's remediation.
- **block** — installing it needs a licence, a paid registry or production credentials.

A row with no floor passes on presence alone. Flag the missing floor back to `environment-manifest`
as under-specified, and hold nothing over it.

## `fixture`

Existence at the declared location, contents unread and unparsed. For a seeded table, existence is
the table or the seed marker — never whether the rows are right, which belongs to the test that
consumes them.

```sh
[ -e tests/fixtures/users.seed.json ]
```

- **pass** — present where the row says.
- **concerns** — missing, or present at a different path than the row declares.
- **block** — restoring it needs production data.

A fixture demanding shared mutable state across runs is a manifest smell: report its presence, and
flag the sharing back to `environment-manifest`.

## `account`

The kind most often un-probeable. Probe only where a free, non-mutating, no-spend signal exists — an
unauthenticated status page, a whoami endpoint that consumes no billable quota. Where the only check
available would cost money or take a human-only step, do not run it: that is the un-probeable case,
and burning paid quota to answer a question nobody asked is the cost this whole pass exists to avoid.

- **pass** — a free value-blind signal says usable.
- **block** — un-probeable, and answering it means money or a credential. Carry the row's
  `manual: <question>` forward unanswered; the attestation is the person's and is never fabricated
  here.
- **concerns** — a free signal reports expired, suspended or over-limit, and the account is not one
  the run needs money to fix.
