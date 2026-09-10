# Teaching artifact format

What goes *inside* a `literate-explainer` artifact. One contract, two modes: **diff** (a change landed in
a repo) and **codebase** (onboarding onto an unfamiliar one), which orders survey facts pedagogically and
never re-surveys. Placement: the workspace layout in the top-level
[comprehension-workspace-format](../../../references/comprehension-workspace-format.md).

## The pedagogy contract

- **Background before mechanics.** A reader must never meet a mechanic they lack the context to read.
- **What → why → how.** Lead with what a concept is and why it exists, so each layer has a hook.
- **The Feynman test.** Plain enough to re-teach from with the source closed.

## Section order

Emit in order; omit an empty section whole, never stubbed.

1. **Header** — subject, mode, date, one line.
2. **Background** — the concepts, invariants and vocabulary needed below. A **proven-known** concept is
   not re-taught: a one-line pointer at most. On a cold start teach everything, with no hint history is
   missing.
3. **The literate tour** — the change, or the repo's core concepts.
4. **Worth-revisiting note** — ledger-derived; omitted whole when the ledger surfaces nothing.

## The tour — reading order, never file order

Order by the logic of the change: what a good reviewer would read, cause into effect, definition into
use — never by filename, directory order or alphabet. Codebase mode orders *concepts* the same way. Every
stop obeys what → why → how. A **durable concept** taught here grows the glossary and becomes quizzable;
ephemeral diff mechanics may be walked, never made durable.

## The worth-revisiting note

Its own labelled section, set apart so it is never mistaken for what the artifact teaches. It names the
learner's weak or stale durable concepts, joined from the ledger at read time; it lists, never re-teaches,
and gates nothing. On a cold start omit it whole — no empty note, no "no history yet".

## Microworld escalation

Default to prose, escalate to a static figure, escalate to an interactive figure or microworld last and
only where neither can teach the thing — a state machine you must step through, a parameter whose effect
must be felt. Where a figure teaches the same thing, emit the figure instead.

## Output modes

One self-contained HTML file: CSS, JS and figures inline, assets embedded, rendering from disk with no
network and no build. Markdown on request — same order, same pedagogy, static figures for widgets. Each
run registers one manifest entry.

## No quiz content, ever

An artifact teaches; it never quizzes. No quiz answer appears anywhere in its source — prose, HTML
comments, hidden elements, `data-*`, inline JS, embedded JSON. Reading the source before a quiz confers
no advantage.
