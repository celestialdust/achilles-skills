---
name: frontend-design
description: Use whenever you build or reshape ANY UI surface — a page, screen, component, or flow. Explore throwaway variants, commit ONE high-fidelity prototype as the build target, and write the signed design contract that Verify grades against. Invoke BEFORE any production UI; don't reach for a cream-serif-terracotta default.
---

# Frontend Design

## Purpose
**Stage: Spec (UI only).** This is the ONE skill that owns the UI. It does two things with a single
thesis: it **explores** throwaway variants to answer "what should this look like," then **commits ONE
high-fidelity prototype** = the build target — and writes the **design contract** that records the aesthetic
decisions in durable form. The same design thesis that authors the prototype here supplies the grading rubric
`quality-verification` uses in Verify: one mind writes the UI and checks the UI. Approach this as the design lead
at a small studio known for giving every client a visual identity that could not be mistaken for anyone
else's — make deliberate, opinionated choices about palette, typography, and layout specific to this brief,
and take one real aesthetic risk you can justify.

## When to use / when to skip
- **Use** when `prd.md` describes a feature with a **UI surface** (a page, screen, component, or flow) and
  the look is not already fully pinned. This runs in Spec, after `to-prd`, before `acceptance-criteria`/`environment-manifest`
  sign-off.
- **Skip** when the feature has **no UI** (a pure API, a CLI, a data pipeline) — then there is no design
  contract and `quality-verification` runs no design gate. Skip the *exploration* phase (go straight to commit) when the brief
  already pins the visual direction exactly — the brief's own words always win, including when it asks for a
  look you'd otherwise call a default.
- **depth: lite** — a tiny, low-stakes surface (one isolated component, an internal tool) may collapse to a
  single committed prototype + a 3-line contract; say so at the top and keep the rubric axes, just terse.

## Inputs
- **`prd.md`** (from `to-prd`) — read `Solution` and `User Stories` for what the surface must do and for whom;
  read `Out of Scope` for what NOT to design. **Refuse to run** if `prd.md` is absent (nothing to design
  against). `prd.md` carries no file paths or signatures by contract, so design freely.
- **`intent.md`** (optional, from `interview-me`) — `Outcome · User · Why` ground the subject. If memory holds
  the human's preferences or prior designs, use them as a hint.
- If `prd.md` describes **no UI surface**, emit nothing and hand back "no UI — skip frontend-design."

## Process: explore throwaway variants → commit ONE prototype + write the contract

### Phase 0 — Ground it in the subject
If the brief doesn't pin down what the product/subject is, pin it yourself: name one concrete subject, its
audience, and the page's single job, and state your choice. The subject's own world — its materials,
instruments, artifacts, vernacular — is where distinctive choices come from. Build with the brief's real
content throughout.

### Phase 1 — Explore with the visual companion (default)
When "what should this look like" is genuinely open, explore with the **visual companion** — the default
mechanism. Start it with `scripts/start-server.sh --project-dir . --open`; it prints a `server-started` JSON
line with a keyed `url`. Write **several structurally-different** mockup screens into its content dir, and the
human's **browser auto-opens** to the first one (it then shows the newest screen each time you write one).
When auto-open isn't possible — headless or remote — **share the printed URL** so the human opens it manually;
the companion works identically either way. It works **greenfield**, before any app or framework exists (no
running app needed). Default to **3** variants; cap at 5 (more stops being radically different). Variants must
be structurally different — different layout, information hierarchy, primary affordance — not three recolored
card grids.

Offer the companion **just-in-time and per-question**: a *visual* layout/look question goes to the browser; a
*textual* clarifying question (scope, terminology, a tradeoff) stays in the **terminal** — don't push the human
into the browser for words. The interesting feedback is usually "the header from B with the sidebar from C" —
that's the actual design; do most of this iteration in your own thinking and only surface ideas you have high
confidence will delight. **Exploration is scratch you discard** — throwaway screens stay in the gitignored
`.frontend-design/` working dir; only the agreed mockup survives (committed in Phase 3). See
`references/visual-companion.md` for the operating detail (start / loop / read-events / stop).

When the target app **already exists** and the design judgment depends on **real in-app data and density**,
escalate to the in-app `?variant=` switcher (see `references/exploring-variants.md`) so variants butt up
against the real header/sidebar/data rather than looking fine in a vacuum.

### Phase 2 — Plan the design (two-pass)
First, brainstorm a compact **token system** for the chosen direction:
- **Color** — the palette as 4–6 named hex values.
- **Type** — typefaces for 2+ roles (a characterful display face used with restraint, a complementary body
  face, a utility face for captions/data if needed); a clear type scale with intentional weights, widths,
  spacing.
- **Layout** — a layout concept in one-sentence prose + ASCII wireframes to compare.
- **Signature** — the single unique element this page will be remembered by, embodying the brief.

Then **review the plan against the brief before building**: if any part reads like the generic default you'd
produce for any similar page (work through a similar prompt to see if you land somewhere similar) rather than
a choice made for THIS brief — revise it, and say what you changed and why. Only after confirming relative
uniqueness do you write code, deriving every color and type decision from the revised plan.

### Phase 3 — Commit ONE high-fidelity prototype (the build target)
Build the chosen direction to a real quality floor — this committed prototype IS the build target Implement
works to, not a throwaway. When writing CSS, watch selector specificity: type-based (`.section`) vs
element-based (`.cta`) selectors easily cancel each other out, especially section paddings/margins. Critique
your own work as you build — take screenshots if your environment supports it (a picture is worth 1000
tokens). Apply Chanel's rule: before you ship it, remove one accessory.

### Phase 4 — Write the design contract
Record the locked decisions as the **design contract** (see the section below), `status: draft`. This is the
ONLY home for design floors/rubric/fidelity — none of it goes into `acceptance.md`. The human signs it
at the Spec gate (`status: signed`).

## Design rubric (= the design contract's stable sections AND the Verify grading axes)
These seven axes are written here in Spec and **re-read by `quality-verification` in Verify**: quality-verification grades the built UI
against (i) fidelity to this committed prototype and (ii) these axes. Fill every one in the contract.

1. **Distinctiveness / not-an-AI-default.** The hero is a thesis: open with the most characteristic thing in
   the subject's world (headline, image, animation, live demo, interactive moment). *Calibration:* AI-generated
   design right now clusters around three looks — (a) warm cream background (~#F4F1EA) + high-contrast serif
   display + terracotta accent; (b) near-black background + one bright acid-green/vermilion accent; (c)
   broadsheet layout with hairline rules, zero border-radius, dense newspaper columns. All are legitimate for
   *some* briefs, but they appear regardless of subject. Where the brief leaves an axis free, don't spend that
   freedom on a default. Name which (if any) you used and why it's a choice, not a reflex.
2. **Typography carries personality.** Pair display + body faces deliberately — not the families you'd reach
   for on any project. Make the type treatment a memorable part of the design, not a neutral delivery vehicle.
3. **Structure is information.** Numbering, eyebrows, dividers, labels must encode something true about the
   content, not decorate it. Numbered markers (01/02/03) are only right if the content actually is a sequence.
   Question every structural device before using it.
4. **Motion, deliberate.** Decide where/if animation serves the subject (page-load sequence, scroll reveal,
   hover micro-interactions, ambient atmosphere). An orchestrated moment lands harder than scattered effects;
   sometimes less is more — extra animation reads as AI-generated.
5. **Quality floor (the objective subset).** Responsive down to mobile · visible keyboard focus · reduced
   motion respected. Build to it without announcing it. (This trio is the accessibility floor `quality-verification` can check
   objectively.)
6. **Restraint / one signature.** Spend your boldness in one place; let the signature element be the one
   memorable thing and keep everything around it quiet. Match complexity to the vision — maximalist needs
   elaborate execution, minimal needs precision. Cut any decoration that doesn't serve the brief.
7. **Copy as design material.** Words exist to make the design easier to understand and use — design material,
   not decoration (see the writing section below).

## More on writing in design
Bring the same intentionality to copy as to spacing and color. Write from the end user's side of the screen:
name things by what people control and recognize, never by how the system is built (a person manages
notifications, not webhook config). Use active voice — a control says exactly what happens ("Save changes,"
not "Submit"); an action keeps its name through the whole flow (a "Publish" button produces a "Published"
toast). Treat failure and emptiness as direction, not mood: errors explain what went wrong and how to fix it,
in the interface's voice, never apologizing or vague; an empty screen is an invitation to act. Keep the
register conversational and tuned — plain verbs, sentence case, no filler. Let each element do exactly one job.

## Rationalizations
- *"The brief didn't pin a direction, so I'll go cream + serif + terracotta — it always looks clean."* → That
  is exactly an AI default (cluster a). Free axes are where you make a CHOICE for this brief, not where you
  spend the freedom on a reflex.
- *"Three variants is overkill, I'll just style the obvious card grid."* → Then you skipped exploration. If
  the look is genuinely open, structurally-different variants are how you find the non-obvious answer; "three
  tweaked card grids isn't a prototype, it's wallpaper."
- *"I'll put the accessibility/responsive requirements in acceptance.md so quality-verification tests them."* → No. ALL design
  floors live in this contract; `acceptance.md` is behavioral-only. quality-verification reads the contract for the design
  gate.
- *"The exploration variants are good code, I'll keep them around."* → Exploration is throwaway. Delete
  the losers and the switcher; only the committed prototype survives.
- *"Not taking a risk is the safe move."* → Not taking a risk is itself a risk; the client already rejected
  templated proposals.

## Red flags
- Variants that differ only in color or copy (a tweak, not a prototype — real variants disagree about
  structure).
- Landing on one of the three AI-default clusters on a free axis without a stated reason.
- Numbered markers / eyebrows / dividers used as decoration on content that isn't actually a sequence.
- Design requirements written into `acceptance.md` instead of the contract.
- Shipping an exploration variant straight to production (it was written under prototype constraints — rewrite
  it when you commit the build target).
- Two or more competing "signature" elements (boldness not spent in one place).
- A design contract missing any of the seven stable sections, or with the quality-floor trio unaddressed.

## Verification (ending criteria)
Done when ALL hold:
- Exactly **ONE** high-fidelity prototype is committed as the build target (exploration variants + switcher
  deleted or absorbed); it runs and meets the quality floor (responsive · visible focus · reduced motion).
- A **design contract** exists with all seven stable sections filled (`Distinctiveness · Typography ·
  Structure-as-information · Motion · Quality floor · Restraint · Copy-as-design-material`), `status: draft`,
  naming which AI-default cluster (if any) was used and why it's a choice.
- **No** design content leaked into `acceptance.md` (behavioral-only). The contract is the sole design
  home.
- The contract is a **separable artifact** `quality-verification` can re-read cold in Verify (where the design gate binds).
- Handed to the human for sign-off at the Spec gate; on sign-off `status: signed`. (`test-driven-development`/`quality-verification` refuse an
  unsigned or absent contract.)

## Outputs & handoff contract
- **Emits:** (1) a committed high-fidelity prototype = the build target; (2) the **design contract** — the
  **5th** signed Spec artifact (UI-only) — written to `docs/features/<slug>/design-contract.md`.
- **Stable sections** (consumers depend on these names): `Distinctiveness · Typography ·
  Structure-as-information · Motion · Quality floor (responsive/visible-focus/reduced-motion) · Restraint ·
  Copy-as-design-material`; plus `status: draft|signed`. Change a section's shape → update `quality-verification`'s design-gate
  reader in the same commit.
- **Consumed by:** `quality-verification` (Verify design gate: prototype-fidelity + these seven axes), and gating `test-driven-development`/`quality-verification`
  (both refuse to run against an unsigned/absent contract).
- **Re-invalidation rule:** any edit to `prd.md` flips the contract back to `status: draft` (it must be
  re-signed) — design floors can't silently drift from the product they were signed against.
- **STATE.md:** the feature stays in `spec`; set `gate: you` so the human signs intent + prd + acceptance +
  environment + (this) design contract together at the single Spec sign-off. No slice rows yet (slices are
  born in Plan).
