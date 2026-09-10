---
name: pull-request
description: Close a slice at an open draft pull request — read the diff, band its risk, and write the body a person merges from: Summary · Decided for you · Evidence · Risk band. Never merges, promotes to ready or deploys. Grading the diff is `code-review`; the release after a merge is `shipping-and-launch`.
---

# Pull request

## Purpose

**Stage: Ship.** Principles 1, 7, 10.

Ends a slice at an open, risk-banded draft pull request: read the diff, band what it touches, write the
body a person merges from. Their merge is the run's last independent gate, and the band is how they
triage a queue without opening every diff cold.

## When to use / when to skip

- A slice's code is committed on its branch and its gates have returned: the span ends here.
- The Ship step of a run, once per shipped slice; or by hand, on any branch to be opened as a draft.
- Skip where a stop-list condition fired
  ([`safety-rails.md`](../../references/safety-rails.md)): the slice ends blocked and nothing opens.
- Near-miss — five-axis grading of the diff: `code-review`. Scenarios against the running app:
  `quality-verification`. The release after a person's merge: `shipping-and-launch`. Branch and worktree
  lifecycle: `git-workflow`, `worktree`.

## Inputs

Take each from the prompt where it is given, the canonical path otherwise. A person is present only when
this runs by hand: at most three questions, and only where the gap changes the pull request's shape.

- the slice diff, `git diff <base>..HEAD` and its log — helps: what every step reads · without it: diff
  the working tree against the branch point, name the range, `derived`.
- `docs/features/<slug>/qa.md` — helps: the behavioural ledger, the `not-reachable` ids, the verdict ·
  without it: build the test plan from the diff's tests and the commands you ran, `derived`.
- `docs/features/<slug>/acceptance.md` — helps: the signed scenario ids the `qa.md` ledger is checked
  against · without it: take the ledger's own id set, `derived`.
- `docs/features/<slug>/prd.md` `## Solution` and the ADRs it cites — helps: the why the Summary carries ·
  without it: `intent.md`, the plan, or the branch's purpose, `derived`.
- `docs/features/<slug>/plan.md` and `plan/<slice-id>.md` — helps: the slice id, and the section each
  Decided-for-you row cites · without it: `STATE.md` or the branch name, `derived`.
- `docs/session-log.md` — helps: what the run decided itself, and any oracle it changed · without it:
  reconstruct both from the diff and its commits, `derived`.

## Process

1. **Read the diff first, and name the base ref you read it against.** Every judgement below is a fact
   about the diff, never about the slice title or what the maker said it did.

2. **Check the stop list** ([`safety-rails.md`](../../references/safety-rails.md)): a secret in the diff
   or its history, or a Critical or High security finding, ends the slice there. Open no pull request
   and report which fired.

3. **Band the diff, and band it here only** — every other file reproduces this band, because one computed
   two ways is a band nobody trusts. It is the higher of two readings.

   **Blast radius.** Any row that fires makes it HIGH, and a row the diff cannot settle fires: nothing
   downstream re-reports an unraised band. Read what the diff touches before the ledger for how it passed
   — a clean record is what makes an auth or migration diff look safe.

   | The diff… |
   |---|
   | changes authentication, authorization, session or permission logic |
   | changes payment, billing or pricing code |
   | reads, writes, exports or deletes personal data, or moves a schema holding it |
   | handles a credential — reads, stores, rotates or transmits a secret, token or key |
   | carries a destructive or irreversible migration — a dropped column, an unreplayable backfill, a bulk delete |
   | changes deploy, rollout or infrastructure configuration |

   **The quiet greens** — where an unattended defect ships. Any one makes it MEDIUM, none makes it LOW: a
   `concerns` verdict, a `not-reachable` id, coverage below the ledger's full set (exercised ÷ total —
   `qa.md` reports no percentage), all three implement→verify→review rounds spent, an oracle the diff
   changed or removed, a value carried into the body `derived`, a diff adding a retry, a queue or an
   external call with no telemetry beside it — the path that goes quiet is the one nobody can debug from
   production.

   A HIGH band never holds, hides or halts a slice — it is how a person triages. Nor is it a High security
   *finding*: that one is the stop-list item, while correct auth work carries a clean verdict and a HIGH
   band.

4. **Pick the 3-5 files most likely to hide a subtle correctness defect** — a new abstraction, dense
   logic, a side effect, the largest change — one line each on why. "All changed files" is the unfiltered
   diff nobody reads; a docs- or config-only slice names fewer rather than padding.

5. **Write the body as the brief a person merges from without re-reading the diff cold** — the four
   sections of *Outputs & handoff*, in order. Draw the Summary from `prd.md` `## Solution` and the ADRs by
   id, never a commit-log dump and never their reasoning restated. Transcribe the `qa.md` ledger rather
   than inventing a scenario↔test map, and give every `not-reachable` id a human-ack checkbox — absorbing
   one defeats the run's only human-anchored oracle. Take Evidence's commands and their real output from
   the slice's last checkpoint and `qa.md`, re-running only what the diff moved. Narrate the diff layer to
   layer, never as a file list. Disclose any test, fixture or scenario the slice changed or removed —
   before, after, why; nothing is frozen, so the undisclosed change is the failure.

6. **Give every in-run default its Decided-for-you row**, matching one `docs/session-log.md` entry each.
   Where a plan section moved under a decision citing it, re-read and confirm or reverse that decision in
   the same pass — none lapses on its own.

7. **Push the branch, then open the draft** — against the `<body>` steps 5-6 wrote, never one still empty.

   ```bash
   git push -u origin <slice-branch>          # never main
   gh pr create --draft --title "<type>(<scope>): <slice-id> <description under 70 chars>" --body-file <body>
   ```

   Never `gh pr merge`, push to `main`, mark it ready, enable auto-merge or trigger a deploy — a person
   merges ([`safety-rails.md`](../../references/safety-rails.md)), and promoting the draft spends the last
   reversible moment the work has. Return the URL; the push is yours, the worktree the caller's.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "The commit messages already explain it" | Commits carry what changed; the why lives in `prd.md` and the ADRs. |
| "Reviewers can open the files tab" | The unfiltered diff is what nobody reads; the curated 3-5 files is the deliverable. |
| "One scenario was unreachable, so leave it out" | An absorbed id is a gap the human-anchored oracle never sees. |
| "Everything is green, so open it ready to merge" | The draft is the last reversible moment; promoting it is the run grading itself. |
| "It touches auth, so hold it for a human first" | The band already flags it in that person's queue; holding takes it out. |
| "Every gate passed first time, so this is LOW" | Nothing in a slice's title or record says what its diff touches. |

## Red flags

- A `blast radius:` line missing or blank, which reads downstream as "none fired".
- A code-reading checklist saying "all changed files", or a file listed with no reason beside it.
- A Summary assembled out of the branch's commit messages.
- A `not-reachable` id that appears nowhere in the body.
- A test or scenario changed inside the diff and mentioned in neither the body nor the log.
- A slice held back, or a pull request left unopened, because the band came out HIGH.

## Verification

- [ ] One draft pull request is open on the slice branch, `main` untouched, auto-merge off, URL returned.
- [ ] The body carries `Summary · Decided for you · Evidence · Risk band` and nothing else, its word
      count measured against the 500-word cap.
- [ ] The band is the higher of the two readings, its `blast radius:` line naming every fired row with the
      file that fired it, or reading `none`.
- [ ] The checklist names 3-5 files with the reason each is there — or fewer, with the why stated.
- [ ] Every `not-reachable` id carries a human-ack checkbox, every changed oracle its before, after and
      why, and every in-run default a row matching one log entry.
- [ ] The secret scan came back clean, and Evidence quotes real build and test output.
- [ ] Every derived value reads `derived`; nothing reconstructed is presented as signed.
- [ ] Or: nothing opened, a stop-list condition having fired, and the report names which.

## Outputs & handoff

**The pull request body** — cap 500 words, these four stable sections in this order and no others. Report
the measured count against the cap; an over-cap body is trimmed before it opens, never handed on as if it
fit.

```markdown
## Summary          why this slice exists — from prd.md ## Solution, ADRs by id, links to the artifacts
## Decided for you  | # | Decision | Default taken | Why | Alternative | Plan section |
## Evidence         the narrated diff · the transcribed qa.md ledger · [ ] a human-ack line per
                    not-reachable id · any oracle changed · the 3-5-file checklist · the commands run
                    with their real output · sibling slices still open or blocked
## Risk band        LOW | MEDIUM | HIGH
                    blast radius: <none | auth: src/auth/session.ts · data: migrations/007_drop_email.sql>
                    quiet greens: verdict · exercised/total · not-reachable ids · rounds · oracle changed
```

Rename one of the four and its consumer changes in the same commit: a body whose shape moved silently is
read by a person expecting the old one.

**Appended to `docs/session-log.md`**: one entry, cap 60 words, where this skill settled something itself
— the base ref, a derived slice id. Shape and append rules:
[`state-schema.md`](../../references/state-schema.md).

**Returned in conversation**: the pull request URL and its band — or the stop-list condition that fired,
and no pull request.

**Nothing else.** No `STATE.md` row, the caller owning the slice's transition
([`state-schema.md`](../../references/state-schema.md)); no `qa.md`, no lesson, no release notes, no merge.
