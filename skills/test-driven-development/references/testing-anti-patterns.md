# Testing anti-patterns

Load this while adding a mock, a fixture, or a test utility. Each pattern below is a way a green run
stops being evidence: the test still passes, and it has stopped watching the thing it names.

## 1 · Asserting on the mock

```js
// the mock is what passes
expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
// the component is what passes
expect(screen.getByRole('navigation')).toBeInTheDocument();
```

Assert on behaviour the real component produces. Before asserting against anything mocked, ask what
the assertion would still catch if the production code were deleted — if the answer is "the mock is
installed", delete the assertion or unmock the collaborator. Counting calls (`toHaveBeenCalledTimes`)
is the same trap in another shape: it pins today's call sequence, so a correct refactor turns it red
and a broken result leaves it green. Assert on the returned value, the stored row, the rendered text.

## 2 · Test-only methods on production classes

A `destroy()` that only `afterEach` ever calls reads like production API, ships like production API,
and is one autocomplete away from being called in production. Put test cleanup in test utilities and
let it reach through the interfaces the product already has. Ask of any new method whether a caller
outside `tests/` exists — and whether this class owns that resource's lifecycle at all.

## 3 · Mocking without knowing what you replaced

```js
// the mocked call also wrote the config the assertion depends on
vi.mock('ToolCatalog', () => ({ discoverAndCacheTools: vi.fn().mockResolvedValue(undefined) }));
await addServer(config);
await addServer(config);   // should throw on the duplicate — now it cannot
```

Before mocking anything, name the real method's side effects and say which of them the test depends
on. Mock at the lowest level that removes the cost — the slow socket, the network client — never the
high-level call whose effects the assertion needs. When you cannot say what the test depends on, run
it against the real implementation first, watch what it actually touches, then add the smallest mock
that removes the cost. "I'll mock it to be safe" is how a test starts passing for the wrong reason.

## 4 · Partial mocks

A fixture holding only the fields this test reads encodes a structure the real payload does not have.
The code under test grows a read of `response.metadata.requestId`, the mock has no `metadata`, and
the failure surfaces in integration or production rather than here. Mirror the complete structure as
it exists in reality — from the real response, the schema, or the API docs — not the subset this
assertion happens to touch. Where the shape is generated or typed, build the fixture from that type.

## 5 · Tests as a follow-up

"Implementation complete, tests to follow" describes work that is not complete. Testing is part of
implementing a behaviour, and a test written after the code is a test shaped by the code. If a
behaviour is worth an increment, its test comes first.

## When the mocks have outgrown the test

Setup longer than the assertions, a mock missing methods the real collaborator has, a test that
breaks whenever the mock changes and never when the product does — each says the seam is in the wrong
place. Reach for an integration test with the real collaborators, or a hand-written fake that honours
the same contract, and delete the mock tower. A fake you can explain beats a mock you cannot.

## What it costs to get this wrong

| Symptom | What it actually means |
|---|---|
| Assertions naming `*-mock` ids | the mock is under test, the component is not |
| Methods called only from `tests/` | production API grown for test convenience |
| Mock setup over half the test | the seam is wrong, or the test wants integration |
| Removing a mock makes the test fail | the mock is the subject |
| Fixture smaller than the real payload | a silent break waiting on a downstream field |
