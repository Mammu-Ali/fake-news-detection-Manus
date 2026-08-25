# Article Analysis Feature Test Plan

## Scope

This plan covers the core article-analysis feature in the Fake News Detection WebApp: guest analysis, authenticated analysis with persistence, input validation, model response normalization, authentication and authorization, and API/database failure behavior.

## Test-layer mapping

| Scenario | Unit | Integration | End-to-end | Reason |
|---|---:|---:|---:|---|
| Valid model response is normalized into the public response shape | Yes | No | No | Pure transformation is fastest and most deterministic as a unit test. |
| Confidence is clamped and invalid array members are removed | Yes | No | No | This is a boundary-normalization rule with no external dependency. |
| Missing or malformed model JSON | Yes | Yes | Optional | Unit-test the parser; integration-test the API’s safe result or error contract. |
| Empty, whitespace-only, short, and oversized article text | Yes | Yes | Yes | Validate the schema quickly, then confirm the browser displays usable feedback. |
| Guest analysis succeeds without authentication | No | Yes | Yes | The public procedure and its non-persistence rule require a server boundary test; the UI flow deserves one browser test. |
| Authenticated analysis returns a result and writes the owner’s record | No | Yes | Yes | Persistence and user scoping require the API/database boundary; the main user journey belongs in E2E. |
| Guest result is not persisted | No | Yes | Yes | The privacy invariant requires a procedure-level assertion and a browser regression. |
| Unauthenticated access to protected analysis, history, and statistics | No | Yes | Yes | Authorization is enforced by the server and should also be checked through the real UI. |
| Normal user cannot access admin procedures | No | Yes | Yes | Server-side role enforcement is the source of truth; browser coverage protects navigation behavior. |
| Model provider timeout or rejection | Yes | Yes | No | Mock provider behavior in unit/integration tests; E2E should not depend on a live provider outage. |
| Prediction persistence failure | No | Yes | No | Simulate the database failure at the repository boundary and verify the API does not claim persistence. |
| History read/database failure | No | Yes | No | Verify the API returns a controlled error and the UI displays an error state. |
| OAuth callback and cookie transport | Yes | Yes | Yes | Test URL/cookie helpers as units, callback behavior as integration, and one real provider handoff as E2E. |
| Dataset extension, base64, and payload-size validation | Yes | Yes | Optional | Validate schemas in unit tests and storage/database interaction in integration tests. |
| Pagination, query limits, and aggregate statistics | Yes | Yes | Optional | Test query construction and repository behavior; a scale test is useful before release. |
| CSRF and rate limiting | No | Yes | Optional | These are server middleware contracts; browser tests can verify user-visible `403`/`429` behavior. |

## Implemented tests

The repository now contains `server/article-analysis.test.ts`, which covers the most important deterministic paths:

| Category | Implemented cases |
|---|---|
| Happy path | Authenticated analysis returns a complete result and persists the correct owner record; guest analysis returns a result without persistence. |
| Invalid input | Empty, whitespace-only, short, and oversized article text is rejected before model invocation. |
| Edge cases | Confidence bounds, malformed array members, and normalization of partial model data. |
| Errors | Model-provider rejection, persistence failure, and history/database failure are propagated rather than reported as success. |
| Authentication | Unauthenticated callers cannot invoke analysis, history, or statistics. |
| Privacy | Guest analysis does not call the persistence layer. |

The existing suite also covers OAuth callback recovery, local demo-login restrictions, admin authorization, dataset and metric validation, history filtering, date boundaries, and cookie policy. The combined suite currently reports **45 passing tests**.

## Recommended end-to-end suite

The highest-value Playwright scenarios should be implemented separately in `e2e/article-analysis.spec.ts`. The first scenario should open the public guest analyzer, submit a valid article, verify the verdict and disclaimer, and confirm that the result is labelled as not saved. The second should submit invalid text and verify the visible validation message. The third should authenticate, submit an article, open history, and confirm the new record appears only for that user. The fourth should verify that a normal user receives an access-denied state when attempting to open admin functionality.

These browser tests should use a deterministic test model or a test-only backend mode rather than a live external model provider. OAuth should be covered with a controlled callback fixture in CI and a separate manual staging smoke test against the real provider.

## Release gate

Before production release, the feature should have passing unit and integration coverage, at least the four browser journeys above, explicit CSRF and rate-limit tests after those protections are implemented, a database-unavailable readiness test, and a scale test for paginated history and aggregate statistics. A green unit suite alone is not sufficient evidence for authentication, privacy, or persistence behavior.
