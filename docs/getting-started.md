# Getting Started with achilles-skills

achilles-skills works with any AI coding agent that accepts Markdown instructions. This guide covers the universal approach. For tool-specific setup, see the dedicated guides in this `docs/` directory.

The suite automates one development loop end to end:

```
IDEATE   →   SPEC   →   PLAN   →   IMPLEMENT   →   VERIFY   →   REVIEW   →   SHIP
(human-led: Ideate · Spec · Plan)        (agent-led, autonomous: Implement → Ship)
```

The **human owns Ideate + Spec + Plan** (the thinking). The agent then runs **Implement → Verify → Review → Ship** fully autonomously — it never blocks waiting for your input, and where a stop condition fires it terminates and reports instead of waiting ([workflow.md](workflow.md) lists them) — and terminates at **risk-banded open draft PRs** for async human merge. It never auto-merges to main.

## How Skills Work

Each skill is a Markdown file (`SKILL.md`) that describes a specific engineering workflow. When loaded into an agent's context, the agent follows the workflow — including verification steps, anti-patterns to avoid, and exit criteria.

**Skills are not reference docs.** They're step-by-step processes the agent follows.

## Quick Start

### Claude Code (recommended)

Install from the marketplace:

```
/plugin marketplace add celestialdust/achilles-skills
/plugin install achilles-skills@achilles-skills
```

This registers all 40 skills, the 5 review personas in `agents/`, and the 12 commands in `commands/` (9 lifecycle + 3 standalone) from the plugin manifest (`.claude-plugin/plugin.json`).

Local / development:

```bash
git clone https://github.com/celestialdust/achilles-skills.git
claude --plugin-dir /path/to/achilles-skills
```

### Any Agent (universal)

#### 1. Clone the repository

```bash
git clone https://github.com/celestialdust/achilles-skills.git
```

#### 2. Choose a skill

Browse the `skills/` directory. Each subdirectory holds one `SKILL.md` — the workflow itself, written to a fixed format ([CONTRIBUTING.md](../CONTRIBUTING.md#the-house-envelope) states it). Its opening sections say what the skill is for and when it applies, which is what you need to pick one.

#### 3. Load the skill into your agent

Copy the relevant `SKILL.md` content into your agent's system prompt, rules file, or conversation. The most common approaches:

**System prompt:** Paste the skill content at the start of the session.

**Rules file:** Add skill content to your project's rules file (`CLAUDE.md`, `.cursor/rules/`, `GEMINI.md`, etc.).

**Conversation:** Reference the skill when giving instructions: "Follow the test-driven-development process for this change."

#### 4. Use the meta-skill for discovery

Start with the `using-agent-skills` skill loaded. It's the meta-dispatcher: it maps an incoming task to the right skill and the right lifecycle stage, so you don't have to memorize the roster.

## Recommended Setup

### Minimal (start here)

Load the meta-dispatcher plus the essential skills into your rules file:

1. **using-agent-skills** — routes any task to the right skill + lifecycle stage
2. **codebase-research → spec-grilling** — for defining what to build: survey the code as it is today (`research.md`), then design the product against it (ADRs + CONTEXT.md). `spec-grilling` refuses to run without the survey, so load the pair.
3. **test-driven-development** — for proving it works (rigid RED-GREEN-REFACTOR)
4. **code-review** — for verifying quality before merge (five-axis review)

These cover the most critical quality gaps in AI-assisted development: an under-specified ask, untested code, and an unreviewed merge.

### Full lifecycle

Load skills by stage:

```
Ideate:     interview-me → idea-refine
Spec:       codebase-research → spec-grilling → to-prd → acceptance-criteria → environment-manifest → architecture-design → spec-review
            (frontend-design when there's UI)
Plan:       plan-breakdown
            (reuses Spec's research.md; codebase-design, api-design as referenced disciplines)
Implement:  incremental-implementation + test-driven-development
            (source-driven-development, worktree)
Verify:     quality-verification
            (browser-testing-with-devtools, debugging-and-error-recovery)
Review:     code-review + code-simplification + security-and-hardening + performance-optimization
            (doubt-driven-development for in-flight skepticism)
Ship:       pull-request
            (git-workflow, ci-cd, observability-and-instrumentation, deprecation-and-migration, documentation-and-adrs)
            (shipping-and-launch is release-level and runs once the human has merged)
```

### Autonomous run

To hand the agent the whole agent-led tail (Implement → Verify → Review → Ship) in one autonomous pass, use the **orchestrator** skill (via `/orchestrate`). It's the wave-parallel DAG runner: it sequences slices, runs the review fan-out once over each wave's combined diff (one fresh code-cold subagent per axis — the skill itself, not a role), and terminates at risk-banded open draft PRs — on one of the conditions `docs/workflow.md` lists it stops and reports rather than pausing for an answer, and it never auto-merges. Risky work is not one of those conditions: it raises the PR's risk band for the human at the merge gate.

### Context-aware loading

Don't load all skills at once — it wastes context. Load skills relevant to the current task:

- Working on UI? Load `frontend-design`
- Debugging a failure? Load `debugging-and-error-recovery`
- Setting up CI? Load `ci-cd`
- Grounding a framework decision? Load `source-driven-development`

## Skill Anatomy

Every skill follows the same **house envelope**: a short frontmatter block, then a body built from the same sequence of `##` sections — the slots — plus whatever else that one skill needs.

[CONTRIBUTING.md](../CONTRIBUTING.md#the-house-envelope) states the slots and what fills each, alongside the rest of the contribution workflow. This guide points at it rather than restating it, so there is one statement to keep true. [CONTEXT.md](../CONTEXT.md) carries the suite's shared vocabulary.

## Using Agents

The `agents/` directory contains pre-configured specialist personas. Each persona applies one review skill with **no prior context** — a fresh, code-cold pass that preserves maker≠checker:

| Agent | Source skill(s) | Role |
|-------|-----------------|------|
| [`code-reviewer.md`](../agents/code-reviewer.md) | code-review | Staff-engineer five-axis review before merge |
| [`security-auditor.md`](../agents/security-auditor.md) | security-and-hardening | Fresh code-cold OWASP / secrets / dependency audit of a diff |
| [`test-engineer.md`](../agents/test-engineer.md) | test-driven-development + quality-verification | Designs honest tests; proves a slice behaviorally |
| [`performance-auditor.md`](../agents/performance-auditor.md) | performance-optimization | Measure-first profiler; Core Web Vitals; hot paths |
| [`adversarial-reviewer.md`](../agents/adversarial-reviewer.md) | doubt-driven-development | Independent skeptic for confident / high-stakes in-flight decisions |

Load an agent definition when you need a specialized, independent review. For example, ask your coding agent to "review this change using the code-reviewer agent persona" and provide the agent definition. The six review skills (`code-review`, `security-and-hardening`, `test-driven-development`, `quality-verification`, `performance-optimization`, `doubt-driven-development`) each carry a `## Subagents` pointer to their matching persona.

## Using Commands

The `commands/` directory contains twelve Markdown slash commands for Claude Code — nine lifecycle commands plus three standalone (`/explain`, `/quiz`, `/gauntlet-loop`). Each is a thin wrapper that activates the right skill(s):

| Command | Skills invoked |
|---------|----------------|
| `/ideate` | interview-me, then idea-refine |
| `/spec` | codebase-research first, then spec-grilling (+ to-prd, acceptance-criteria, environment-manifest, frontend-design, architecture-design, spec-review) |
| `/plan` | plan-breakdown (reuses Spec's research.md) |
| `/implement` | incremental-implementation (applies test-driven-development) |
| `/verify` | quality-verification |
| `/review` | code-review (+ code-simplification, security-and-hardening, performance-optimization as fan-out) |
| `/ship` | pull-request — the spine of the stage; shipping-and-launch is release-level and follows the human's merge |
| `/orchestrate` | orchestrator — the autonomous wave-parallel DAG runner to open PRs |
| `/setup` | project-setup — one-time repo ecosystem |
| `/explain` | literate-explainer — **standalone**, not a lifecycle stage |
| `/quiz` | comprehension-quiz — **standalone**, not a lifecycle stage |
| `/gauntlet-loop` | gauntlet-loop — **standalone**, not a lifecycle stage; offered, never auto-selected |

Skills also activate based on what you're doing — designing an API pulls in `api-design`, building UI pulls in `frontend-design`, and so on.

## Using References

The `references/` directory contains supplementary checklists that skills pull in when they need detail beyond the workflow:

| Reference | Use with |
|-----------|----------|
| [`definition-of-done.md`](../references/definition-of-done.md) | using-agent-skills, plan-breakdown, incremental-implementation, shipping-and-launch |
| [`security-checklist.md`](../references/security-checklist.md) | security-and-hardening, code-review, shipping-and-launch |
| [`performance-checklist.md`](../references/performance-checklist.md) | performance-optimization, code-review, shipping-and-launch |
| [`accessibility-checklist.md`](../references/accessibility-checklist.md) | quality-verification, shipping-and-launch |
| [`observability-checklist.md`](../references/observability-checklist.md) | observability-and-instrumentation |
| [`finding-unknowns.md`](../references/finding-unknowns.md) | interview-me, idea-refine, spec-grilling |
| [`design-system-format.md`](../references/design-system-format.md) | frontend-design, quality-verification |
| [`teaching-artifact-format.md`](../references/teaching-artifact-format.md) | literate-explainer |
| [`comprehension-workspace-format.md`](../references/comprehension-workspace-format.md) | comprehension-quiz, literate-explainer |
| [`language-style.md`](../references/language-style.md) | every word the plugin ships — contributor-facing, never loaded at runtime |

Load a reference when you need detailed patterns beyond what the skill covers.

## Working Artifacts

The lifecycle commands create working artifacts as the agent moves through the stages. Treat them as **living documents** while the work is in progress:

| Stage | Artifact(s) | Produced by |
|-------|-------------|-------------|
| Setup | `STATE.md`, `CONTEXT.md`, `docs/adr/`, `docs/features/`, `docs/test-contract.md`, `docs/workflow.md`, `docs/session-state.md`, `docs/progress.md`, `docs/lessons.md`, the `## Agent skills` block in one of `CLAUDE.md` / `AGENTS.md`, and a short pointer to it in the other | project-setup |
| Ideate | `intent.md` | interview-me, idea-refine |
| Spec | `research.md` (first), `prd.md`, `acceptance.md`, `environment.md`, `architecture.md` + `architecture.html` (+ ADRs; plus root `ARCHITECTURE.md` on the repo's first structural pass) | codebase-research, spec-grilling, to-prd, acceptance-criteria, environment-manifest, architecture-design |
| Plan | `plan.md` | plan-breakdown (reads Spec's `research.md`) |
| Verify | `qa.md` | quality-verification |

- Keep them in version control during development so the human and the agent share one source of truth.
- Update them when scope or decisions change.
- If your repo doesn't want these files long-term, delete them before merge or add the folder to `.gitignore` — the workflow doesn't require them to be permanent.

The `handoff` skill compacts session state into a fresh-agent document at any point, so a new agent can resume without re-reading the full history.

## Other Agents

achilles-skills installs into every major coding agent. The mechanism differs per tool — see the dedicated guide for yours:

| Agent | Mechanism | Guide |
|-------|-----------|-------|
| Claude Code | Plugin marketplace (skills + agents + commands) | this guide, above |
| Cursor | Copy `SKILL.md` into `.cursor/rules/`, or reference the `skills/` directory | `docs/cursor-setup.md` |
| Antigravity CLI | Native plugin (`agy plugin install`) | `docs/antigravity-setup.md` |
| Gemini CLI | Native skills (`gemini skills install … --path skills`) or `GEMINI.md` | `docs/gemini-cli-setup.md` |
| Windsurf | Add skill contents to Windsurf rules | `docs/windsurf-setup.md` |
| OpenCode | Agent-driven execution via the `skill` tool, against the rules in `CLAUDE.md` | `docs/opencode-setup.md` |
| GitHub Copilot | `agents/` as personas + `.github/copilot-instructions.md` | `docs/copilot-setup.md` |
| Kiro IDE & CLI | Skills under `.kiro/skills/`; its `AGENTS.md` points at `CLAUDE.md` | [kiro.dev/docs/skills](https://kiro.dev/docs/skills/) |
| Codex / Other | Plain Markdown via system prompt; rules in `CLAUDE.md` | this guide |

Kiro and the plain-Markdown agents have no setup file in `docs/`, because neither needs one: Kiro's own
documentation is the guide for Kiro, and for any other Markdown-reading agent this guide plus
[`CLAUDE.md`](../CLAUDE.md) is the whole setup.

Every skill is plain Markdown, so any agent that accepts system prompts or instruction files can run them directly. [`CLAUDE.md`](../CLAUDE.md) at the repo root holds the rules whatever the agent; [`AGENTS.md`](../AGENTS.md) beside it is a short pointer to that file, so a tool that reads the other filename lands in the same place.

## Tips

1. **Start with the meta-skill.** Load `using-agent-skills` first so the agent routes work to the right skill and stage.
2. **Define before you build.** Run Ideate → Spec → Plan (human-led) before handing the agent the autonomous tail.
3. **Always load `test-driven-development`** when writing code — tests are the proof, not an afterthought.
4. **Don't skip verification steps** — every skill carries a `Verification` section saying how to tell it is finished, and that section is the whole point of it.
5. **Load skills selectively** — more context isn't always better. Pull in only what the current task needs.
6. **Use the personas for review** — a fresh, code-cold pass catches what the author cannot.
