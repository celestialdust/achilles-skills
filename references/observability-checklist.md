# Observability checklist

Instrumenting production code, behind `observability-and-instrumentation`.

## Start from the on-call questions

Telemetry without a question is noise. Write down 2–4 questions an on-call engineer will ask and map
every signal to one. Metrics say **that** something is wrong, traces **where**, logs **why**.

## Structured logging

- Structured JSON with stable event names, never string interpolation
- A correlation ID generated or accepted at the boundary, on every line, propagated outbound and across
  every async boundary
- Levels: `error` an invariant broke · `warn` degraded but handled · `info` a business event · `debug`
  off in production
- No secrets, tokens, passwords or unredacted PII; allowlist fields rather than log whole bodies or
  headers
- External calls logged as metadata only — endpoint, status, latency, attempts, sanitized ids
- Spot-check the real output: structured fields, not `[object Object]`

## Metrics

- RED on every endpoint and external dependency (rate, errors, duration); USE on every resource — queues,
  pools, hosts (utilization, saturation, errors)
- Latency as a histogram, p50/p95/p99 queryable, never an average — averages hide the 1% having a
  terrible time
- Labels from small fixed sets; never user ids, emails, raw URLs, request ids or error text —
  cardinality takes the metrics system down, not the app
- Status codes grouped by class (`5xx`, not `503`); queue depth and processing duration tracked for every
  worker and queue

## Tracing

- OpenTelemetry initialized at startup before other imports, auto-instrumenting HTTP, gRPC and DB clients
- Context propagated outbound, extracted inbound (`traceparent`), carried through queue messages — the
  trace dies at the gap
- Manual spans only around meaningful internal work, carrying the attributes on-call filters by, and no
  secrets or PII among them; head-based sampling at a low rate, keeping 100% of errors under tail
  sampling

## Alerting

- Alert on symptoms users feel; cause metrics (CPU, disk, restarts) go to dashboards, not pagers
- Delete any alert whose response is "ignore it, it self-heals"
- Link every alert to a runbook: what it means, the first query, who to escalate to
- Justify every threshold and duration by an SLO or historical data, not a guess
- Two severities only: `page` (act now), `ticket` (act this week)
- Test-fire each new alert once: right channel, working runbook link

## Dashboards

A service-health dashboard — error rate, p99 latency, traffic, saturation — plus a per-dependency panel,
answering the on-call questions above rather than everything except the answer. Default to 1h–6h.

## Verify the telemetry

Instrumentation is code and can be wrong. Force an error in staging and find it by correlation ID. Send
test traffic and confirm the series appear with expected labels and values. Follow one request end to end
with no broken spans. Then diagnose an induced failure from telemetry alone, without reading the source.

## Pre-launch gate

This blocks a release, not a slice's draft pull request. Before production: structured logs reach the
aggregator; RED metrics are visible for every new endpoint and dependency; one symptom-based alert has a
runbook and was test-fired; a request is traceable across every service; on-call knows where the
runbooks are.
