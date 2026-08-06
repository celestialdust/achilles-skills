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
| 6 | Review | Read the diff on five axes — correctness, readability including test quality, architecture, security, performance — with parallel passes for simplification, security, and performance. | a ranked findings list |
| 7 | Ship | Open a **draft** pull request carrying a risk band, anchored to the diff. Run one stage at a time, a pre-launch checklist and a rollback plan come first; the autonomous runner does neither — it goes straight to the pull request. | an open draft pull request |

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
| Ship | The draft pull request is open, carries a risk band, and is anchored to the diff. Nothing is merged. Run one stage at a time, the pre-launch checklist and rollback plan gate it too; inside an autonomous run they are not checked, and that gap is the reason the risk band exists. | agent |
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

Three things cannot be edited to make a slice pass:

- `acceptance.md` — the signed behavioral contract.
- Any failing test written before the code that makes it pass — the test *is* the proof.
- Each slice's declared regression surface — the existing behavior the slice must not break.

Editing one of these to turn a failing gate green is **gate erosion**, and it is a stop condition rather
than a shortcut. The reason is simple: these three are the only evidence that does not come from whoever
wrote the code. Code that passes a test it rewrote proves nothing.

A UI slice's design contract is protected too, by a different mechanism. It is checked at dispatch, before
anything is built for that slice. A slice whose contract is absent or still draft halts right there, and
the halt names the contract by path. Verify checks it again as a second line of defence, for a slice that
reached Verify some other way. The protection is the signature, not a freeze: nothing gets built against a
contract a person has not signed.

If a frozen artifact is genuinely wrong, that is real and worth fixing — as a Spec change a person signs,
outside the run.

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
