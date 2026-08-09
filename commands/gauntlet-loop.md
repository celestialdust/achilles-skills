---
description: Fast path for a throwaway proof of concept — set a named outside bar, run a builder against a separate blind critic per piece, and loop until the critic picks ours. Production work uses the lifecycle commands.
---

Invoke the `gauntlet-loop` skill. Standalone — no lifecycle gates, nothing blocks, `/orchestrate` untouched.

- **Two modes.** The default output is **one paste-ready prompt** for a fresh session, followed by a flat
  offer to run it here. Say run it and this session runs the loop itself.
- **The bar first.** Supplied a reference → it is used. None supplied → candidates are offered and the run
  **stops until you pick**.
- **Where it lands.** Everything — the fetched bar, the per-piece work, the progress page, the output — goes
  in `.gauntlet/<slug>/`, which the repository ignores. `src/` is untouched and there is nothing to commit.
  Where that ignore line is missing, the run asks you before adding it and stops if you say no.
- **Before it fetches.** Getting the bar can mean cloning, installing, and running somebody else's code, so
  the run shows you what it is about to fetch and waits for your yes — once per bar. The rule is in the skill.
- **What ends it.** The critic picks ours, blind, on every piece — or you stop the run.

## Notes

- This is the throwaway path: a spike, a demo, a bake-off. Anything that will ship goes through the lifecycle
  commands instead, `/ideate` through `/ship`.
- The three bar tests, the prompt template and its fill rules, and the failure modes live in the skill —
  this command is a thin entry point, not a restatement.
