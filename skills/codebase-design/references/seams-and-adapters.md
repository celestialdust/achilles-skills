# Seams and adapters — classifying a dependency, and testing across it

Loaded at Step 4 of [SKILL.md](../SKILL.md), whose vocabulary this uses — **module**, **interface**,
**seam**, **adapter**. The category a dependency falls into is what decides how the module is tested
across its seam, so classify before choosing a testing approach rather than after.

## The four categories

### 1. In-process
Pure computation, in-memory state, no I/O. Always deepenable: merge the modules and test through the new
interface directly. No adapter, no port.

### 2. Local-substitutable
A dependency with a local stand-in that runs inside the test suite — PGLite for Postgres, an in-memory
filesystem, a temp directory. Deepenable where the stand-in exists; the deepened module is tested with it
running. The seam is internal, so no port appears at the module's external interface.

### 3. Remote but owned
Your own services across a network — an internal API, another deployable, a queue. Define a **port** at
the seam: the deep module owns the logic and the transport arrives as an adapter, HTTP or gRPC or queue in
production, in-memory in tests. The logic then sits in one module even though it is deployed across a
network.

### 4. True external
A third party you do not control — a payment provider, an SMS gateway. The module takes it as an injected
port and tests supply a stub adapter. Record what the real one does on failure, on retry, and on a slow
response; a stub that only ever succeeds tests one path out of four.

## Seam discipline

- **One adapter is a hypothetical seam; two make it real.** Introduce a port only where two adapters are
  justified — typically production plus test. A single-adapter port is indirection, and it costs every
  reader of the module a hop.
- **Internal seams are not external ones.** A deep module can hold seams private to its implementation and
  used by its own tests. Never expose one through the interface because a test reached for it: that turns
  a private decision into something callers may depend on.

## Replace, do not layer

When a cluster of shallow modules becomes one deep module, its tests move with it.

- Write the new tests at the deepened module's interface first — the interface is the test surface.
- Assert on observable outcomes through the interface, never on internal state. A test that has to change
  whenever the implementation changes is testing past the interface, and it will block the next refactor.
- Delete the old shallow modules' unit tests once the interface-level tests exist. They now assert a shape
  that is gone, and keeping them buys coverage of nothing.
