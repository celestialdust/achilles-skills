---
description: Review stage quality gate — five-axis code-review with a parallel fan-out to code-simplification, security-and-hardening, and performance-optimization. Runs before merge; surfaces findings, never auto-merges.
---

Review stage (agent-run, the sixth stage of Ideate → Spec → Plan → Implement → Verify → Review → Ship).

Invoke the `code-review` skill as the spine, with a parallel fan-out to `code-simplification`, `security-and-hardening`, and `performance-optimization`.

Those four are a **floor, not a list**. They run on every review. Facts about the diff can only ADD to them; nothing removes a reviewer, because dropping one is a loosening and a loosening needs a measurement and a human.

Each fact below is something you can settle by reading the diff — the outside caller exists or it does not, the old name is still referenced or it is not. A fact you cannot establish does not fire, and the floor four still run.

| The fact that fires the row | Adds |
|---|---|
| The diff changes a symbol, route, or schema that a file **outside** the diff imports or calls | `api-design` — is this addition rather than modification, and does any existing caller break? |
| The diff deletes or renames a file, exported symbol, or persisted field, and something outside the diff still names the old one | `deprecation-and-migration` — is there a replacement and a migration path, or are callers stranded? |
| The diff changes CI, build, or deploy configuration | `ci-cd` — the pipeline is part of what judges the work; a step removed there is a loosening |
| The diff adds an error branch, retry, background job, or outbound call that emits no log, metric, or trace | `observability-and-instrumentation` — a production failure on that path leaves no evidence |

This table is the same roster the `orchestrator` skill states under *Verify barrier & wave-aggregate review* — one roster, not two. Change one, change both.

1. `code-review` — the five-axis pass (correctness, readability incl. test quality, architecture, security, performance). Label every finding `Critical:` | *no prefix = Required* | `Optional:` | `Nit:` | `FYI`, each with a `file:line` citation.
2. Fan out in parallel — these are read-only passes with no shared writes, so dispatch each SKILL as its own fresh-context, code-cold subagent. The skill is the method; there is no role to play on top of it.
   - `code-simplification` — behavior-preserving reduction; respect Chesterton's Fence.
   - `security-and-hardening` — OWASP Top 10, secrets, dependency audit.
   - `performance-optimization` — measure-first; hot paths, data fetching, bundle/render cost.
3. Scope: **one fan-out over the union of the diffs under review**, never one per slice — per-slice fan-out is the token sink the orchestrator forbids outright. Consolidate the streams into one ranked, de-duplicated list ordered Critical → Required → Optional → Nit → FYI. When the review covers a wave of slices, also attribute every finding to its owning slice **by file** — the disjoint-file guard means each file belongs to exactly one slice, so attribution is unambiguous and a finding routes only its owning slice back for a fix. Reviewing a plain diff outside a wave, there is nothing to attribute: the ranked list is the output.

## Mode

Agent-run quality gate before merge. It reports findings; it does not edit, merge, or push. This is the gate `/ship` depends on.

**Two circuit-breakers stop it.** Either one is a hard halt — no retry, no PR. In an orchestrated run the halt lands on the owning slice; standalone, it stops the review of that diff:

- **Security.** A CRITICAL/HIGH finding, or a secret in the diff. A *committed* secret has repo-wide blast radius, so it also freezes the run.
- **Gate-erosion** (defined in `code-review`). The diff weakens a frozen `acceptance.md` assertion, deletes or narrows a RED test, or shrinks the declared `Regression surface` while the implementation is materially unchanged. That is the reward-hack signature: the goalposts moved instead of the code. It raises `Critical:` and signals a gate-erosion HALT — never an approval. Catching this is the whole reason a code-cold reviewer reads the diff, so a gate-erosion signal is a stop, not a finding to route back.

Short of those two, it runs to completion.

## Notes

- `doubt-driven-development` is deliberately NOT part of this gate — it is in-flight adversarial review, reached for during `/implement`, not here.
- Hand off: route `Critical:` and Required findings back to `/implement` to fix; when the review comes back clean, proceed to `/ship`. A circuit-breaker halt is not a route-back — it stops the work and goes to a human.
