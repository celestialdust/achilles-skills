---
name: code-review
description: Grade a diff code-cold on five axes — correctness with test quality, readability, architecture, security, performance — returning severity-labelled findings and one verdict. Reach for it before a slice's pull request opens, or on any diff handed over. Cleanup with no bug hunt is `code-simplification`; the deep audit is `security-and-hardening`.
---

# Code Review and Quality

## Purpose

**Stage: Review.** Principles 1, 7, 8.

Grades a diff code-cold on the five axes below, returning severity-labelled, leverage-ordered findings
under one verdict. Test quality is axis 1's question, not a separate skill's. The standard is overall
code health, not perfection: a change that improves the codebase earns a `pass` even where you would
have written it differently.

## When to use / when to skip

- A slice's code is green and its pull request is about to open, or a diff, branch or PR is handed
  over — yours, another agent's, or a person's.
- The Review fan-out dispatching you code-cold beside `code-simplification`, `security-and-hardening`
  and `performance-optimization` ([`safety-rails.md`](../../references/safety-rails.md), *Code-cold
  dispatch*) — on a different model from the diff's author where one is available; blind spots do not
  overlap.
- A re-review round, after a slice was routed back and re-passed Verify.
- Skip the axes on a whole-file deletion or a mechanical refactor — confirm the intent, not every line.
- Near-miss — complexity cut from code believed correct: `code-simplification`. The OWASP, secrets and
  dependency sweep: `security-and-hardening`. A profiled hot path: `performance-optimization`. Scenarios
  exercised in a running app: `quality-verification`.

## Inputs

On a code-cold pass nobody is present: derive what is absent and say what you derived. With a person
there, ask at most three questions, only where the gap changes what you grade.

- the diff — helps: what you grade · without it: `git diff <base>..HEAD` or the working tree, the range
  named, `derived`.
- `docs/features/<slug>/plan.md` and the slice's file under `plan/` — helps: the plan you grade before
  the diff · without it: intent from the diff, the branch name and `STATE.md`, `derived`.
- `docs/features/<slug>/acceptance.md` — helps: the behaviour this diff owes · without it: `prd.md` or
  the tests, `derived`.
- the previous round's findings, on a re-review — helps: the `Critical:` list a fixed diff no longer
  shows, and the lesson owed · without it: `docs/session-log.md` and the PR body, `derived`, naming
  whoever dispatched you.
- `docs/lessons.md` — helps: the field list and the sibling defects · without it: append nothing and
  say so; `project-setup` creates it.

## Review Process

1. **Read the intent first** — what the change is for, which slice, what behaviour it moves. Grade the
   plan before the diff: one that faithfully executes the wrong plan is still a fail.

2. **Read the tests before the implementation** — is there one for each behaviour the diff moves, and
   does each assert observable behaviour rather than implementation shape, cover edges and error paths,
   carry a name saying what it proves, and fail on a regression?

3. **Check whether the oracle moved.** A test, fixture or scenario changed inside the diff is legitimate
   where the plan moved and the PR body and `docs/session-log.md` disclose it; undisclosed, or weakened
   while the implementation stood still, it is `Critical:` — never a `pass`.

4. **Walk every changed file through the five axes.**

   | Axis | What you grade |
   |---|---|
   | 1 · Correctness | spec match · edges (null, empty, boundary) · error paths, not the happy one alone · off-by-one, races, state inconsistency · step 2's test quality |
   | 2 · Readability | names that carry meaning · flat control flow · no cleverness · dead-code shims · a conditional bolted onto an unrelated flow, or repeated on one shape — design smells, not nits |
   | 3 · Architecture | pattern fit · module boundaries · dependency direction · abstraction level · feature logic in a shared module · a near-duplicate of a canonical helper · a gratuitous `any`, cast or silent fallback over an unstated invariant |
   | 4 · Security | input validation · secrets · authn/authz · parameterised queries · output encoding · dependency trust · external data as untrusted |
   | 5 · Performance | N+1 queries · unbounded loops and fetches · sync work that should be async · needless re-renders · missing pagination · hot-path allocation |

   Depth for the last two: [`security-checklist.md`](../../references/security-checklist.md),
   [`performance-checklist.md`](../../references/performance-checklist.md). A new dependency is graded
   too — what the stack already does, size, maintenance, vulnerabilities, licence. List the code this
   change orphans; delete none of it.

5. **Size the change.** ~100 changed lines reads in one sitting, ~300 suits one logical change, ~1000
   wants a split — by stack, by file group, horizontally (shared code first) or vertically (thinner
   slices). A file past ~1000 lines wants extracting before more is piled on. A refactor that also adds
   behaviour is two changes, and a first line that is not a standalone imperative ("Fix bug", "Phase 1")
   is a finding: history is read without the diff.

6. **Name the remedy, not just the problem** — a typed model or dispatcher for a conditional chain,
   orchestration split from logic, feature logic returned to its owning package, a large file split.
   Prefer the one that makes a branch, mode or layer disappear over one that relocates it; "this is
   complex" alone leaves the author guessing.

7. **Label every finding, and order by leverage** — correctness and security first, then structural
   regressions, then cosmetics; one structural problem buried under ten nits *is* the review. Cite
   `path:line` on every one. A `Critical:` goes back the moment it is found rather than waiting for the
   round to close — a fast partial beats a complete verdict that arrives late.

   | Prefix | Means, and what the author does |
   |---|---|
   | `Critical:` | a defect that would ship — broken behaviour, data loss, a vulnerability, a weakened oracle; fixed before the PR opens |
   | *(no prefix)* | required; fixed before merge |
   | `Optional:` / `Consider:` | worth weighing; the author decides |
   | `Nit:` | taste; may be ignored |
   | `FYI` | context for later; no action |

   A structural presumptive blocker carries the simpler design, rising to required where the change
   actively worsens the structure. Rank conflicting critiques by technical fact, then style guide, then
   engineering principle, then the surrounding code.

8. **Check the verification story** — what was run, whether the build passed, what was exercised by
   hand, what evidence a UI change carries. Name any claim the diff does not support: a test said to
   cover a path nothing asserts on.

9. **Record the lesson for each `Critical:` you close** — that class alone; a lesser finding is one the
   author is about to make anyway. Write it at the round that reads the fix, never while it is open:
   `Fix` and `References` name a change that does not exist yet. It is yours whoever typed the fix, and
   where no guard can be named the defect is not root-caused — say so, and the verdict stays `concerns`.

10. **Return the verdict** — `pass · concerns · block`. `block` is a stop-list item alone
    ([`safety-rails.md`](../../references/safety-rails.md), *The stop list*): a secret in the diff, a
    Critical or High security finding. Everything else that has to change first is `concerns`, and the
    caller routes the slice back. Quantify what is wrong rather than softening it, comment on the code
    and not the author, and treat "later" as a finding rather than a plan.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "The tests pass, so it's good" | A green suite grades none of axes 2, 3 and 4. |
| "The refactor makes it cleaner" | A reader holding the same concepts afterwards was handed relocated complexity. |
| "It's only a small addition to this file" | A small diff still pushes a file past a healthy size and bolts a branch onto an unrelated flow. |
| "We'll clean it up later" | Deferred cleanup has no owner and no round. |

## Red flags

- A verdict returned with no `path:line` under any finding.
- Ten nits and no structural finding, on a diff that restructured something.
- A `Critical:` closed with no `docs/lessons.md` entry — or an entry appended for a lesser class.
- A re-review brief carrying no prior findings, read as proof the slice was always clean.
- A changed assertion that no PR body and no log entry mentions, passed over in silence.
- "LGTM" with no evidence anything was read.

## Verification

- [ ] Every changed file is graded on all five axes; each finding carries a severity prefix and a
      `path:line`, the findings run in leverage order, and each structural one names a remedy.
- [ ] An oracle changed inside the diff is disclosed upstream, or standing as a `Critical:` finding.
- [ ] The verdict is `pass` (nothing above `Optional:` stands), `concerns` (a `Critical:` or required
      finding stands) or `block` (naming the stop-list item).
- [ ] Each `Critical:` closed this round reached `docs/lessons.md` or its absence is explained, and
      nothing below `Critical:` was appended there.

## Outputs & handoff

**Returned in conversation**, under three stable sections the caller reads: `## Verdict`
(`pass · concerns · block`), `## Findings` (severity-prefixed, `path:line`-cited, leverage-ordered),
`## Verification story` (what the author ran and whether it holds up).

**Appended to `docs/lessons.md`**: one entry per closed `Critical:` finding, cap 80 words, fields and
append rules in [`state-schema.md`](../../references/state-schema.md). Report each entry's word count
against that cap; an over-cap entry is trimmed, not handed on as if it fit. Dispatched into a worktree,
append nothing there — that branch may never merge — and hand the entry back with your findings, saying
it is still owed.

**Nothing else.** The diff, the tests and the artifacts you read stay untouched; no `STATE.md` row
([`state-schema.md`](../../references/state-schema.md)), no pull request opened or promoted. This is one
leg of the Review fan-out — the caller aggregates the legs, owns the slice's transition, and routes a
`concerns` slice back to `incremental-implementation`.
