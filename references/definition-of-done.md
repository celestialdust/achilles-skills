# Definition of done

The standing bar every change clears. Give every task a verifiable goal with a named check and loop until
that check passes; this list is the floor under it. Acceptance criteria answer "did we build the right
thing?"; this answers "is it finished to our standard?". A slice is done only when both hold.

## Correctness

- Every acceptance criterion for the slice is met
- The code was run and behaved as intended — compiled and typechecked is not verified
- New behaviour is covered by a test that fails without the change and passes with it
- Existing tests still pass; no regression introduced
- Edge cases and error paths handled, not just the happy path

## Quality

- Naming and structure reveal intent; no comment explains *what* the code does
- No duplicated business logic, dead code, debug output, or commented-out blocks
- Scoped to the slice — no unrelated refactor rides along
- Lint and formatting pass

Depth: `code-review` and `code-simplification`.

## Integration

- Works with the rest of the system, not only in isolation
- Migrations, config changes and feature flags accounted for
- Backward compatibility considered for any public interface

## Documentation

- Public interfaces, APIs and user-facing behaviour documented
- A decision worth preserving recorded as an ADR (`documentation-and-adrs`)
- Written as current state in timeless language, not as change history

## Ship-readiness

- Security reviewed wherever the change touches untrusted input, auth or data
- Observability in place on new critical paths
- Anything risky reflected in the draft pull request's risk band
- A person has reviewed and merged

The rollback plan is deliberately absent: `shipping-and-launch` writes it and starts after a person
merges. One slice's pull request is not a release; the risk band is the control before the merge.

## Applying it

Confirm correctness and quality before calling a slice done, integration and documentation before a
feature is, the whole list before a release. Tailor it once, then reuse it unchanged: a bar renegotiated
each sprint is not a bar, and it does not move under deadline pressure.
