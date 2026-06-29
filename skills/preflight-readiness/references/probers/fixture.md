# Prober — `fixture`

> One prober per kind (OCP registry). The SKILL.md table is the index; this file is the predicate
> detail. A new check primitive is a NEW prober file + enum member — never an `if`-branch here.

## What it probes (value-blind)

A named seed/test fixture **exists at its declared location**. The manifest row names the fixture
and where it should live (a file path, a seeded table, a fixtures directory). You confirm the
artifact is present; you do not parse its contents or validate its shape — presence only.

## Predicate

`green ⟺ the fixture exists at the declared location`

```sh
# presence check — existence only, no content read
[ -e tests/fixtures/users.seed.json ] && echo green || echo red
```

For a seeded-table fixture, a value-blind existence check is "does the table exist / is the seed
marker present" — not "are the rows correct". Content correctness belongs to the slice's own test.

## Status table

| status | condition | ledger / remediation |
|---|---|---|
| **green** | present at the declared location | — |
| **red** | missing / wrong location | remediation: generate or restore the fixture at its declared path (e.g. run the seed/factory), then re-run preflight |
| **amber** | not applicable for this kind | a fixture is binary present/absent; there is no degraded middle state |

## Notes

- preflight asserts the fixture is *there*, not that it is *valid*. A present-but-malformed fixture
  reads green here and is caught by the test that consumes it — keep the gate cheap and value-blind.
- Prefer ephemeral fixtures (factories / in-memory / testcontainers) per the suite testing strategy;
  a fixture that demands shared mutable state across runs is a manifest smell to flag back to
  `environment-manifest`, but presence is still what this prober reports.
