---
name: security-and-hardening
description: Audit a diff code-cold for vulnerabilities — trust boundaries, OWASP and the GenAI ten, secrets, dependencies — returning one verdict and the slice's findings file. Reach for it on any diff touching input, auth, sessions, secrets, uploads, server-side fetches or model output. The five-axis grade is `code-review`.
---

# Security and Hardening

## Purpose

**Stage: Review.** Principles 7, 8, 9.

Audits a diff code-cold against the boundaries it crosses — OWASP, the GenAI ten, secrets, dependencies —
and writes the owning slice's `security-findings.md` under one verdict. External input is hostile until
parsed and a committed credential is already spent, so the grade lands on the diff that introduces the
surface.

## When to use / when to skip

- The Review fan-out dispatches you code-cold over a wave's verify-green diffs
  (`references/safety-rails.md`, *Code-cold dispatch*).
- A diff touches user input, authentication or authorization, sessions, secrets, stored personal data,
  server-side URL fetches, file uploads, or model output.
- A dependency was added, bumped or replaced, or the lockfile moved.
- A branch, pull request or release handed over with "is this safe to ship".
- Skip a docs- or config-only diff with no executable surface. It still gets step 2.
- Near-miss — the five-axis grade whose security axis is one of five: `code-review`. Complexity in code
  believed correct: `code-simplification`. A profiled hot path: `performance-optimization`. Abuse cases
  exercised against a running app: `quality-verification`.

## Inputs

Nobody is present on a code-cold pass, so derive what is absent and say in the findings what you derived.

- the diff — helps: the object of the audit · without it: read `git diff <base>..HEAD` or the working
  tree and name the range you audited, `derived`.
- `STATE.md` and `docs/features/<slug>/plan/<slice-id>.md` — helps: the slice id and the files it owns,
  so a finding routes to the slice owning the file · without it: attribute by file path against the
  branch, `derived`.
- `docs/features/<slug>/acceptance.md` — helps: its `class: security-observable` scenarios, the abuse
  cases already promised · without it: take them from step 1's boundaries, `derived`.
- `docs/features/<slug>/prd.md` — helps: the data the feature handles, which names the assets worth
  stealing · without it: read the routes, the schema and the storage calls in the diff, `derived`.
- the previous round's findings, on a re-audit — helps: a repaired diff shows no vulnerability, so this
  is what says one was there · without it: read `docs/session-log.md` and the PR body, `derived`.

## Process: Threat Model First

1. **Map the boundaries before you read the fix** — the checklist's *Threat modelling* section is the
   shape: every place untrusted data crosses in, what sits behind each one worth stealing, STRIDE over
   the pair. Write the abuse case beside each use case and audit against it.

2. **Scan the diff and its history for secrets first** — keys, tokens, passwords, connection strings,
   `.env` / `*.pem` / `*.key` in version control, a `.env.example` holding a real value, a credential in
   a fixture. Report that one is present, never what it is, in every artifact. A committed secret is
   rotated first, purged second.

3. **Walk every changed file through [`security-checklist.md`](../../references/security-checklist.md)**
   — threat model, pre-commit, authentication, authorization, input validation, headers and CORS, data
   protection, dependencies, AI/LLM, error handling. That file is the pass; what the diff introduces says
   which section to run hardest, and where that section alone is not enough:

   | The diff introduces | Run hardest |
   |---|---|
   | an access keyed by an id from the request | Authorization — ownership, not identity alone |
   | a fetch, webhook or redirect | Input validation, then step 4 |
   | an upload | Input validation — an allowlisted type, a size cap, content verified, never the extension |
   | a prompt, completion, tool call or embedding | AI / LLM, then step 4 |
   | a dependency, lockfile or CI install line | Dependencies, then step 5 |

4. **Follow the two boundaries a checklist line under-states.** A server-side fetch of a user-influenced
   URL — a webhook, an import-from-URL, an image proxy — wants scheme and host allowlisted, every
   resolved address rejected unless it is unicast (`169.254.169.254` first of all), and no redirect
   followed — a 302 lands wherever it likes, past the allowlist the first request cleared. A TOCTOU gap
   survives that check too, DNS rebinding between check and connect: a high-risk surface resolves once
   and connects to the pinned address, or sits behind a filtering agent. Model output is untrusted input
   whatever produced it — never into `eval`, SQL, a shell, `innerHTML` or a file path, and a permission
   enforced in a system prompt is not enforced.

5. **Triage a dependency finding by reachability, not by the severity the audit printed.** Run the
   ecosystem's audit, then ask of each: is the vulnerable path reachable here, is the package runtime or
   dev-only, is a fix released. Record a reason and a review date against anything deferred. A moved
   lockfile, an `npm install` where CI wants `npm ci`, a new `postinstall`, or a name one character off a
   popular package is its own finding.

6. **Give every finding an id, a severity, a reference, a location and a remedy** — feature-namespaced
   (`SEC-PWR-1`), one of `Critical · High · Medium · Low`, the OWASP or GenAI entry it maps to,
   `path:line`, and the change that closes it.

7. **Audit a wave's diffs as one changeset, then attribute each finding by the file it sits in.** One
   writer per file makes that unambiguous (`references/safety-rails.md`); a finding you cannot attribute
   goes to every slice in the wave, said plainly.

8. **Return one verdict — `pass · concerns · block`.** `block` is a stop-list item and nothing else: a
   secret in the diff or its history, or a finding you graded Critical or High
   (`references/safety-rails.md`, *The stop list*). Name the condition that fired; the slice ends there
   with no pull request opened on it. Everything short of that is `concerns`, and the caller routes the
   slice back into the repair ladder.

9. **Decide the rest yourself and leave the trace.** An accepted residual risk, a deferred dependency
   fix, a control you judged adequate: take the default, state the reason, append one
   `docs/session-log.md` entry, hand `pull-request` a Decided-for-you row. A band-raising surface — a new
   authentication flow, a new class of personal data, a new integration, a CORS change, an upload
   handler, a rate-limit change, an elevated permission — is named in the findings rather than asked
   about; the band is how a person triages at merge.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "The checklist is boilerplate, I know what to look for" | The section you would have skipped is the one this diff just opened. |
| "Threat modelling is overkill for a diff this size" | A control chosen without the boundary map is a guess that is sometimes right. |
| "The line is gone, so the key is gone" | It was compromised the moment it reached a remote; rotation closes it, purging is bookkeeping. |
| "It's only model output, it's just text" | That text becomes the SQL, the script tag or the shell word whenever something executes it. |
| "`npm audit` is clean, so the dependencies are" | An audit knows published CVEs, not a typosquat, a fresh `postinstall`, or an unpinned install. |
| "The rest of the diff is clean, so it nets out" | One Critical is the verdict; the share of lines it occupies changes nothing. |

## Red flags

- A value from the request reaching a query, a shell, a file path or the DOM unparsed.
- A credential's value reproduced in the findings, the log or the pull request.
- An endpoint that checks who you are and never whether the row is yours.
- A server-side fetch of a user-supplied URL with no allowlist behind it.
- Model output reaching `eval`, SQL, a shell or `innerHTML`, or a permission left to the system prompt.
- A finding with no `path:line`, no remedy, or a severity copied from the audit tool rather than reach.

## Verification

- [ ] Every changed file was read against the checklist, and the findings name the boundaries and the
      assets behind them.
- [ ] Every finding carries step 6's five fields, in the findings file of the slice owning that file,
      with each reconstructed input marked `derived`.
- [ ] The verdict is one of `pass · concerns · block`, a `block` names the stop-list condition that
      fired, and no credential's value appears in any artifact.
- [ ] Nothing outside the stop list ended the slice: each off-list call is a default with a reason, one
      log entry, and a Decided-for-you row.

## Outputs & handoff

**Writes** `docs/features/<slug>/<SLICE-ID>/security-findings.md` — cap 600 words, one file per owning
slice, and you are its sole writer. With a feature but no slice id it is
`docs/features/<slug>/security-findings.md`, naming the range you audited; called by hand with neither,
the four sections come back in conversation instead.

```markdown
---
slice: <id> · feature: <slug> · verdict: <pass|concerns|block>
---
## Threat model     the boundaries, the assets behind them, the abuse cases you audited against
## Findings         one row per finding, step 6's five fields, `derived` on anything reconstructed;
                    an unmet checklist item is a finding, so a clean pass still reports
## Raises the band  step 9's sensitive surfaces, with the severity counts `pull-request` bands
## Verdict          pass | concerns | block · on a block, the stop-list condition that fired
```

Measure that draft against the cap and report the count; an over-cap draft goes on as an over-run, never
as one that fit.

**Appends** one `docs/session-log.md` entry, cap 60 words, where this pass settled something itself,
matching the pull request's **Decided for you** row
([`state-schema.md`](../../references/state-schema.md)).

**Nothing else.** No code and no test: you read a diff and report on it, and a finding is closed by
whoever owns the slice. No row on `STATE.md`, no lessons entry and no pull request — the caller owns the
board, the record and the branch ([`state-schema.md`](../../references/state-schema.md)).
