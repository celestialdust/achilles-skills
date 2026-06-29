# Prober — `runtime-dep`

> One prober per kind (OCP registry). The SKILL.md table is the index; this file is the predicate
> detail. A new check primitive is a NEW prober file + enum member — never an `if`-branch here.

## What it probes (value-blind)

A named tool/runtime is **on PATH and satisfies its declared version floor**. The manifest row
names the tool and a floor (e.g. `node>=20`, `python>=3.11`, `pnpm>=9`). You confirm the binary
resolves and its version meets the floor. There is no secret here, but the probe stays read-only —
it queries a version, it never installs or upgrades anything.

## Predicate

`green ⟺ the tool resolves on PATH AND its reported version ≥ the declared floor`

```sh
# resolve + version-floor check (read-only)
command -v node >/dev/null 2>&1 && node --version    # then compare to the floor, e.g. >= 20
```

Parse the version conservatively (major/minor as declared). If the floor is `>=20`, a `v20.x` or
`v22.x` is green; a `v18.x` is red (too old).

## Status table

| status | condition | ledger / remediation |
|---|---|---|
| **green** | on PATH and version ≥ floor | — |
| **red** | not on PATH, or version below the declared floor | remediation: install / upgrade the tool to meet `<tool><op><floor>`, then re-run preflight |
| **amber** | not applicable for this kind | a version either meets the floor or it doesn't; there is no degraded middle state |

## Notes

- **Never auto-install or auto-upgrade.** preflight is a read-only gate (CQS) — provisioning the
  tool is the human's remediation step, not the probe's side effect. Asking must not change state.
- If the row declares no floor, treat presence-on-PATH as green; flag the missing floor back to
  `environment-manifest` as a manifest-quality nit (a runtime-dep without a floor is under-specified), but
  do not block on it.
