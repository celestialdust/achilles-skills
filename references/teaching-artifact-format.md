# Teaching artifact format

The structure contract for the teaching artifacts `literate-explainer` emits. One contract, two
modes: a **diff-mode** artifact (the daily case — an agent-landed change to a target repo) and a
**codebase-mode** artifact (onboarding onto an unfamiliar target repo) share every rule below.
Codebase mode orders survey facts pedagogically; it never re-surveys — its facts trace to the
machine survey. Where the artifact lives, how it is named, and the workspace surfaces it
registers into live in `references/comprehension-workspace-format.md`; this file governs only what
is *inside* the artifact.

## The pedagogy contract — holds in every section

- **Background before mechanics.** The artifact opens with the context needed to interpret the
  change (or the repo), *before* any changed or surveyed code. A reader must never meet a mechanic
  they lack the context to read.
- **What → why → how.** Every concept leads with *what it is* and *why it exists* before *how it
  works*. The framing precedes the detail so each layer has a hook to hang on.
- **The Feynman test.** Every explanation is plain enough to re-teach from, without leaning on the
  code. A gap in the explanation is a gap in understanding — if a passage only makes sense with the
  source open beside it, it is not done.

## Section order

Emit these sections in order. A section with no content for this run is omitted whole, never stubbed.

1. **Header** — subject, mode (diff | codebase), and date. One line the reader can orient from.
2. **Background** — the concepts, invariants, and vocabulary needed to read what follows. A
   **proven-known** background concept (its latest ledger grade passes) is *not re-taught*: at most a
   one-line pointer acknowledges it as already known. On a cold start this section teaches
   everything from scratch, with no hint that history is missing.
3. **The literate tour** — the change (diff mode) or the repo's core concepts (codebase mode),
   walked in reading order (see below).
4. **Worth-revisiting note** — ledger-derived; omitted entirely when the ledger has nothing to
   surface (see below).

## The literate tour — reading order, never file order

Order the tour by the **logic of the change** — the sequence a good reviewer would read to
understand it, following cause into effect and definition into use. Never by file name, directory
order, or alphabetization. In codebase mode the same rule orders *concepts*: the
load-bearing idea first, then what depends on it, in the order that builds a mental model fastest —
the survey supplies the facts, the tour supplies the order. Each stop obeys the
what → why → how contract. A **durable concept** taught here is the unit that later grows the learner
glossary and becomes quizzable; ephemeral diff mechanics may be walked but are never durable.

## The worth-revisiting note

- **Placement.** Its own clearly-labelled section, set apart from the taught material so it is never
  mistaken for what this artifact teaches — a look-back, not part of the lesson.
- **Content.** It names the learner's weak or stale **durable concepts** — those whose latest ledger
  grade failed, or whose last passing grade is stale — derived by joining the learning ledger at read
  time. It lists; it does not re-teach.
- **Never gates.** The note is advisory. It blocks nothing, requires nothing, and is safe to ignore —
  there is no "you must revisit before continuing".
- **Cold start.** When the comprehension workspace is new or the ledger holds nothing to surface, the
  note is omitted whole. A cold-start artifact stands alone: no empty note, no "no history yet", no
  dangling reference to sessions that never happened.

## Microworld escalation — the anti-slop refuse rule

An artifact may escalate a concept to an **interactive figure or microworld** (an inline widget the
reader manipulates) *only* when prose and a static figure genuinely cannot teach it — a state machine
you must step through, a parameter whose effect must be felt. **If a static figure teaches the same
thing, emit the static figure and refuse the widget**. Interactivity is earned by teaching
leverage that prose and a diagram cannot reach, never added for decoration. Default to prose;
escalate to a static figure; escalate to a microworld last and only under this rule.

## Output modes

- **Primary — one self-contained HTML file.** All CSS, all JS, and every figure are inline; assets
  are embedded (e.g. data URIs), never linked. It renders correctly opened straight from disk with
  **no network access and no build step**. Any microworld runs from that inline JS alone.
- **Markdown — on request.** When the learner asks for markdown, emit the same structure contract as
  a plain `.md` file: identical section order, identical pedagogy, static figures in place of widgets.

Both modes register exactly one explainer manifest entry per run (format in
`references/comprehension-workspace-format.md`).

## The hard negative — no quiz content in the artifact

An artifact teaches; it never quizzes. **No quiz question's answer may appear anywhere in an
artifact's source** — not in visible prose, not in HTML comments, hidden elements, `data-*`
attributes, inline JS, or embedded JSON. Quiz content lives only in the conversation,
authored by `comprehension-quiz`. Inspecting an artifact's full source before a quiz must confer no
advantage. When in doubt, an artifact carries explanation, never an answer key.

## Naming and placement

- Artifacts live in the **comprehension workspace**, outside the target repo — writing a teaching
  artifact into the target repo is forbidden, so employer repos and OSS clones stay byte-clean.
- Filenames are **date-prefixed kebab-case** and unique per emission — they are the `artifact` join key.
  The exact filename schema, the directory, and the manifest line format live in
  `references/comprehension-workspace-format.md` — do not restate them here.
