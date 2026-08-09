# How this project ships work

This project runs one loop, from idea to merged code. This file is the whole contract: the stages, who
owns each gate, where a run ends, what stops one, what is frozen, and what never happens. You do not need
any tool installed to read it.

Two parties do the work. A **person** decides what to build and whether to take the result. A **coding
agent** does the mechanical mileage in between.

The documents named below live in fixed places: per-feature documents under `docs/features/<slug>/`,
architectural decision records under `docs/adr/`, the shared glossary at `CONTEXT.md`, and the work board
at `STATE.md`. The board is one table of features and their slices, with a `gate` column naming who owns
the next action.

## The stages

Seven stages, in order. Work does not skip ahead.

| # | Stage | What happens | What it produces |
|---|---|---|---|
| 1 | Ideate | Interview the person with the idea until the intent is clear. Diverge, then converge. Write down what is explicitly *not* being built. | `intent.md` |
| 2 | Spec | Survey the codebase as it is today, then decide the design against that survey rather than against memory. Record the decisions, the domain vocabulary, the product spec, the behavioral contract, and every external thing the build will need. | `research.md`, the decision records, `CONTEXT.md`, `prd.md`, `acceptance.md`, `environment.md`, and a design contract for UI work |
| 3 | Plan | Cut the work into thin vertical slices — each one a complete path through the system, not a horizontal layer — and order them into a dependency graph. Each slice declares the files it owns. | `plan.md`, plus slice rows on the board |
| 4 | Implement | Build one slice. Stub it end to end so it compiles, write the failing test, write the smallest code that passes it, refactor, run the full suite, commit as one revertible unit. | the slice's commit |
| 5 | Verify | A reader who did not write the code drives the running build through every scenario in the behavioral contract and records, per scenario, whether it passed, failed, or could not be reached. | `qa.md` |
| 6 | Review | Read the diff on five axes — correctness, readability including test quality, architecture, security, performance — with parallel passes for simplification, security, and performance. Those four passes are a floor: facts about the diff can add a specialist, and nothing removes one. | a ranked findings list |
| 7 | Ship | Open a **draft** pull request carrying a risk band, anchored to the diff. That is the whole stage, one slice at a time or inside a run. The pre-launch checklist, the staged rollout, and the rollback plan belong to a release, and a release happens after a person merges. | an open draft pull request |

Stages 1–3 are led by a person. Stages 4–7 are executed by the agent in one pass, called a **run**.

## Who owns each gate

A gate is a point where work stops until something is true. Each gate has exactly one owner: the party
that decides whether it opens. Ownership is per gate, not per stage.

| Gate | Opens when | Owner |
|---|---|---|
| Ideate sign-off | `intent.md` names the outcome, the user, what success looks like, and what is not being built — and the person with the idea agrees. | person |
| Spec sign-off | `acceptance.md` is signed rather than draft, and the decision records, `prd.md`, `environment.md`, and glossary are agreed. UI work also needs a signed design contract. | person |
| Plan sign-off | `plan.md` holds vertical slices with a dependency graph and per-slice file ownership, and the person has read it. | person |
| Environment readiness | Every row of `environment.md` is green, or is amber and a person has attested it. The probe is read-only and never reads a secret's value; it reports green, amber, or red. Red is a refusal. Amber means the row cannot be checked without spending paid quota or taking a human-only login — it stays a refusal until a person answers the probe's question. An unanswered amber denies. | the agent probes; a person provisions what is missing and answers the amber questions |
| Run start | The board holds the feature with its slice graph, the environment verdict is green, and the signed `acceptance.md` and the `plan.md` slices exist. | agent |
| Verify | Every scenario in `acceptance.md` has been exercised against the running build and recorded, by a reader who did not write the code. A UI slice also passes the design gate. | agent |
| Review | The five-axis review and its parallel passes leave no Critical finding and no Required finding open on the slice. A Required finding may instead be deferred on the record, with a reason. Optional, Nit, and FYI findings do not hold the gate. A finding sends only its own slice back to Implement. | agent |
| Ship | The draft pull request is open, carries a risk band, and is anchored to the diff. Nothing is merged. Neither the pre-launch checklist nor the rollback plan gates this: one slice's pull request is not a release, and the release runbook is written afterwards, on the far side of the merge. The risk band is what tells the person at the merge gate how much blast radius they are taking on. | agent |
| Merge | A person reads the pull request and merges it. | person |

The shape is deliberate. People own both ends — what gets built, and whether it is taken — and the agent
owns the middle. The agent never opens a gate a person owns: it does not sign an artifact on the person's
behalf, and it does not merge.

## Where a run ends

A run is one pass over the slice graph, Implement through Ship. It has exactly two endings.

- **It finishes.** Every slice reached Ship. The result is one or more **open, draft** pull requests, each
  carrying a risk band that says how much blast radius the change has. They stay open until a person
  merges them.
- **It stops.** One of the conditions in the next section fired. If a slice is affected, it is marked
  halted or blocked on the board and its `gate` flips from the agent to the person. Either way the run
  reports what stopped it and where.

Both endings are terminal. In neither case does the run sit idle waiting for an answer.

That distinction is worth stating plainly, because two different claims are easy to collapse into one:

- **A run never blocks waiting for input.** There is no "should I continue?" checkpoint between slices.
  Nobody has to sit and watch it.
- **A run can stop.** Several conditions end one early. The next section lists them.

Both are true. A run that hits a stop condition does not wait for you — it terminates and reports, and you
pick it up whenever you next look.

The agent opens pull requests. It does not merge them, does not push to a protected branch, and does not
deploy. The merge is a person's decision, every time.

## What stops a run

These conditions end work rather than pausing it. Some end the whole run. Some end only the affected
slice and let the rest of the graph keep draining. The middle column says which. None of them waits for
an answer.

| Condition | Ends | What you see when it fires |
|---|---|---|
| **The run's preconditions are not met.** Checked once, at run start. The board has no feature with a slice graph, or the environment verdict is not green, or a signed `acceptance.md` or the `plan.md` slices are missing. | the run | The run refuses to start and nothing is built. Finish Spec and Plan, provision the environment, then start again. |
| **The slice graph has a cycle.** Two slices each wait on the other, directly or through a chain. | the run | No wave can be ordered, so nothing is dispatched. The cycle is reported and a person reorders the dependencies. |
| **The behavioral contract is missing or unsigned.** The same fact, checked one layer down. Verify will not grade a slice against an `acceptance.md` that is absent or still marked draft. Inside a run the row above has already refused, so this row governs Verify run on its own — and backstops any slice that reached Verify some other way. | the slice | The slice never enters Verify. The feature goes back to the Spec sign-off gate. No scenarios are invented to fill the gap. |
| **A UI slice's design contract is missing or unsigned.** A slice that names a design contract is checked before anything is built for it. | the slice | The slice halts before any code is written for it, and the halt names the unsigned contract by path. Nothing gets built against a contract nobody signed. |
| **A frozen artifact was about to be edited to make a gate pass.** See "What is frozen" below. | the slice | A stop, not a pass. The slice halts and the attempted edit is reported. |
| **A check was about to be weakened.** Dropping a review pass, deleting a guard, switching off a scenario, or merging two checks into one — at any point, including in the plan. | the slice | Refused on the spot rather than parked for approval. The slice halts, and the refusal names the specific measurement that would settle the case — the number that does not exist yet. |
| **A security finding is Critical or High, or a secret appears in the diff.** | the slice | A hard stop: no retry, no pull request for that slice. The finding is reported as it stands. |
| **Two sources of truth disagree.** Two documents state the same thing differently and the order under "Source-of-truth order" does not settle which one governs. | the slice | The slice ends. What ended it names both files and the claim they disagree on, and its `gate` flips from the agent to you. Nothing is picked on your behalf, and nothing waits for your answer — the rest of the graph keeps draining and you settle it when you next look. |
| **The retries ran out.** A real failure first routes into root-cause debugging and is retried a bounded number of times; exhausting those retries is what stops the slice. | the slice | The slice stays at the stage that failed, its `gate` flips from the agent to you, and the failure surfaces with a record of what was tried. |
| **Gates are failing at a rising rate across the run.** Not one slice going wrong, but the run as a whole drifting. | the run | The run terminates instead of grinding on. What already passed still stands; the rest is reported unfinished. |

### High-risk work is not one of these

Authentication and permissions, destructive migrations, payments, deletions, deploys, secrets. This work
carries more blast radius than the rest, and where it gets caught depends on how the slice is built.

- **One slice at a time, with a person present.** The single-slice Implement path stops before the risky
  step and asks for explicit sign-off. Somebody is there to answer.
- **Inside a run.** Nothing stops. There is nobody to sign off mid-run, and a run does not wait for one.
  The risk surfaces at the end instead: the slice's draft pull request carries a **risk band**, and auth,
  payments, data, secrets, and irreversible operations raise it. A person triages the merge queue by that
  band.

So inside a run, high-risk work is caught by a person at the merge gate, not by the agent mid-flight. To
have it caught before the code is written, build that slice on the single-slice path instead.

## What is frozen

Four things cannot be edited to make a slice pass:

- `acceptance.md` — the signed behavioral contract.
- Any failing test written before the code that makes it pass — the test *is* the proof.
- Each slice's declared regression surface — the existing behavior the slice must not break.
- Any **ACTIVE** row in the repository's test contract, at `docs/test-contract.md` — a scenario the whole
  repository owes rather than one feature. That file starts empty, and a repository with no ACTIVE row is
  untouched by this line.

Editing one of these to turn a failing gate green is **gate erosion**, and it is a stop condition rather
than a shortcut. The reason is simple: these four are the only evidence that does not come from whoever
wrote the code. Code that passes a test it rewrote proves nothing.

The four are not frozen for the same length of time, and the difference is the point.

**The first three are frozen for the retry loop.** They do not move while a slice retries. Between runs
they can change — as a Spec change a person signs, outside the run. If one of them is genuinely wrong,
that is real and worth fixing, and that is the route.

**An ACTIVE test-contract row is frozen permanently, in every run.** There is no loop it thaws after, and
no Spec change unfreezes it. A person can add a row, and a person can move a row from PENDING to ACTIVE.
Nothing moves a row back. The agent never moves one in either direction — it reads that file and does not
write to it.

That asymmetry is what makes an ACTIVE row worth writing. A guarantee the agent can switch off is not a
guarantee: under retry pressure, switching it off is always the cheapest way to make a failing gate green.
If an ACTIVE row turns out to be wrong, that too is real and worth fixing — as a decision a person makes
and records outside any run, never as an edit inside one.

Reporting a scenario as *could not be reached* is not editing it. A slice that cannot construct a
scenario's starting state says so, and the scenario — in `acceptance.md` or in the test contract — stays
where it is, unproven, with a person named to settle it. Nothing stopped being checked, so nothing stops.

A UI slice's design contract is protected too, by a different mechanism. It is checked at dispatch, before
anything is built for that slice. A slice whose contract is absent or still draft halts right there, and
the halt names the contract by path. Verify checks it again as a second line of defence, for a slice that
reached Verify some other way. The protection is the signature, not a freeze: nothing gets built against a
contract a person has not signed.

The repository's decided look, at `docs/design.md`, is the other half of that oracle: where a contract says
an axis is unchanged from the rest of the repository, Verify grades that axis against this file. It carries
no signature of its own — it is written in the same act as the contract a person signs — so the signature
mechanism above does not reach it, and the rule is stated instead. No slice edits it. Editing the decided
look so that what was built matches it is weakening a check to turn a failing gate green, which is gate
erosion and stops the slice like any other.

## Source-of-truth order

Two documents can state the same thing differently. This order says which one governs, most
authoritative first. A repository that does not have one of these simply skips its rank.

1. `CLAUDE.md` / `AGENTS.md` — the rules for this repository
2. `docs/workflow.md` — this file: how work ships here
3. `ARCHITECTURE.md` — the repository's structure
4. `docs/adr/` — the decisions taken, and what each one ruled out
5. `prd.md` — one feature's product spec
6. `acceptance.md` — that feature's signed behavioral contract
7. `plan.md` — that feature's slices
8. `docs/test-contract.md` — the scenarios this repository must never lose
9. `docs/lessons.md` — what a past defect taught, and the guard that would catch it again
10. `docs/progress.md` — what each slice actually executed

**One exception, and `docs/test-contract.md` states it itself.** An **ACTIVE** row there beats a feature
scenario that contradicts it, whatever these two ranks say. A row is ACTIVE only because a person made it
permanent, and nothing moves it back — so an order that let a feature renegotiate one would hand the
agent the switch the freeze exists to take away. A PENDING row enforces nothing and takes rank 8 as
written.

Not every document has a rank. `STATE.md`, `CONTEXT.md`, and the per-feature `intent.md`, `research.md`,
`environment.md`, and `qa.md` have none. Two more settle themselves instead of needing one:
`docs/session-state.md` says in its own text that it is the weakest source here and never overrides a
decision record or a signed `acceptance.md`; and a feature's design contract and `docs/design.md` divide
one subject rather than compete for it — the contract decides that surface, and `docs/design.md` decides
every axis the contract marks inherited. Where two documents with no rank between them disagree, nothing
here settles it, and the stop condition above is what happens: the slice ends, both files and the claim
are named, and the next move is yours.

## Who writes what

Every file above has parts — the table calls one a **zone** — and each zone has exactly one writer. A file
with two writers is not by itself a problem: more than one party appends to the glossary, and they add
different terms. Two writers on the same zone is a problem, because neither can see what the other
assumed, and whichever runs second quietly decides.

Four things a writer may do to a zone:

- **create** — write it where nothing was. Writing it again replaces what was there.
- **append only** — add after what is there, and never reword, re-order, re-date, or remove any of it.
- **flip status** — change one declared token in place, and nothing else.
- **never** — do not write it at all.

| File | Zone | Who writes it | What they may do |
|---|---|---|---|
| `CLAUDE.md` / `AGENTS.md` | the `## Agent skills` block | `project-setup` | create |
| `CLAUDE.md` / `AGENTS.md` | the pointer line, in whichever of the two does not hold that block | `project-setup` | create |
| `CLAUDE.md` / `AGENTS.md` | everything else in the file | you | create |
| `docs/workflow.md` | the whole file, copied from the bundled process contract | `project-setup` | create |
| `docs/workflow.md` | any local edit to it | nobody | never |
| `docs/adr/` | the directory | `project-setup` | create |
| `docs/adr/` | a record for a decision taken during Spec | `spec-grilling` | create |
| `docs/adr/` | a record for a decision taken outside Spec, and any record superseding another | `documentation-and-adrs` | create |
| `docs/adr/` | a record already written | nobody | never |
| `CONTEXT.md` | the file and its `## Glossary` heading | `project-setup` | create |
| `CONTEXT.md` | a term resolved during Spec | `spec-grilling` | append only |
| `CONTEXT.md` | a term a decision record introduces | `documentation-and-adrs` | append only |
| `CONTEXT.md` | a definition already written, corrected before the Spec gate | `spec-review` | create |
| `docs/test-contract.md` | the file and its `## Rows` heading | `project-setup` | create |
| `docs/test-contract.md` | a row under `## Rows` | you | append only |
| `docs/test-contract.md` | a row's `state:` | you | flip status |
| `docs/test-contract.md` | any part of it, by any skill | nobody | never |
| `STATE.md` | the legend and the slice-row column list | `project-setup` | create |
| `STATE.md` | a feature block and its slice rows | `plan-breakdown` | create |
| `STATE.md` | `origin:` — the `research.md` entry | `codebase-research` | append only |
| `STATE.md` | `origin:` — the ADR ids | `spec-grilling` | append only |
| `STATE.md` | `origin:` — the `prd.md` entry | `to-prd` | append only |
| `STATE.md` | `origin:` — the `acceptance.md` entry | `acceptance-criteria` | append only |
| `STATE.md` | `origin:` — the `environment.md` entry | `environment-manifest` | append only |
| `STATE.md` | `origin:` — the `plan.md` entry | `plan-breakdown` | append only |
| `STATE.md` | a feature block's `feature:` state | `orchestrator` | flip status |
| `STATE.md` | a slice row's `State` and `Gate` | `orchestrator` | flip status |
| `STATE.md` | `Artifacts` — the security findings entry | `security-and-hardening` | append only |
| `STATE.md` | `Artifacts` — the release runbook entry | `shipping-and-launch` | append only |
| `STATE.md` | `Artifacts` — every other entry | `orchestrator` | append only |
| `docs/session-state.md` | the file, its five field headings and `## Log` | `project-setup` | create |
| `docs/session-state.md` | the five fields | `handoff` | create |
| `docs/session-state.md` | `## Log` | `handoff` | append only |
| `docs/session-state.md` | an entry already in `## Log` | nobody | never |
| `docs/design.md` | the whole file, from the first user interface built here | `frontend-design` | create |
| `docs/design.md` | any part of it, for every surface after the first | nobody | never |
| `docs/features/<slug>/` | the directory | `project-setup` | create |
| `docs/features/<slug>/` | the committed prototype under `prototype/` | `frontend-design` | create |
| `docs/features/<slug>/` | the security findings file | `security-and-hardening` | create |
| `intent.md` | the file | `interview-me` | create |
| `intent.md` | its sections, sharpened in place | `idea-refine` | create |
| `research.md` | the file | `codebase-research` | create |
| `prd.md` | the file | `to-prd` | create |
| `prd.md` | a decidable fact corrected before the Spec gate | `spec-review` | create |
| `acceptance.md` | the file, while it is draft | `acceptance-criteria` | create |
| `acceptance.md` | a decidable fact corrected before the Spec gate, while it is draft | `spec-review` | create |
| `acceptance.md` | any part of it, once signed | nobody | never |
| `environment.md` | the file | `environment-manifest` | create |
| `environment.md` | a decidable fact corrected before the Spec gate | `spec-review` | create |
| `design-contract.md` | the file | `frontend-design` | create |
| `plan.md` | the file | `plan-breakdown` | create |
| `plan.md` | the interface contracts written into it | `api-design` | create |
| `qa.md` | the file | `quality-verification` | create |
| `docs/lessons.md` | an entry for a root-caused defect | `debugging-and-error-recovery` | append only |
| `docs/lessons.md` | an entry for a Critical review finding | `code-review` | append only |
| `docs/lessons.md` | an entry already written | nobody | never |

The lessons record is the case worth reading twice. Two parties write it and neither is wrong: one records
what a defect turned out to be, the other records a Critical finding a review caught. They write different
entries for different reasons, so the file has two writers and no zone of it has two. Keyed by file alone,
that arrangement would read as a violation and the rule would have to carve an exception for it — which is
why the key is the zone, not the file.

## What never happens

- The agent never merges, never pushes to a protected branch, never deploys. A run ends at an open draft
  pull request.
- No "should I continue?" checkpoint interrupts a run.
- Nobody grades their own work. Whoever wrote a slice never verifies or reviews it. Verify and Review run
  without access to the implementer's reasoning — against the running build and the diff.
- No implementation is written before the test that fails without it.
- No missing upstream document is filled in by guesswork. An absent or unsigned spec stops the work.
- No secret value, credential, or shell command is written into any of these documents. `environment.md`
  records *what* is needed and of what kind, never the value.
- No frozen artifact is edited to clear a gate.
