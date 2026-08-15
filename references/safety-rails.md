# Safety rails

The six things an agent in this suite does not decide for itself, stated once so no skill has to
restate them. Everything else is the model's call.

That last sentence is the point of the file. A suite that writes down every stop it can imagine
teaches an agent to look for permission, and an agent looking for permission stops in places nobody
meant it to. So the list is short and closed: **six rails, and outside them the model decides.** A
skill that wants a seventh is proposing a change to this file, not adding a line to its own.

Each rail below is here for the same reason: the cost of getting it wrong is not paid by the run that
got it wrong. Something outside the run — a shipped `main`, a leaked credential, a compromised
oracle — absorbs the damage, and no amount of the agent being careful afterwards puts it back.

---

## 1. A human merges

The autonomous span ends at an **open, risk-banded draft pull request on a branch**. Never
`gh pr merge`, never a push to `main` or `master`, never a deploy, never a release. A person merges,
and that merge is the last gate the work passes through — the only one with somebody's judgement in
it rather than a check's.

Everything a run produces is reversible up to that point and much of it is not afterwards, which is
the whole reason the line sits exactly there.

**Branch names**, since a rail about branches needs them: `cluster/C-<NNN>` for cluster work,
`feat/<slug>` for a feature outside one, `hotfix/<slug>`, `exp/<slug>` for an experiment. A slug is
lowercase, hyphenated, and carries no ticket id — ticket ids belong in commit messages, where they
are searchable, rather than in a name that has to be typed. One cluster is one branch; two clusters'
tickets never share one.

## 2. A secret never lands, and a value never leaves

A live credential in a diff is a **hard halt of that slice**: no retry, no pull request, and the
finding is reported as it stands. A credential already committed is worse, because its blast radius
is the whole repository rather than one diff — that fires a notification immediately, freezes the
next barrier, and opens no further PRs. Rotating it is the human's, and the report says where it was
found.

The narrower form of the same rail, and the one that gets broken by accident: **a value is never
printed, logged, echoed, or written down.** A probe reports that a credential is present, never what
it is. A run record says a credential was withheld, never which. This holds even where the value is
already in the environment and printing it would be convenient, because a log outlives the reason
somebody had for writing to it.

## 3. A Critical or High security finding stops the slice

Not a retry, not a warning attached to a passing verdict. The slice halts, no pull request opens for
it, and the finding tops the report.

Severity here is the auditor's, and it is a different scale from the risk band a pull request carries
— the shared word `HIGH` is the trap. A HIGH **band** never stops anything: it is a label telling a
person how hard to look before merging, and inside a run nothing pauses for high-risk work. A HIGH
**finding** stops the slice on contact. When in doubt about which one is in front of you, the finding
comes from an audit and names a vulnerability; the band comes from `pull-request` and names a diff.

## 4. Nothing edits what judges it

The signed `acceptance.md`, a failing test written before the code meant to pass it, a slice's
declared regression surface, and the repository's decided look in `docs/design.md` are **frozen while
a slice is being made to pass**. An edit to any of them that would turn a red gate green is
gate-erosion: the slice halts, and the halt names the artifact that was about to change.

The rail is not about honesty. It is that a check the maker can edit is not a check, and an agent
under retry pressure has every local reason to edit one — the failure is right there, the edit is one
line, and the run gets to be green. Making the artifact unavailable is what closes that off, rather
than asking the agent to want it less.

Two shapes of the same thing are worth naming because they do not look like edits:

- **The reward-hack signature** — the failure moved, but only because a test or a scenario changed
  while the implementation stayed materially the same. That is the same halt.
- **maker ≠ checker** — the agent that wrote a slice never verifies or reviews it. Verify and Review
  run as fresh, code-cold subagents that never see the implementer's reasoning, only the diff and the
  running build. An agent grading its own work is editing what judges it by a slower route.

These thaw between runs, not during one. A person can change any of them through a signed Spec
change, in the open, where the change is the subject rather than a step toward green.

## 5. One writer per file

Two agents dispatched in parallel never own the same file. Read subagents parallelize freely — that
is what makes a survey cheap — but a write needs an owner, declared at dispatch, and overlapping
ownership is a race whose loser's work vanishes with no error anywhere.

Where a wave's slices would overlap, **serialize them into sub-waves or merge them into one slice**.
Do not dispatch and hope. A slice that arrives with no declared file ownership cannot be checked for
overlap at all, which is why that is a refusal rather than a warning.

Two consequences that follow from the same rule rather than being separate rules:

- **Parallelize at the cluster or slice level, never inside a tightly-coupled slice.** Two slices in
  one wave are independent by construction; two steps in one slice are not.
- **A barrier waits for terminal states, never for success.** A halted or blocked slice satisfies the
  barrier, so the run drains every other branch instead of stalling on one that will never pass.

## 6. An unattended run does not start without its environment

A wave does not begin on a red environment row, or on an amber one nobody has attested. The reason is
narrow and worth stating: a run with no credentials does not fail cleanly at the point the credential
was needed — it fails deep inside a slice, after work, in a way that reads like a code defect. The
check is cheap and it runs once, at the front, where the answer is still legible.

The related rail is about who is present. A skill that needs a person — an interview, a taste call, a
confirmation before something irreversible — **checks whether one is there.** If somebody is, ask. If
nobody is, the slice ends and its gate flips to the human, with what was needed named. It does not
ask an empty room and wait.

---

## What is not on this list

Everything else. A run does not stop to summarize, to check in between waves, to confirm a judgement
call it is equipped to make, or to ask permission for work the plan already authorized. Where a
condition genuinely ends work, it **terminates and reports** rather than waiting — a stopped run is
picked up when a person next looks, and a run that sits idle waiting for an answer is a run that has
failed at the one thing it was for.

High-risk work is the case people expect to find here and it is deliberately absent. Authentication,
payments, destructive migrations, deletions, deploys: inside a run none of these stop anything. They
raise the risk band on the pull request, and a person triages the merge queue by that band. Building
one of them with somebody present is what the single-slice path is for — that path does stop before
the risky step and ask, because there is somebody there to answer.

## How a skill cites this

Name the rail, do not restate it: *"a secret in the diff is a hard halt (safety rail 2)"*. The rail's
reasoning lives here, and a copy of it in a skill is a copy that can drift from this one — at which
point a reader has two versions of a safety rule and no way to tell which one is current.
