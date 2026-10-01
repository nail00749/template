# Keycloak authentication

The generated frontend treats Keycloak as a backend concern. The browser starts login with
`GET /api/v1/auth/login`; the backend owns Authorization Code + PKCE, cryptographically random
session-bound `state`, callback validation, token storage, refresh, and the HttpOnly application
session. When the backend validates an ID token, it must also issue and validate `nonce`.
Keycloak tokens must never be exposed to browser JavaScript.

## Required backend contract

- `GET /api/v1/auth/login` starts the OIDC redirect.
- `GET /api/v1/auth/callback` completes it and redirects to the frontend application.
- `GET /api/v1/auth/me` returns `{ user: null }` or the current user projection.
- `POST /api/v1/auth/logout` invalidates the local session.

The existing generated client and `entities/session` query implement the `me` and logout
calls. Configure `VITE_API_BASE_URL`, `SERVER_API_BASE_URL`, and `VITE_AUTH_HEADER` as described
by the environment schema. The backend must authenticate and authorize every protected
operation; frontend route guards only improve navigation UX.

The callback must reject missing, expired, reused, or mismatched `state`, and mismatched `nonce`
when an ID token is used. Backend integration tests must cover those failures; frontend tests
cannot establish this server-side security boundary.

## Return-to flow

An anonymous protected-route visit is normalized and sent to `/login?redirect=...`. The login
button stores that internal route in a short-lived, host-only continuation cookie before the
full-page OIDC navigation. HTTPS uses a `__Host-` cookie; local HTTP development uses an
unprefixed cookie with the same scope.

After `/me` confirms the new session, the first protected route consumes the cookie and returns
the user to the saved path. Absolute URLs, protocol-relative URLs, `/login`, `/api/**`, path
traversal, and oversized targets are rejected to prevent open redirects and loops.

Configure the backend's post-login landing URI as frontend `/login`. Landing on `/` is also
compatible with the current template because `/` immediately redirects into the protected
`/templates` route, whose guard consumes the continuation. Do not land on an unrelated public
route, or the saved return-to target will remain pending until a consuming guard runs.

## Production requirements

- Serve the frontend and auth endpoints over HTTPS.
- Use an HttpOnly, Secure, SameSite cookie for the application session.
- Allowlist the exact frontend callback/landing URI in both Keycloak and the auth service.
- Preserve cookies and the query string through the reverse proxy.
- Add a backend SSO-logout endpoint before claiming that local logout also terminates the
  Keycloak browser session.
