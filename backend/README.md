# Backend API & CRUD Guide

These rules are language-, framework-, and database-agnostic. They describe the
default contract for backend entities and apply whether the service is written
in Python, Go, Java, C#, TypeScript, or another language. An explicit business
requirement may override a rule, but the exception must be documented.

## 1. Explicitly Typed Contracts

Every request, response, path parameter, query parameter, filter, and database
DTO must have an explicit schema or type. Use the type/schema system supported
by the chosen stack: OpenAPI, JSON Schema, protobuf, language DTOs, database
models, or an equivalent.

Do not use the following as an escape hatch:

- `additionalProperties: true` for normal entity objects;
- `Any`, `object`, `interface{}`, or another untyped object as an escape hatch;
- an untyped dictionary/map for a normal entity;
- arbitrary fields that are not part of the API contract.

`additionalProperties` is allowed only when the field is intentionally a map
and the requirement explicitly calls for dynamic keys. The map value must still
be typed, for example `map<string, string>` or `map<string, number>` according
to the conventions of the selected language.

Keep types explicit for list queries and filters as well:

```text
DocumentListQuery
  page: integer, optional
  per_page: integer, optional
  q: string, optional
  status: DocumentStatus, optional
  ownerId: identifier, optional
```

Do not replace a large but known contract with a generic object. Split the
contract into named DTOs when necessary: `Document`, `DocumentCreate`,
`DocumentUpdate`, and `DocumentListQuery`.

## 2. Default CRUD Surface

Unless the entity is explicitly read-only or a business rule forbids an
operation, implement the complete CRUD surface:

| Operation | Method | Endpoint |
| --------- | ------ | -------- |
| List      | `GET`  | `/documents` |
| Read      | `GET`  | `/documents/{id}` |
| Create    | `POST` | `/documents` |
| Update    | `PATCH` | `/documents/{id}` |
| Delete    | `DELETE` | `/documents/{id}` |

Use `PUT` instead of `PATCH` only when the endpoint replaces the complete
resource. Do not omit an operation just because it was not mentioned in a
short task description; omit it only when the domain explicitly requires it.

## 3. List Endpoints

Every list endpoint must support pagination. Use these standard query parameter
names everywhere:

- `page` — 1-based page number;
- `per_page` — number of items per page;
- `q` — free-text search query.

For JSON APIs, the response has a stable shape:

```json
{
  "items": [
    {
      "id": "..."
    }
  ],
  "total": 125
}
```

`total` is the total number of records matching the filters, not the number of
items in the current page. `items` must contain objects matching the typed
resource schema, not arbitrary objects.

Pagination, filters, sorting, and search belong in query parameters:

```text
GET /documents?page=1&per_page=20&status=published&ownerId=42&q=contract
```

Rules:

- `page` and `per_page` must be validated and have safe defaults;
- `per_page` must have a server-side maximum;
- every supported filter must be an explicit typed query field;
- filtering must happen in the database, not after loading all rows in memory;
- list queries should support search whenever the entity is user-facing.

## 4. Search

Prefer database full-text search (FTS), or the database's equivalent, for
substantial or frequently searched data. Use `ILIKE`/`LIKE` or an equivalent
case-insensitive comparison for smaller datasets or simple prefix/substring
search when an FTS index is not justified.

Search must be implemented against explicitly selected fields. Do not search
every column by default and do not fetch the whole table to filter it in the
application layer.

## 5. Individual CRUD Responses

- `GET /resources/{id}` returns one resource matching its schema or a
  documented `404` error response.
- `POST /resources` returns the created resource, including its generated `id`.
- `PATCH /resources/{id}` returns the updated resource.
- `DELETE /resources/{id}` returns the project-standard empty/success response
  (for example, HTTP `204`).

Create and update DTOs should be separate from the read DTO when their fields
differ. Never accept server-managed fields such as `id`, `createdAt`, or
`updatedAt` from an untrusted create/update payload unless explicitly required.

## 6. Input Validation

Validate every path parameter, query parameter, filter, and request body at the
API boundary before executing business logic. In FastAPI, use separate Pydantic
schemas for read, create, update, and query contracts.

Validation at the API boundary does not replace database constraints. Required
fields, unique values, foreign keys, and other invariants must also be enforced
by the database where applicable.

For `PATCH`, an omitted field keeps its current value; an explicit `null` is
allowed only when the field is nullable and means that the value is cleared.

## 7. Dates and IDs

- Return dates and timestamps in ISO 8601 format;
- store and return timestamps in UTC;
- use timezone-aware database fields and application values;
- choose one ID format for the service (for example, UUID) and do not mix
  formats between entities without a documented reason;
- treat IDs as opaque values in the API — clients must not depend on their
  internal generation strategy.

## 8. Soft Delete

Use soft delete only when required by audit, retention, or business rules. Do
not add it to every entity by default.

When soft delete is required:

- use a nullable `deleted_at` timestamp as the default marker;
- exclude deleted records from list endpoints by default;
- make deleted records behave as not found in regular read endpoints;
- document an explicit restore or include-deleted operation if it is needed;
- account for soft-deleted records in unique constraints and relations.

## 9. FastAPI Error Format

For FastAPI endpoints, follow the native `HTTPException` response shape: errors
are returned under the `detail` field.

All controlled application errors use an object inside `detail`:

```json
{
  "detail": {
    "code": "document_not_found",
    "message": "Document not found",
    "details": null
  }
}
```

Fields:

- `code` — stable machine-readable error code;
- `message` — human-readable message safe to show to the client;
- `details` — optional typed context, such as field-level validation errors.

For validation errors, `details` contains an array with the field location,
error type, and message:

```json
{
  "detail": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "loc": ["body", "name"],
        "type": "string_too_short",
        "message": "String should have at least 1 character"
      }
    ]
  }
}
```

Rules:

- use `HTTPException` for expected HTTP errors;
- pass the described error object as `HTTPException.detail`;
- normalize `RequestValidationError` to the same structure;
- do not use an ad-hoc top-level `error` object;
- never return stack traces, internal paths, SQL, or other sensitive details;
- unexpected exceptions must be logged on the server and exposed as a generic
  `500` response.

## 10. Exceptions

Some resources may intentionally be read-only, non-deletable, or managed only
through a domain action. In that case:

1. document the reason next to the resource contract;
2. expose the operations that are valid for the resource;
3. do not replace a missing CRUD method with an untyped or ad-hoc endpoint.
