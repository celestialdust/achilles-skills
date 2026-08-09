# Vendored code in `skills/frontend-design/scripts/`

> Evidence anchor for acceptance scenarios **A12** (no telemetry leaves the machine) and
> **A13** (vendored baseline recorded). Also the re-sync guide for pulling upstream fixes.

Two upstreams land in this directory, and they are unrelated to each other. One provenance file covers
both so there is nothing here that could disagree with a second copy of itself:

| Files | Upstream | Section |
|---|---|---|
| `server.cjs`, `start-server.sh`, `stop-server.sh`, `frame-template.html`, `helper.js` + their tests | superpowers `brainstorming` | **Part 1** (below) |
| `palette.mjs` + `tests/palette.test.js` | Impeccable | **Part 2** (end of file) |

---

# Part 1 — Visual Companion (superpowers)

## Baseline

- **Source:** superpowers `brainstorming` skill — visual-companion server.
- **Version:** `superpowers 6.0.3`
- **Upstream paths copied from:**
  - `skills/brainstorming/scripts/{server.cjs,start-server.sh,stop-server.sh,frame-template.html,helper.js}`
  - `tests/brainstorm-server/*` (the `*.test.js` + `*.test.sh` suite)
- **Vendored to:** `skills/frontend-design/scripts/` (+ `scripts/tests/`).
- **Date vendored:** 2026-06-28
- **Runtime:** Node ≥18, stdlib only (`crypto`/`http`/`fs`/`path`/`os`/`child_process`), hand-rolled
  WebSocket (RFC 6455). **No third-party runtime dependency.** `ws@^8` is a **test-only** devDependency.

## Enumerated diff vs. upstream (everything else is byte-for-byte)

The core HTTP / WebSocket / session-key auth / file-watch / lifecycle logic is kept **byte-for-byte** so
upstream fixes can be diffed in later. The only changes:

1. **Telemetry strip (`server.cjs`).** The one outbound network touch upstream — a remote brand-logo
   `<img>` beacon — is removed.
   - Deleted the remote brand-logo URL constant
     (`const SUPERPOWERS_BRAND_IMAGE_URL = 'https://primeradiant.com/brand/…png'`).
   - Deleted the telemetry-disable env-var probe (`TELEMETRY_DISABLE_ENV_VARS` /
     `SUPERPOWERS_TELEMETRY_DISABLED`).
   - Rewrote `brandMarkup()` to a **logo-less, network-free** header: no `<img>`, no remote URL, no
     wrapping `github.com` link. `renderBranding()` is unchanged (it just splices `brandMarkup()` into
     the `<!-- BRANDING -->` placeholder).

   **Before:**
   ```js
   function brandMarkup() {
     const version = escapeHtmlText(SUPERPOWERS_VERSION);
     const text = SUPERPOWERS_TELEMETRY_DISABLED
       ? 'Prime Radiant Superpowers v' + version
       : 'Superpowers v' + version;
     const logo = SUPERPOWERS_TELEMETRY_DISABLED
       ? ''
       : '<img class="brand-logo" src="' + SUPERPOWERS_BRAND_IMAGE_URL + '?v=' + encodeURIComponent(SUPERPOWERS_VERSION) + '" alt="Prime Radiant" referrerpolicy="no-referrer" decoding="async">';
     return '<div class="brand"><a href="https://github.com/obra/superpowers">' + logo + '<span class="brand-copy">' + text + '</span></a></div>';
   }
   ```
   **After:**
   ```js
   function brandMarkup() {
     // VENDOR DIFF (telemetry strip + rebrand): upstream rendered a remote
     // primeradiant.com <img> brand logo wrapped in a github.com link. Replaced with
     // a logo-less, network-free, neutral brand — no <img>, no remote URL, no fetch.
     // See VENDORED.md.
     return '<div class="brand"><span class="brand-text">Frontend Design — Visual Companion</span></div>';
   }
   ```

2. **Rebrand user-visible strings only** → **"Frontend Design — Visual Companion"** (page `<title>`s and
   the `<h1>`/header brand text in `server.cjs`'s waiting & bootstrap pages and in
   `frame-template.html`'s `<title>`). No internal identifiers renamed.

3. **Working-dir rename (user-facing).** `<project>/.superpowers/brainstorm/` → `<project>/.frontend-design/`
   in `start-server.sh` (session-dir + `.last-port`/`.last-token` paths) and the matching `stop-server.sh`
   comment. The `state/` and `content/` subdir names are unchanged.

4. **Internal `BRAINSTORM_*` env-var names kept byte-for-byte** (`BRAINSTORM_DIR`, `BRAINSTORM_PORT`,
   `BRAINSTORM_TOKEN`, `BRAINSTORM_OPEN`, `BRAINSTORM_PORT_FILE`, `BRAINSTORM_TOKEN_FILE`, …) and the
   `brainstorm-key-<port>` cookie / `brainstorm-session-key` sessionStorage names — to minimize the diff.

### Retained-but-now-unused (kept byte-for-byte for diffability)

The telemetry strip leaves three helpers with no caller. They are intentionally **not** deleted so the
re-sync diff stays minimal: `readSuperpowersVersion()` + `const SUPERPOWERS_VERSION` (the rebranded header
no longer prints a version), `isTruthyEnv()` (only the deleted telemetry probe used it), and
`escapeHtmlText()` (only the old `brandMarkup()` used it). All three are pure/local; none touch the network.
`SUPERPOWERS_VERSION` resolves to `'unknown'` in this repo (no `package.json`/`.codex-plugin/plugin.json` at
the vendored root) and is never rendered.

## Full network-touch audit (all five vendored files)

Grep run over each file for: `https?:` · `//` (protocol-relative) · `fetch` · `request(` · `sendBeacon` ·
`XMLHttpRequest` · `curl` · `wget` · `@import` · `fonts.` · `cdn` · `.com`, plus a sweep for
`<link>` / `<script src>` / CSS `url()` / `@font-face` / web-fonts. Every meaningful hit, classified:

| File | Match | Classification | Notes |
|---|---|---|---|
| `server.cjs` | `SUPERPOWERS_BRAND_IMAGE_URL = 'https://primeradiant.com/…'` | **REMOVED** | The only upstream outbound touch — deleted in the strip. Now appears only inside a `VENDOR DIFF` comment documenting the removal. |
| `server.cjs` | `<img class="brand-logo" src=…>` (in old `brandMarkup`) | **REMOVED** | Deleted with the strip; no `<img>` is rendered. |
| `server.cjs` | `<a href="https://github.com/obra/superpowers">` | **REMOVED** | Brand link dropped; not auto-fetched even when present, but removed entirely. |
| `server.cjs:280` | `'http://' + urlHostForHttp(URL_HOST) + ':' + PORT + '/?key=' + TOKEN` (`companionUrl()`) | local | Builds the **loopback** URL printed for the human / handed to the browser launcher. The server never fetches it. |
| `server.cjs:375` | `origin === 'http://' + host` (`isAllowedWebSocketOrigin`) | local | String **comparison** of the WS `Origin` header against the same-origin host. No request. |
| `server.cjs` (many) | `//` , `.com`, `request(` | comment / false-positive | `// ====` section headers, explanatory comments, `package.json` mention, and the `VENDOR DIFF` notes. No code. |
| `helper.js:34` | `'ws://' + window.location.host + …` (`websocketUrl()`) | local | Browser-side **same-origin** WebSocket back to the local companion. The only network call helper.js makes; no `fetch`/`sendBeacon`/`XMLHttpRequest`. |
| `helper.js` (rest) | `//` | comment | Inline comments only. |
| `frame-template.html` | — | n/a | **No matches.** No `<link>`, `<script src>`, `url()`, `@font-face`, `@import`, or CDN. Fonts are `system-ui, -apple-system, …` (local). |
| `start-server.sh` | — | n/a | **No matches.** No `curl`/`wget`/URLs. |
| `stop-server.sh` | — | n/a | **No matches.** |

**Verdict: ZERO outbound network calls remain after the strip.** The only `http://`/`ws://` strings are
the local loopback companion URL and the same-origin WebSocket; no remote assets, fonts, CDNs, or beacons.

### Behavioral proof (not just string-match)

`tests/egress.test.js` runs the companion under `tests/egress-guard.cjs`, which patches
`net.Socket.prototype.connect` (the chokepoint every Node TCP/TLS client connection funnels through) and
records each outbound attempt. A launch → serve → click → shutdown round-trip is driven, then the test
asserts the server opened **zero** outbound (non-loopback) sockets. A positive control opens a real
non-loopback connect first and asserts the guard records it, so the zero-egress assertion can't pass
vacuously. `tests/branding.test.js` adds the string-level check (no `primeradiant`, no `<img>`, no
`http(s)://` in the served HTML).

## Test suite (vendored + adapted)

Under `scripts/tests/`. Adapted from upstream `tests/brainstorm-server/`: require/script paths re-pointed
from `../../skills/brainstorming/scripts/…` to `../…`, and the working-dir name to `.frontend-design/`.

- `ws-protocol.test.js`, `helper.test.js`, `browser-launcher.test.js` — pure unit (no server).
- `auth.test.js`, `server.test.js`, `lifecycle.test.js` — integration (spawn the server; `ws` client).
- `branding.test.js` — **repurposed** from upstream's brand-beacon test into the telemetry-strip assertion.
- `egress.test.js` (+ `egress-guard.cjs`) — **new**; the A12 egress-silence proof.
- `start-server.test.sh`, `stop-server.test.sh` — bash (platform/PID-ownership behavior).
- `windows-lifecycle.test.sh` — vendored as-is (path-adapted); **self-skips off Windows**. Its Tests 4–6
  still run on non-Windows and each `sleep 75`s (slow, ~2.5 min), so it is **not** part of `npm test`; run
  it manually when needed.

Run: `npm install` (test-only `ws`), then `npm test` (= `node --test tests/*.test.js`) and the two bash
tests. NOTE: `node --test tests/` (bare directory positional) is broken on Node ≥23 (it treats the dir as a
module); the glob form `node --test tests/*.test.js` is used instead.

## Re-sync procedure

1. Diff this dir against `superpowers <new-version>/skills/brainstorming/scripts/` (and `tests/brainstorm-server/`).
2. Re-apply the four diff items above (telemetry strip · rebrand · working-dir rename · keep `BRAINSTORM_*`).
3. Re-run the full network-touch audit; update the table. Update the **Version** above.

## Residual risk

Cross-platform WS/browser-launcher paths are vendored but only verified on darwin locally. Windows/Linux
coverage relies on the vendored upstream tests (`windows-lifecycle.test.sh` self-skips off Windows).

---

# Part 2 — `palette.mjs` (Impeccable)

## Baseline

- **Source:** Impeccable — `skills/impeccable/scripts/palette.mjs`
- **Version:** `impeccable 4.0.4`
- **Vendored to:** `skills/frontend-design/scripts/palette.mjs` (+ `tests/palette.test.js`)
- **Date vendored:** 2026-08-09
- **Runtime:** Node, `node:crypto` only. No third-party dependency, no file read, no network.

## What it is, and why this one and not the other 101

A brand-seed picker. It returns one OKLCH anchor colour out of **128 hand-curated seeds**, each carrying a
mood phrase and a composition strategy, and prints the rules for composing a 5-role palette around it.

Impeccable ships ~30,000 lines of script. This is the only file worth carrying, for one reason: it is
**data, not logic.** The 128 seeds were curated from ~400 candidates; that judgment cannot be regenerated,
whereas every other script is machinery for a system this repo does not run. The rest was left behind:
`live-*` (18 files, 20,602 ln) mutates the project and duplicates the companion in this same directory,
which is greenfield and CI-covered; `hook-*` + `hooks.json` (3,503 ln) need a hooks entry point this
plugin does not declare; `context.mjs` resolves a path layout this repo does not use.

**It also carries the anti-argmax property on its own.** `--from <key>` hashes to a seed deterministically,
so an outside key rather than the model's own preference decides the anchor. That is the mechanism
`concept-seed.mjs` reaches an external API for — and this file gets it with no network at all.

## Enumerated diff vs. upstream (everything else is byte-for-byte)

The 128 seed entries and all selection logic are unchanged. Only the surrounding text and one env-var name:

1. **Env var renamed** — `IMPECCABLE_PALETTE_SEED` → `BRAINSTORM_PALETTE_SEED`, matching the twelve
   `BRAINSTORM_*` names the rest of this directory already uses.
2. **Brief paths repointed** — `PRODUCT.md / DESIGN.md` → `docs/design.md`, the feature's `prd.md`
   (two sites: the header comment and the printed guidance).
3. **Dangling `SKILL.md` citations removed** (three sites). Upstream told the reader that the colour
   strategies and hard rules were "already in SKILL.md" — but the file **prints all of them itself**, so
   the citations pointed at a document for content it already contained. Rewritten to say "below" /
   "stated here", which makes the script self-contained rather than dependent on a file this repo has not
   written yet.
4. **Broken docstring example fixed** — `--id seed-021` → `--id seed-000`. `seed-021` does not exist;
   upstream's own Usage block cites an id that is not in its seed table (`grep -c seed-021` upstream = 1,
   the docstring line itself). Running it exits 2.

## Proof, not assertion

`tests/palette.test.js`, 9 assertions. Two of them exist because of defects found while porting:

- **Every invocation in the Usage block is executed** and must exit 0. This is what caught diff item 4,
  and it is the check `frontend-design:66` would have needed — that line documents
  `start-server.sh --project-dir .`, which fails, because `start-server.sh:151` does `cd "$SCRIPT_DIR"`
  and the relative PID/log paths then resolve under the script dir. A docstring nobody executes is a
  comment.
- **Egress silence**, under the same `tests/egress-guard.cjs` used for A12, with the same positive
  control. This is not paranoia about this file: its upstream sibling `concept-seed.mjs` POSTs telemetry
  at `:210-211`, so "this one doesn't" had to be proved behaviourally rather than by reading it.

All three of these checks were **exercised against a deliberately broken fixture** and confirmed to fail:
restoring the `seed-021` docstring, reintroducing `IMPECCABLE_`, and adding a beacon to `impeccable.style`
each produced the expected FAIL. A check that cannot fail reads exactly like one that passes.

## Re-sync procedure

1. Diff against `impeccable <new-version>/skills/impeccable/scripts/palette.mjs`.
2. Re-apply the four diff items above.
3. Run `node tests/palette.test.js`. If upstream added a seed, the count assertion still holds (it asserts
   spread, not a fixed number); if upstream added a Usage line, the docstring test executes it
   automatically — no test edit needed.

## Not vendored, and why it stays that way

`concept-seed.mjs` (704 ln) is the external-dice mechanism: it resolves challengers from
`https://impeccable.style/api/roll` so the model cannot settle on its own highest-probability answer. It is
the one Impeccable capability with no equivalent here, and it was left out because it needs a third party's
service to stay up, and because its telemetry POST at `:210-211` would regress A12 unless stripped.
`palette.mjs --from <key>` covers the core of the same idea offline. Revisit only if freshness — challengers
that change over time — turns out to matter more than independence.
