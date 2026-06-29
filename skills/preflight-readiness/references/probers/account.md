# Prober — `account`

> One prober per kind (OCP registry). The SKILL.md table is the index; this file is the predicate
> detail. A new check primitive is a NEW prober file + enum member — never an `if`-branch here.

## What it probes (value-blind)

An external account (a paid SaaS, an API plan, a third-party login) is **usable for the run** —
*without spending paid quota and without taking a human-only step*. The manifest row names the
account (e.g. `openai`, `stripe-live`, `twilio`). This is the kind most often **un-probeable**: a
genuine usability check would cost money or require a human login, so the honest answer is often
"I can't know value-blind" → amber → `manual`.

## Predicate

`green ⟺ a free, value-blind reachability check confirms the account is usable`
`amber ⟺ usability can only be confirmed by spending paid quota OR taking a human-only step`
`red ⟺ the account is known-bad (e.g. a free status/identity endpoint says expired/suspended)`

Only probe if there is a **free, non-mutating, no-spend** signal — e.g. an unauthenticated status
page, or an identity/whoami endpoint that does not consume billable quota. If reaching for any
check would cost money or hit a paid path, do **not** run it — that is the un-probeable case.

## Status table

| status | condition | ledger / remediation |
|---|---|---|
| **green** | a free value-blind reachability check passes | — |
| **amber** | un-probeable without spending quota / a human-only step | emit one `manual: <question>` (e.g. `manual: is the OpenAI paid quota available? (y/n)`); a human `y` attests it OK for this run; anything else keeps it red. preflight NEVER auto-attests |
| **red** | known-bad (a free signal reports expired / suspended / over-limit) | remediation: renew / top up / re-authorize the account, then re-run preflight |

## Notes

- **Never spend to probe.** Burning paid quota to "check" an account at the AFK boundary is exactly
  the cost-and-side-effect a value-blind gate must avoid (CQS — asking must not change state, and
  here "asking" must not cost money). Un-probeable resolves to amber, not to an optimistic green.
- **Amber denies until attested.** The `manual:` line is the *only* path from amber to go, and the
  attestation is the human's — captured before the wave, never fabricated by preflight.
- A new no-spend check primitive for a specific provider is a NEW prober file + enum member if it is
  genuinely a different kind — not an `if`-branch grafted onto this one (OCP).
