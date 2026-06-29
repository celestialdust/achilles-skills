# Prober — `mcp`

> One prober per kind (OCP registry). The SKILL.md table is the index; this file is the predicate
> detail. A new check primitive is a NEW prober file + enum member — never an `if`-branch here.

## What it probes (value-blind)

A named MCP server is **connected and reachable** in the current session. The manifest row gives
the server's *name* (e.g. `supabase`, `playwright`) — never its auth token. You confirm the server
is wired up and answering; you never read or print whatever credential authenticates it.

## Predicate

`green ⟺ the named MCP server is connected AND a no-op/list call succeeds`
`amber ⟺ the server is connected but reports unauthenticated / not-authorized`

Use the host's own MCP listing (the connected-servers inventory) plus a side-effect-free call
(e.g. a resource/tool list) to confirm reachability. Do not perform a mutating MCP action to
"prove" it works — a read-only list is enough and keeps the probe pure (CQS).

## Status table

| status | condition | ledger / remediation |
|---|---|---|
| **green** | connected and answering a read-only call | — |
| **amber** | connected but unauthenticated / authorization missing | needs a human auth step; resolve via `manual:` if the auth can't be completed value-blind, otherwise complete the connect/auth and re-probe |
| **red** | server absent / not connected | remediation: connect the MCP server in the host config, then re-run preflight |

## Notes

- **Amber denies by default.** A connected-but-unauthenticated server will fail the first slice that
  uses it; do not optimistically treat it as green. Either the human authenticates it (then re-probe
  flips it green) or it carries a resolved `manual:` attestation.
- Distinguish *absent* (red — the server isn't wired up at all) from *present-but-unauthed* (amber —
  it's there but won't act). The remediation differs, so the ledger must say which.
- Never echo an MCP auth token or any credential surfaced by the listing.
