# Prober — `service`

> One prober per kind (OCP registry). The SKILL.md table is the index; this file is the predicate
> detail. A new check primitive is a NEW prober file + enum member — never an `if`-branch here.

## What it probes (value-blind)

A named service endpoint is **reachable** — a TCP connect or an unauthenticated health/liveness
probe succeeds. The manifest row names the service (e.g. `postgres`, `redis`, `billing-api`) and
where it lives (host:port or a health path). You confirm the door opens; you never send credentials
in the probe and never read the service's data.

## Predicate

`green ⟺ the endpoint accepts a connection / returns a healthy liveness response`
`amber ⟺ the endpoint is reachable but reports degraded / not-ready (e.g. 503, failing healthcheck)`

Probe at the transport or liveness layer only:

```sh
# value-blind reachability — no credentials in the probe
nc -z db.internal 5432 && echo green || echo red          # TCP connect
curl -fsS -o /dev/null https://billing.internal/health && echo green || echo red   # unauth health path
```

Do not authenticate, do not query application data, do not pass an API token. A probe that needs a
credential to succeed is mis-scoped — split the credential out as its own `env-var` row and keep
this check at reachability.

## Status table

| status | condition | ledger / remediation |
|---|---|---|
| **green** | TCP connect or health probe succeeds | — |
| **amber** | reachable but degraded / not-ready (503, failing healthcheck) | needs the service brought to healthy; deny until re-probe is green or a `manual:` attestation resolves it |
| **red** | unreachable (connection refused, DNS failure, timeout) | remediation: start / provision the service, fix the host:port, then re-run preflight |

## Notes

- **Reachable ≠ authorized.** This prober only proves the service is up. Whether your token is
  accepted is the job of the matching `env-var` row + the slice's own integration test, not this gate.
- A `verify:` or `command:` cell in the manifest is **structurally illegal** (D21) — you derive the
  host:port from the row's declared location, you never run a command string the manifest hands you.
