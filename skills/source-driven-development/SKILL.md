---
name: source-driven-development
description: Ground version-sensitive code in docs fetched this run, not recalled API shape — resolve the installed version, fetch the matching page, cite the URL in the code. Use it before routing, forms, data fetching, auth or a platform API. Not whole-diff review (`code-review`) or dependency CVEs (`security-and-hardening`).
---

# Source-Driven Development

## Purpose

**Stage: Implement.** Principles 6, 7, 8.

Grounds a version-sensitive decision in a page fetched this pass rather than recalled API shape: resolve
the installed version, fetch that feature's page, build against the signature it shows, cite the URL
beside the code. `incremental-implementation` or `test-driven-development` pulls it in mid-slice; the
citations ride that caller's diff as evidence a code-cold review can check without the maker's context.
Recall holds patterns that read as current and were replaced two majors ago.

## When to use / when to skip

- Version-sensitive code is about to be written — routing, forms, data fetching, auth, state, config,
  build setup, a browser or runtime API.
- The sentence forming is "I think the signature is…".
- Framework code is being read for stale patterns, a dependency just crossed a major, or two APIs solve
  the same thing and the version's own docs say which one it ships.
- Skip renames, typos, file moves and pure logic — a version changes nothing there.
- Near-miss — five-axis grading of a whole diff: `code-review`, which reads these citations. Dependency
  CVEs and supply chain: `security-and-hardening`. Which dependency to adopt: `architecture-design`.

## Inputs

- the dependency manifest (`package.json` · `pyproject.toml` · `go.mod` · `Cargo.toml`) — helps: the
  installed version, what makes a pattern current or stale · without it: the lockfile, the vendored
  package, the imports, the runtime the scripts invoke — say which, `derived`
- `docs/features/<slug>/environment.md` `runtime-dep` rows — helps: cross-checking the stack, never the
  version (the rows carry no values) · without it: the manifest and the imports, `derived`
- `docs/features/<slug>/plan/<slice-id>.md` — helps: which page to fetch — an API reference, not a
  homepage · without it: the code about to be written, `derived`
- a way to fetch a page — helps: the document itself · without it: the vendored types and source in the
  tree, every unconfirmed pattern marked `UNVERIFIED:`

At most three questions with a person present, only where the version stays unresolvable and a major
boundary decides the pattern.

## The Process

1. **Resolve the version before fetching, and say where each came from** — the manifest for the declared
   range, the lockfile for what resolved. A range is not an installation.

2. **Fetch the page for the feature you are building, at the version you resolved** — that hook's API
   reference, that route helper; never the homepage, never the whole site. Rank what you fetch:

   | Rank | Source |
   |---|---|
   | 1 | official documentation |
   | 2 | the project's blog or changelog |
   | 3 | web standards — MDN, the spec |
   | 4 | compatibility data — caniuse, node.green |
   | — | never: Stack Overflow, a tutorial, an AI-written summary, recall |

3. **Read it for the deprecation and migration notes, not only the happy-path snippet** — the signature,
   the required options, whatever it marks legacy. Carry the browser or runtime support data with any
   platform feature behaviour rests on.

4. **Build against the signature you fetched**, taking the documented current way and leaving the
   deprecated one alone.

5. **Mark whatever you could not confirm `UNVERIFIED:` on the line itself**, naming what you looked for
   and did not find.

6. **Settle a disagreement between two official sources against the version you resolved** — prefer the
   version-specific page, or run the smaller claim once against the installed version to see which
   holds; record the settlement as step 7 does.

7. **Default to the documented pattern where the docs disagree with the repository's own code**, say why,
   name the codebase-consistent alternative in a Decided-for-you row, and append one
   `docs/session-log.md` entry. Only the stop list
   ([`safety-rails.md`](../../references/safety-rails.md)) ends a slice.

8. **Cite every version-sensitive pattern where the code is**, two comment lines —
   `// <framework> <version> <feature>` then `// Source: <full URL>`. Full URLs, never a shortener,
   anchored deep where the page has one — an anchor outlives a restructure a top-level page does not.
   Quote the passage carrying a decision the code alone leaves unobvious.

## Rationalizations

| The excuse | The reality |
|---|---|
| "I'm confident about this API." | Confidence tracks familiarity, not the version on disk. |
| "Fetching a page costs tokens." | An hour on a signature that moved costs more than one fetch. |
| "`^18` in the manifest is close enough." | A range is a permission; the lockfile says what shipped. |
| "I'll say in the message it might be stale." | A hedge in prose is gone next session; an `UNVERIFIED:` marker rides the diff. |
| "The repo does it the other way — I'll ask which." | The repo's way was written against some version; an unattended question stalls the slice, and a default with a reason reverses from the pull request. |

## Red flags

- A framework call written before any version was resolved.
- "I believe" or "I think" standing where a URL should be.
- A homepage, a search page, a Stack Overflow answer or an AI-written summary cited for a signature.
- A deprecated API the version's own migration note names, still in the diff.
- A hedge in the prose where the line carries no `UNVERIFIED:` marker.
- A conflict resolved with no reason and no Decided-for-you row.

## Verification

- [ ] The resolved version stands with the file it came from; anything inferred is marked `derived`.
- [ ] Every version-sensitive line traces to a page fetched this pass, cited beside it in the two-line
      shape by full URL.
- [ ] Every cited page is official documentation, a changelog, a web-standards reference or
      compatibility data.
- [ ] No deprecated API survives the diff, against that version's migration notes.
- [ ] Whatever the docs left uncovered carries an `UNVERIFIED:` marker naming what was looked for.
- [ ] Every conflict, document against document or documents against the repository, is settled with a
      reason and a Decided-for-you row.

## Outputs & handoff

- **Citations and `UNVERIFIED:` markers in the caller's diff** — the two comment lines of step 8, keyed
  off downstream by the `Source:` token. No artifact of its own and no `STATE.md` row: the caller owns
  the slice's transition ([`state-schema.md`](../../references/state-schema.md)).
- **`docs/session-log.md`** — one entry per settled conflict or derived version, cap 60 words, shape in
  [`state-schema.md`](../../references/state-schema.md). Report the measured count against the cap; trim
  an over-cap entry rather than hand it on, and where the file does not exist hand the entry back for
  `project-setup`.
- **Returned in conversation** — the resolved stack with each version's source, the URLs fetched, the
  `UNVERIFIED:` list with its reasons, the Decided-for-you rows, and any question a person present would
  have been asked.
- **Verdict** — none: this pass grades nothing.
