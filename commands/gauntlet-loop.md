---
description: Fast path for a throwaway proof of concept — set a named outside bar, run a builder against a separate blind critic per piece, and loop until the critic picks ours. Production work uses the lifecycle commands.
---

Gauntlet loop — standalone, for throwaway work: a spike, a demo, a bake-off. Anything that ships goes
through `/ideate` … `/ship` instead, so this one is offered and never picked on your behalf.

Run `gauntlet-loop`. It fixes one named, fetchable outside reference as the bar — supplied, or picked by
you from the candidates it offers — then grinds a builder against a separate blind critic, piece by
piece, until the critic picks ours. Fetching the bar can mean running somebody else's code, so it shows
what it is about to fetch and waits for your yes.

Its default output is one paste-ready prompt for a fresh session, with a flat offer to run the loop here
instead.

Emits `.gauntlet/<slug>/` — the fetched bar, a directory per piece, `status.md`, the output — plus one
`.gitignore` line. Nothing in `src/`, no chain artifact, no board row.
