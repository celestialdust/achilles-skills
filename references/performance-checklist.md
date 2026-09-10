# Performance checklist

The measure-first checks behind `performance-optimization`; `code-review` cites it for its performance
axis. Profile first; cite before/after numbers.

## Targets

LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1 are good; ≤ 4.0s / 500ms / 0.25 need work; worse is poor.

## TTFB over 800ms — read the Network waterfall

Slow DNS → `dns-prefetch` or `preconnect`. Slow TCP/TLS → HTTP/2, keep-alive, edge. Slow processing →
profile the backend, check queries, cache.

## Frontend

**Images.** WebP or AVIF; responsive `srcset`/`sizes`; explicit `width`/`height` on `<img>` and
`<source>` to prevent CLS; `loading="lazy"` + `decoding="async"` below the fold; the LCP image
`fetchpriority="high"`, never lazy.

**JavaScript.** Initial bundle under 200KB gzipped. Split routes and heavy features with `import()`.
Verify tree shaking (dependency ships ESM, marks `sideEffects: false`). Nothing blocking in `<head>` —
`defer` or `async`. Heavy computation to a Worker. `React.memo`, `useMemo` and `useCallback` only where
profiling shows the benefit.

**INP is a main-thread problem.** Break up tasks over 50ms. Yield inside long loops —
`scheduler.yield()` where available, else a `yieldToMain` pattern — so input events run between chunks;
`scheduler.postTask()` for priorities, `isInputPending()` to yield only when needed,
`requestIdleCallback` for deferrable work. Move non-critical work out of the handler. Load third-party
scripts `async`/`defer`, audit their size, put a facade in front of heavy ones.

**CSS.** Critical CSS inlined or preloaded; nothing non-critical render-blocking; no CSS-in-JS runtime
cost in production.

**Fonts.** 2–3 families, 2–3 weights — every extra weight is another request. WOFF2 only, self-hosted.
Preload the LCP-critical face. `font-display: swap`, `optional` when non-critical. Subset with
`unicode-range`. A variable font for several weights. Cut swap CLS with `size-adjust`,
`ascent-override`, `descent-override`. Consider the system stack first.

**Network.** Long `max-age` plus content hashing on static assets; `Cache-Control` on API responses;
HTTP/2 or 3; `preconnect` to known origins; `fetchpriority` on critical non-image resources; no needless
redirects.

**Rendering.** No layout thrashing — batch reads, then writes. Animate `transform` and `opacity` only.
Virtualize long lists. `content-visibility: auto` with `contain-intrinsic-size` off-screen. Keep bfcache
eligibility: no `unload` handlers, no `Cache-Control: no-store` on HTML. Clean up listeners, intervals
and refs — a leak grows until it crashes.

## Backend

**Database.** No N+1 — eager-load or join. Index filtered and sorted columns. Paginate every list
endpoint. Configure connection pooling; turn on slow-query logging.

**API.** p95 under 200ms. No synchronous heavy computation in a handler. Bulk operations, not a loop of
calls. Response compression; cache at the right layer.

**Infrastructure.** CDN for static assets; servers near users or at the edge; scale horizontally where
load needs it.

## Measuring

Start with field data — CrUX or your RUM tool. Record in the DevTools Performance panel while interacting
and look for long tasks triggered by clicks and keystrokes. Test on a mid-range Android or at 4×–6× CPU
throttling: INP problems often appear nowhere else.

```bash
npx lighthouse <url> --output json --output-path ./report.json   # then: npx vite-bundle-visualizer
```

```js
import { onINP } from 'web-vitals/attribution';   // attribution names the slow interaction
onINP(({ value, attribution }) => console.log(value, attribution));
```
