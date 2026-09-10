# Surface conventions — the concrete shapes

The forms the `SKILL.md` method names but does not draw. Read the section for the surface in front of
you; the rest is for a different kind of surface and costs you nothing to skip.

## The error body, and the status map

One shape, at every point on the surface. `code` is what a consumer branches on, `message` is what a
person reads, `details` is everything else.

```ts
interface ApiError {
  error: {
    code: string;        // machine-readable: "VALIDATION_ERROR"
    message: string;     // human-readable: "Email is required"
    details?: unknown;   // context, when there is any
  };
}
```

| Status | Means |
|---|---|
| 400 | the request itself is malformed |
| 401 | not authenticated |
| 403 | authenticated, not authorised |
| 404 | no such resource |
| 409 | conflict — a duplicate, or a version that moved |
| 422 | well-formed and semantically invalid |
| 500 | server fault; never carries an internal detail outward |

A stack trace, a SQL fragment or an internal path in `message` or `details` is a surface nobody meant to
publish, and Hyrum's Law applies to it the same as to anything else.

## Naming

| Pattern | Convention | Example |
|---|---|---|
| REST paths | plural nouns, no verbs | `GET /api/notes`, `POST /api/notes` |
| Query parameters | camelCase | `?sortBy=updatedAt&pageSize=20` |
| Response fields | camelCase | `{ createdAt, updatedAt, noteId }` |
| Booleans | `is` / `has` / `can` prefix | `isDraft`, `hasUnsyncedEdits` |
| Enum values | UPPER_SNAKE | `"IN_PROGRESS"`, `"COMPLETED"` |

A term defined in `CONTEXT.md` outranks this table: the glossary word, spelled the glossary's way, in
whichever casing the column above asks for.

## REST resources

```
GET    /api/notes              list, filtered by query parameters
POST   /api/notes              create
GET    /api/notes/:id          read one
PATCH  /api/notes/:id          partial update — only the fields present change
DELETE /api/notes/:id          idempotent; succeeds on an already-deleted id

GET    /api/notes/:id/drafts   a sub-resource of one note
```

Filters are query parameters, not paths: `?status=unsynced&updatedAfter=2026-01-01`. PATCH takes a
partial object because a client that has to send the whole note back to change its title will read the
note first, and two clients doing that concurrently lose one of the two edits.

## Pagination

Every list, from the first version.

```jsonc
// GET /api/notes?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc
{
  "data": [],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 142, "totalPages": 8 }
}
```

Cursor pagination (`?cursor=&limit=`) instead, where the set changes under the reader — an offset page
skips a row when something ahead of it is inserted. Either is a decision worth recording; having neither
is not.

## Typed interfaces

**Input and output are different types.** Server-generated fields exist only in the output, so no caller
can send an `id` or a `createdAt` and no reader has to wonder whether one was honoured.

```ts
interface CreateNoteInput { title: string; body?: string }
interface Note { id: NoteId; title: string; body: string | null; createdAt: Date; createdBy: UserId }
```

**Variants are discriminated unions**, so the consumer narrows instead of guessing which fields are
populated together:

```ts
type SyncState =
  | { type: 'synced'; syncedAt: Date }
  | { type: 'pending'; queuedAt: Date }
  | { type: 'failed'; reason: string; attempts: number };
```

**Ids are branded**, so one id cannot be passed where another is expected:

```ts
type NoteId = string & { readonly __brand: 'NoteId' };
type UserId = string & { readonly __brand: 'UserId' };
```

**Extension is additive.** A new field arrives optional; an existing field's type does not change and a
field is not removed. Where one must go, it is a deprecation with a migration path, not an edit
(`deprecation-and-migration`).

## Where validation belongs

| Belongs | Does not |
|---|---|
| route and handler entry points | between internal functions sharing a type |
| form submissions | inside a utility the validated path already called |
| every third-party or webhook response | on rows your own database wrote under this schema |
| environment and configuration loading | |

A third-party response is untrusted data whatever the vendor's documentation promises: parse its shape
before anything branches on it, renders it, or passes it to a model, since a compromised or merely
misbehaving service can return the wrong type, hostile content, or text shaped like an instruction.
