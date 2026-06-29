# Prober — `env-var`

> One prober per kind (OCP registry). The SKILL.md table is the index; this file is the predicate
> detail. A new check primitive is a NEW prober file + enum member — never an `if`-branch here.

## What it probes (value-blind)

A named environment variable is **present and non-empty** in the run's environment. The manifest
row gives you the variable's *name* only (e.g. `STRIPE_SECRET_KEY`) — never its value. You check
that something is set under that name; you never read, echo, log, or store what it is.

## Predicate

`green ⟺ the named variable is set AND its value is non-empty`

Probe presence without dereferencing the value. In a shell, test the name, do not expand it into
output:

```sh
# value-blind presence check — prints only a status word, never the value
[ -n "${STRIPE_SECRET_KEY-}" ] && echo green || echo red
```

Never `echo "$STRIPE_SECRET_KEY"`, never write it to a file, never pass it as a CLI arg that
gets logged. Presence is a boolean; that boolean is all the ledger records.

## Status table

| status | condition | ledger / remediation |
|---|---|---|
| **green** | set and non-empty | — |
| **red** | unset, or set but empty | remediation: `export <NAME>=…` (in the run's env / secret store); do NOT paste the value into any committed file |
| **amber** | not applicable for this kind | a var is binary present/absent; there is no degraded middle state |

## Notes

- A var that is "set but to the wrong value" still reads **green** here — correctness of the value
  is not value-blind-probeable and is out of scope. The right place to catch a wrong value is the
  slice's own test, not this gate. preflight asserts *provisioned*, not *correct*.
- If a row tempts you to read the value "just to check the format", that is a value-blindness
  violation (security stop). Re-scope to presence-only.
