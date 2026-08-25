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
  limit: integer, optional
  search: string, optional
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

Every list endpoint must support pagination. For JSON APIs, the response has a
stable shape:

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
GET /documents?page=1&limit=20&status=published&ownerId=42&search=contract
```

Rules:

- `page` and `limit` must be validated and have safe defaults;
- `limit` must have a server-side maximum;
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

## 6. Exceptions

Some resources may intentionally be read-only, non-deletable, or managed only
through a domain action. In that case:

1. document the reason next to the resource contract;
2. expose the operations that are valid for the resource;
3. do not replace a missing CRUD method with an untyped or ad-hoc endpoint.
