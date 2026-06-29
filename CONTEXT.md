# Project context

> Repo-wide glossary. Devoid of implementation detail — terms only. `project-setup` seeds this file;
> `spec-grilling` appends resolved terms under `## Glossary` as they land during Spec.

## Glossary

<!-- One entry per ubiquitous-language term: **Term** — plain-language definition (no code, no file paths). -->

## achilles-skills vocabulary

> The structural vocabulary of the suite itself (not the consuming project's domain language).

- **Skill** — a single discipline written in the house envelope, living at `skills/<name>/SKILL.md`. Reachable
  by the agent automatically or by a command. Names are descriptive and function-implying (e.g.
  `performance-optimization`, not `perf`).
- **Persona** (a.k.a. *agent*) — a thin role file at `agents/<name>.md` that a skill dispatches as a fresh,
  code-cold subagent. The persona is the *role*; the skill it points at is the *method*. Personas exist to
  preserve maker≠checker — the reviewer never shares the maker's context.
- **Command** (a.k.a. *lifecycle-command*) — a slash command at `commands/<name>.md` that maps one lifecycle
  stage (Ideate · Spec · Plan · Implement · Verify · Review · Ship, plus `/orchestrate` and `/setup`) to the
  skill(s) that run it. A command is a thin entry point, not a restatement of the skill.
- **Artifact** — a contract file passed between stages (`intent.md`, `prd.md`, `plan.md`, `research.md`,
  `acceptance.md`, `environment.md`, `qa.md`, `STATE.md`). Artifact names are independent of skill names.
