---
name: environment-manifest
description: Draft environment.md in the Spec sitting and append to it in Plan — everything a run needs from outside the repo (keys, MCP servers, services, runtime pins, fixtures, accounts) as typed rows holding identifiers, never values or check commands. Probing those rows is `preflight-readiness`'s; provisioning them, `project-setup`'s.
---

# Environment manifest

## Purpose

**Stage: Spec.** Principles 5, 6, 7, 8, 9.

Writes one feature's `environment.md`: every external thing the run needs, as typed rows carrying an
identifier and never a value. An unattended wave that meets a missing key fails silently mid-wave, so
`preflight-readiness` refuses to dispatch until each row is satisfied — and a need held as data leaves
the committed file nowhere to put a secret or a shell string.

## When to use / when to skip

- The sitting has settled what the feature talks to — a mail sender, a queue, a tenant — and nothing says
  what has to exist first: after `to-prd`, beside `acceptance-criteria`.
- Plan has slices: fixtures, version pins and per-slice accounts surface there and land on this file.
- A run is about to go AFK and `preflight-readiness` has no rows to probe.
- Someone asks what has to be switched on before this will run.
- Skip checking whether a row *is* provisioned — `preflight-readiness` grades that, on evidence the row's
  author lacks.
- Skip installing or scaffolding anything (`project-setup`, `ci-cd`), and skip writing a value down: this
  file is committed.

## Inputs

- `docs/features/<slug>/prd.md` — helps: Implementation Decisions names the services, MCPs and keys,
  Testing Decisions the fixtures, Out of Scope what not to provision · without it: take the needs from
  `intent.md`, the prompt and the code's own environment reads, imports and compose files, marked
  `derived`
- `docs/features/<slug>/research.md` — helps: Dependency facts and External APIs name what the code talks
  to · without it: read `package.json`, the lockfile and any compose or CI file, marked `derived`
- `docs/features/<slug>/plan.md` and `plan/<slice-id>.md` — helps: the second pass's needs, and the slice
  ids `required-by` names · without it: leave `required-by` at the feature slug, marked `derived`
- No `.env`, no secret store, no live value: this reads intent, not secrets.

With a person there, ask at most three questions, and only where the answer changes which rows exist.

## Process

1. **Walk the sources and list what the run needs from outside the repo** — the six kinds below are the
   prompt for that walk. A row is something whose absence should stop the wave, since
   `preflight-readiness` refuses to dispatch over a missing one; what the run merely uses when it happens
   to be there is not a row. The design reference `prd.md` points at is the standing example: file it and
   a wave gets refused over a link no code reads.

2. **Put each need in exactly one of the six kinds below.**

3. **Write the identifier and never the value** — the variable's name, the service's name, the version
   constraint — one row per need, in the shape under **Outputs & handoff**.

4. **Leave `attest` blank wherever a prober can reach, and mark the rest `manual: <yes/no question>`** —
   readable by a person, executable by nothing.

5. **Emit the file even when the feature needs nothing external**, carrying `(no external dependencies)`
   in place of rows.

6. **Append the second pass to the same file** with `pass: plan`, each new row's `required-by` naming the
   slice ids that need it. Where the fact behind a signed row changed, change the row and disclose it —
   one `docs/session-log.md` entry ([`state-schema.md`](../../references/state-schema.md)) and a
   **Decided for you** row in the pull request; the silent edit is what the code-cold pass hunts for.

7. **Probe nothing and install nothing.** `preflight-readiness` grades this file with evidence its author
   lacks, and a check run here is how a command column gets invented to hold it.

8. **Grep the finished file and count its rows.** `grep -Eni 'value|command|verify|secret|cmd|sk_|AKIA|-----BEGIN|://[^ ]*:[^ @]*@' docs/features/<slug>/environment.md`
   comes back empty. A credential sitting in the file is a stop-list item
   ([`safety-rails.md`](../../references/safety-rails.md)): say one is there, never what it says.

## The typed-kind manifest

| kind | covers |
|---|---|
| `env-var` | a named secret or config read from the environment — `POSTMARK_API_KEY` |
| `mcp` | an MCP server the agent or the app connects to — `supabase` |
| `service` | a backing process that has to be up — `postgres`, `redis` |
| `runtime-dep` | a language, tool or version the build assumes — `node>=20` |
| `fixture` | seed data a test needs to mean anything — `seed-users.json` |
| `account` | a tenant or login on a third-party platform — `stripe-test` |

Six kinds, closed. Where two fit, take the one a value-blind prober can check; where none fits, the
misfit is in the row, not in the column list.

## Rationalizations

- "Preflight needs the value to check it." → It probes value-blind; a value here is a committed secret.
- "A `psql -c 'select 1'` beside each row makes the file runnable." → An unattended wave would execute
  that cell unreviewed.
- "This dependency is odd — a `notes` column would hold it." → The enum is closed; the misfit is in the row.
- "Nothing external, so no file." → An absent file reads as an oversight, the empty note as a decision.
- "It cannot be probed, so it is not worth a row." → The test is whether the wave should be held for it.
- "One quick probe to be sure." → The grader has evidence this author lacks.

## Red flags

- A value, token, password or connection string in any cell.
- A column headed `value`, `command`, `verify` or `cmd`, or a shell string anywhere in the table.
- A `kind` outside the six, or a seventh column.
- A row for something the run works unchanged without — a design link, an optional DSN.
- A probe or an install run from inside this skill.
- `status: signed` on a file no person signed.

## Verification

- [ ] `docs/features/<slug>/environment.md` exists at `status: draft`, signed by no agent, with a
      `## Manifest` table holding either rows or the `(no external dependencies)` note.
- [ ] Every `kind` is one of the six, and every row has a non-empty `purpose` and `required-by`.
- [ ] The grep in Process 8 came back empty, and no column is headed `value`, `command` or `verify`.
- [ ] Un-probeable rows carry `manual: <question>`, and every other `attest` cell is blank.
- [ ] Anything reconstructed from an absent input is marked `derived` where it is written.
- [ ] The counted rows are reported against the 30-row cap, and nothing was probed, installed or signed.

## Outputs & handoff

`docs/features/<slug>/environment.md` — cap **30 rows**, counted and reported; an over-cap draft is
handed on as over-cap, never as one that fit.

```markdown
---
feature: password-reset
status: draft
---

## Manifest

| kind    | name             | purpose                      | required-by | pass | attest |
|---------|------------------|------------------------------|-------------|------|--------|
| env-var | POSTMARK_API_KEY | send the reset mail          | PWR-1       | spec |        |
| service | redis            | hold reset tokens with a TTL | PWR-2       | spec |        |
| account | stripe-test      | the billing hook reset fires | PWR-3       | plan | manual: is the stripe-test tenant funded this month? |
```

Six columns, those names, that order. `name` is the identifier alone; `purpose` one line on why the
feature needs it; `required-by` the slice ids, or the feature slug before slices exist; `pass` the pass
that added the row; `attest` blank or `manual: <question>`.

Two columns that never exist: `value`, and `command`/`verify` — a new service is a new row, never a new
command.

`status:` stays `draft` — the person signs the Spec bundle in one act, and an agent writing `signed`
forges the only signature the stage has.

`docs/session-log.md` — one appended entry, cap 60 words, when a signed row changes. No `STATE.md` row:
the board's rows are born from a sliced plan ([`state-schema.md`](../../references/state-schema.md)).

Returns the path, the row count by kind against the cap, every row marked `derived`, and anything the
request asked for that no cell can hold.
