---
description: Design the product before any code — survey the codebase, hold one design sitting, then draft a spec bundle the person signs in a single act.
---

Spec runs in five phases, grouped by **who acts** — not by which artifacts share an input, because information dependency says what cannot be parallel, not what belongs together.

```
1  SURVEY          agent               the goal-blind survey
2  DESIGN SITTING  person, one context grilling -> the PRD (one agent beat) -> the UI exploration (UI only)
3  DRAFT           agent, parallel     acceptance || environment, then the structure pass
4  HARDEN          agent, code-cold    the whole draft bundle
5  GATE            person, one sitting read the cleaned handback and architecture.html, then sign it all at once
```

Two sittings and one signature. `acceptance-criteria` presents its draft when it lands, because it is the oracle everything downstream depends on — but it is signed with the rest, at the gate.

Each phase runs through its owning skill:

- codebase-research — the goal-blind survey of the repository as it is today, scoped by intent.md. It writes research.md; every decision below is taken against it, not against recollection.
- spec-grilling — the spine of the stage. It turns the locked idea (intent.md) into the design: architectural decisions (docs/adr/) and CONTEXT.md, and it refuses to run without research.md. Its tree carries a structural branch — which parts earn their existence, what has to be swappable, what a consumer of the feature's surface may depend on. It fans out `codebase-design` / `api-design` variants on a load-bearing structural question; batches the rest as one-line defaults.
- to-prd — the light dual-audience PRD (prd.md), product-altitude, referencing the ADRs.
- frontend-design — only where the feature decides what something looks like. `frontend-design`'s own *When to use / when to skip* states that test in full, with the cases that decide a borderline one; read it there rather than judging from this line. Where it applies: explore variants, then commit a prototype + design contract. On the repo's first UI surface it also writes docs/design.md, the decided look every later surface inherits. `frontend-design` runs in Spec after `to-prd` and **before `acceptance-criteria` and `environment-manifest` run** — not merely before they are signed. Exploring an interface surfaces behaviour a `prd.md` omits (the empty state, the failed save), and that has to reach `acceptance.md` while it is being written rather than after it exists.
- acceptance-criteria and environment-manifest — the behavioral Given/When/Then contract (acceptance.md) and the typed-kind manifest (environment.md: kinds only, no values, no commands). They run in parallel: one shared input, neither reads the other, disjoint files.
- architecture-design — runs against a draft `acceptance.md`; the two are signed together at the Spec gate. `architecture-design` reconciles, grades, and renders: it traces every `acceptance.md` scenario through the structure, records the invariants, has what it wrote graded code-cold, and cites the decisions taken during `spec-grilling` rather than taking them itself. It writes architecture.md and the committed architecture.html page.
- spec-review — last: a fresh, code-cold agent hardens the whole draft bundle before the person reads it.

`codebase-design` and `api-design` are referenced disciplines, not sequential stages, and own no artifact of their own — what they produce lands in a file another skill owns. Each states where it runs and who dispatches it; there are more dispatch sites than this line could keep true.

## Mode

Spec is human-led — one of the three stages (Ideate, Spec, Plan) the human owns. Phases 2 and 5 are the person's and run interactively; the rest are agent beats between them. Produce the spec artifacts only — do NOT start implementing.

## Notes

- Upstream: reads intent.md from /ideate — it is what scopes the survey. If no intent exists, pin the idea down with the user first (an inline one-paragraph outcome is enough to scope codebase-research), then survey, then grill.
- Downstream: the signed bundle + ADRs + CONTEXT.md feed /plan. Do not cross into planning here. research.md carries over too, as pass 1 — /plan runs codebase-research again over the aspect the signed decisions point at.
- The artifact filenames (intent.md, research.md, prd.md, acceptance.md, environment.md, architecture.md, architecture.html, CONTEXT.md) are the spec→plan contract — keep them exact.
