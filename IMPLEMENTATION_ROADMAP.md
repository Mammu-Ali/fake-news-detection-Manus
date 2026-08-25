# Fake News Detection WebApp
## Implementation Roadmap and Project Structure

**Author:** Manus AI  
**Status:** Planning document; no application code is introduced by this roadmap.

## 1. Architectural direction

The recommended implementation is a separated web application with a React client, a Flask API, MongoDB Atlas, OAuth 2.0/OIDC authentication, a versioned REST API, and independent frontend/backend test suites. React is used for the component-based user interface, Flask provides a lightweight Python web layer suitable for ML integration, and MongoDB Atlas provides a managed document database for predictions, datasets, and evaluation records.[1] [2] [3]

The first release should remain a **modular monolith**: one Flask service containing authentication, prediction, history, and admin blueprints, with the model loaded once per worker. This is simpler to develop and deploy than multiple services. The design should keep model inference behind a service interface so it can later move to a worker or dedicated inference service without changing the public API.

> **Primary flow:** React UI → Flask REST API → authentication and authorization → prediction service → MongoDB Atlas.

The system should support two prediction modes. Authenticated analysis may be persisted to the signed-in user’s private history. Guest analysis should return an ephemeral result and must not create a user history record. Dataset administration and evaluation metrics must remain server-enforced administrator operations.

## 2. Step-by-step implementation roadmap

### Step 0 — Confirm scope, risks, and acceptance criteria

Before creating files, freeze the first-release requirements: article text submission, `.txt` upload, Fake/Real prediction, confidence, processing time, structured explanation, user history, dashboard statistics, admin dataset management, and model evaluation metrics. Define non-functional targets for input size, response timeout, accessibility, mobile layout, and error behavior.

Create a short threat model before implementation. Identify risks involving OAuth callback forgery, token exposure, cross-site requests, oversized uploads, prompt or input abuse, unauthorized history access, unsafe dataset files, and model-output parsing. Every later phase should map a test or control to each identified risk.

| Initial acceptance area | Definition of done |
|---|---|
| Guest analysis | A visitor can submit valid text and receive a result without an account; no private history record is created. |
| Authenticated analysis | A signed-in user receives a result and can view only their own stored records. |
| Authorization | A normal user cannot invoke admin dataset or metric operations, even by calling the API directly. |
| Authentication | OAuth callback state and nonce are validated; credentials are held in secure server-managed cookies. |
| Reliability | Invalid input and malformed model output produce stable structured errors or safe fallbacks. |
| Quality | Backend tests, frontend tests, browser tests, type checks, linting, and production builds pass in CI. |

### Step 1 — Create the repository and development environments

Create one repository with `frontend/`, `backend/`, and `docs/` boundaries. Add a root README, `.gitignore`, `.env.example` files, formatting rules, and CI configuration. Keep real secrets outside Git and use separate development, staging, and production values.

Pin the supported Node.js and Python versions. Use a Python virtual environment for Flask and ML dependencies, and use `pnpm` or `npm` consistently for the React client. The local development command should start the Flask API and Vite client predictably, with a documented proxy from the frontend to the API.

### Step 2 — Establish the Flask application foundation

Build the Flask application factory first. Configure JSON responses, CORS allowlists, request size limits, security headers, structured logging, health checks, and centralized exception handling. Register blueprints under `/api/v1` rather than placing all routes in a single module.

Create a configuration object with explicit development, testing, and production modes. Production configuration must fail fast when required secrets or database settings are missing. Testing configuration should use isolated database credentials or a disposable MongoDB environment and deterministic model-service mocks.

### Step 3 — Define schemas, repositories, and indexes

Define request and response schemas before writing route handlers. Use a validation library such as Pydantic or Marshmallow to enforce article length, upload type, confidence ranges, pagination, date filters, and metric values. Return consistent errors with a code, message, and optional field-level details.

Use repository classes for database access. Recommended collections are `users`, `predictions`, `datasets`, `model_metrics`, and optionally `audit_events`. Store timestamps in UTC, use stable IDs, and record only object-storage references for uploaded dataset files rather than embedding large file contents in MongoDB.

Create indexes for the most common access paths. A compound index on `user_id` and descending `created_at` supports private history. Additional indexes should cover verdict filtering, dataset status, and metric evaluation dates. Confirm each index with an explain plan before production.

### Step 4 — Implement authentication and authorization

Implement OAuth 2.0/OIDC with exact redirect URI matching, state and nonce validation, and secure server-side session cookies. Current OAuth security guidance recommends PKCE, exact redirect matching, and avoiding insecure implicit-style flows.[4] Use the provider’s documented authorization endpoint and keep the API host separate from the browser login portal.

Create authentication middleware that resolves the current user for every protected request. Add an `admin_required` decorator or equivalent policy layer, but never rely on frontend route hiding for security. Protect history queries by the authenticated user ID supplied by the server context, not by a user ID accepted from the browser.

If local demo login is retained for development, make it explicit, disabled in production, restricted to loopback hosts, and unable to create an administrator account. Add tests proving that hosted origins and production mode cannot activate it.

### Step 5 — Build the prediction service boundary

Create a `PredictionService` interface with a model-backed implementation and a deterministic test double. The service should accept normalized article text and return a stable internal result containing verdict, confidence, processing time, explanation dimensions, highlighted phrases, and signals.

Load the LSTM/Bi-LSTM model and embeddings once per worker rather than once per request. Validate the article before inference, enforce a timeout, and normalize malformed model responses. A failed model response should become a controlled API error or safe fallback, never an unhandled exception or an invented certainty.

Keep the disclaimer visible in the API response and the UI: a confidence score is a pattern match, not proof of truth. The system should encourage independent verification rather than presenting classification as fact.

### Step 6 — Implement versioned REST endpoints

Start with these endpoint groups:

| Group | Example endpoints | Access |
|---|---|---|
| Auth | `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, OAuth callback | Public/protected as appropriate |
| Prediction | `POST /api/v1/predictions/analyze` | Authenticated |
| Guest prediction | `POST /api/v1/guest/analyze` | Public, rate-limited, non-persistent |
| History | `GET /api/v1/history`, `DELETE /api/v1/history/{id}` | Owner only |
| Dashboard | `GET /api/v1/dashboard/stats` | Authenticated |
| Datasets | `GET`, `POST`, `PATCH`, `DELETE /api/v1/admin/datasets` | Admin only |
| Metrics | `GET`, `POST /api/v1/admin/metrics` | Admin only |
| Health | `GET /health`, `GET /ready` | Public or internal |

Document the contract in `docs/openapi.yaml`. Keep the guest endpoint separate from the persistent authenticated endpoint so the privacy boundary is obvious in both code review and tests. Add pagination limits, request timeouts, content-type checks, and rate limiting for anonymous requests.

### Step 7 — Build the React frontend shell

Create the Vite React application with TypeScript, routing, Tailwind CSS, an accessible layout system, and a single typed API client. Add an authentication provider that reads the current session from the API and exposes loading, authenticated, unauthenticated, and error states.

Build the public landing page and guest analyzer first. Then add the login page, authenticated dashboard, history view, and admin console. Keep shared components for article input, file upload, result cards, confidence indicators, empty states, error banners, loading states, and confirmation dialogs.

Use TanStack Query or an equivalent server-state library for caching, retries, query invalidation, and mutation states. Do not duplicate authorization decisions in the client; the frontend should reflect API responses and gracefully handle `401` and `403` statuses.

### Step 8 — Implement history and admin workflows

For authenticated users, implement server-side filtering, sorting, pagination, and deletion. The API must apply the current user scope before returning results. The UI should show an empty state, loading state, error state, and confirmation step for destructive deletion.

For administrators, implement dataset registration, metadata validation, archive status, deletion policy, and model metric entry. Uploaded files should be checked for extension, MIME type, size, and content format. Prefer object storage for file bytes and MongoDB for metadata. Record who performed administrative actions and when.

### Step 9 — Add security hardening

Enable HTTPS in hosted environments, secure and HttpOnly cookies, appropriate SameSite settings, CSRF protection for cookie-authenticated state changes, strict CORS, security headers, request limits, and rate limiting. Redact tokens, cookies, article contents, and personal information from logs.

Add validation at every boundary: browser, API schema, repository, and administrative file handling. Treat model output as untrusted data and parse it against a schema. Set timeouts for external providers and model inference. Configure MongoDB Atlas network access narrowly and use a least-privilege database user.

### Step 10 — Build the testing pyramid

Write backend unit tests for schemas, repositories, authorization, prediction normalization, and service fallbacks. Write API integration tests for authentication, guest privacy, history ownership, admin denial, dataset lifecycle, and metrics validation. Use deterministic mocks for the model and OAuth provider.

Write frontend component tests with Vitest and React Testing Library for form validation, loading/error states, result rendering, guest privacy messaging, and protected navigation. Add Playwright browser tests for the highest-value flows: guest analysis, local demo login, OAuth callback recovery, authenticated prediction, history deletion, and admin access denial. Playwright supports browser and API testing workflows for end-to-end coverage.[5]

Set CI gates so pull requests must pass formatting, linting, TypeScript checks, backend tests, frontend tests, browser tests, and a production build. Generate coverage reports, but prioritize meaningful authorization and failure-path assertions over a percentage target.

### Step 11 — Prepare deployment environments

Deploy the React frontend as a static build to Vercel or Netlify and the Flask API as a managed service on Render or Railway. Configure MongoDB Atlas separately. Use environment-specific secrets in the hosting platforms rather than committing configuration files.

Configure the frontend origin in Flask CORS, register the exact OAuth callback for each environment, set health checks, and enable centralized logs. Begin with one Flask service and scale horizontally. Move model inference to a worker or separate service only when latency or concurrency justifies the additional operational complexity.

### Step 12 — Perform release validation

Create a staging deployment and run migrations, smoke tests, browser tests, and a manual security checklist. Confirm that guest predictions do not appear in user history, normal users cannot access admin APIs, OAuth callback failures return to a readable login state, and production mode disables local demo login.

After release, monitor request latency, prediction failures, authentication failures, database errors, rate-limit events, and model confidence distributions. Maintain rollback instructions and Atlas backup verification. Do not treat a green build as proof that external OAuth or production secrets are correctly configured; test those environment-specific paths explicitly.

## 3. Recommended project file structure

```text
fake-news-detection/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml                 # Optional local MongoDB and services
├── Makefile                           # Optional cross-platform task aliases
├── pyproject.toml                     # Python formatting, linting, and test config
├── requirements.txt                   # Production Python dependencies
├── requirements-dev.txt               # pytest, coverage, linting, typing tools
├── package.json                       # Frontend scripts and workspace commands
├── pnpm-lock.yaml
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── public/
│   │   ├── favicon.svg
│   │   └── robots.txt
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── routes/
│       │   ├── PublicRoutes.tsx
│       │   ├── ProtectedRoutes.tsx
│       │   └── AdminRoutes.tsx
│       ├── pages/
│       │   ├── LandingPage.tsx
│       │   ├── GuestAnalyzerPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── HistoryPage.tsx
│       │   ├── AdminDatasetsPage.tsx
│       │   ├── AdminMetricsPage.tsx
│       │   └── NotFoundPage.tsx
│       ├── components/
│       │   ├── layout/
│       │   ├── article/
│       │   ├── prediction/
│       │   ├── history/
│       │   ├── admin/
│       │   └── ui/
│       ├── hooks/
│       │   ├── useCurrentUser.ts
│       │   ├── usePrediction.ts
│       │   ├── useHistory.ts
│       │   └── useAdmin.ts
│       ├── lib/
│       │   ├── apiClient.ts
│       │   ├── queryClient.ts
│       │   ├── auth.ts
│       │   ├── validation.ts
│       │   └── formatters.ts
│       ├── types/
│       │   ├── auth.ts
│       │   ├── prediction.ts
│       │   ├── history.ts
│       │   └── admin.ts
│       └── tests/
│           ├── components/
│           ├── pages/
│           └── fixtures/
│
├── backend/
│   ├── wsgi.py
│   ├── run.py
│   ├── app/
│   │   ├── __init__.py               # Flask application factory
│   │   ├── config.py
│   │   ├── extensions.py              # Mongo client, limiter, auth helpers
│   │   ├── errors.py                  # Shared API error handlers
│   │   ├── logging_config.py
│   │   ├── blueprints/
│   │   │   ├── auth.py
│   │   │   ├── predictions.py
│   │   │   ├── guest.py
│   │   │   ├── history.py
│   │   │   ├── dashboard.py
│   │   │   ├── admin_datasets.py
│   │   │   └── admin_metrics.py
│   │   ├── middleware/
│   │   │   ├── auth.py
│   │   │   ├── csrf.py
│   │   │   └── request_context.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── prediction.py
│   │   │   ├── history.py
│   │   │   └── admin.py
│   │   ├── repositories/
│   │   │   ├── users.py
│   │   │   ├── predictions.py
│   │   │   ├── datasets.py
│   │   │   └── metrics.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── prediction_service.py
│   │   │   ├── model_loader.py
│   │   │   ├── explanation_service.py
│   │   │   ├── dataset_service.py
│   │   │   └── metrics_service.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── prediction.py
│   │   │   ├── dataset.py
│   │   │   └── metric.py
│   │   └── db/
│   │       ├── client.py
│   │       ├── indexes.py
│   │       └── migrations/
│   ├── ml/
│   │   ├── README.md
│   │   ├── inference.py
│   │   ├── preprocessing.py
│   │   ├── postprocessing.py
│   │   └── artifacts/                  # Keep large artifacts outside Git when needed
│   └── tests/
│       ├── conftest.py
│       ├── unit/
│       ├── integration/
│       ├── fixtures/
│       └── mocks/
│
├── e2e/
│   ├── playwright.config.ts
│   ├── guest-analysis.spec.ts
│   ├── authentication.spec.ts
│   ├── history.spec.ts
│   └── admin-access.spec.ts
│
├── docs/
│   ├── architecture.md
│   ├── threat-model.md
│   ├── api-overview.md
│   ├── openapi.yaml
│   ├── database-schema.md
│   ├── local-development.md
│   ├── deployment.md
│   └── runbooks/
│       ├── oauth-callback-failure.md
│       ├── model-timeout.md
│       └── rollback.md
│
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

## 4. Environment variable boundaries

Keep variables grouped by responsibility. The frontend may receive only public configuration such as the API base URL and OAuth client identifier. Database credentials, signing secrets, provider client secrets, model paths, object-storage credentials, and administrative configuration belong exclusively to the Flask service.

| Variable category | Frontend | Backend | Notes |
|---|---:|---:|---|
| API base URL | Yes | No | Public, environment-specific URL. |
| OAuth client ID | Usually public | Yes | Must match the registered application. |
| OAuth client secret | No | Yes | Never expose to the browser. |
| OAuth portal URL | Yes | Optional | Use the interactive provider portal, not the API host. |
| MongoDB URI | No | Yes | Store in the hosting secret manager. |
| Session/JWT signing secret | No | Yes | Rotate through a documented procedure. |
| Model and embedding paths | No | Yes | Prefer immutable versioned artifacts. |
| Storage credentials | No | Yes | Use least-privilege access. |
| Rate-limit configuration | Optional | Yes | Backend remains authoritative. |

## 5. Milestones and delivery sequence

| Milestone | Scope | Main outputs | Exit gate |
|---|---|---|---|
| M1 — Foundation | Repository, environments, Flask factory, React shell, CI | Running client and API, health endpoint | Clean install and CI build pass |
| M2 — Data and prediction | Mongo repositories, schemas, model service, guest endpoint | Stable prediction contract | Unit and API tests pass |
| M3 — Identity | OAuth, sessions, protected routes, roles | Secure user and admin boundaries | Callback, CSRF, and authorization tests pass |
| M4 — Product workflows | Dashboard, history, guest UI, admin UI | Complete user-facing MVP | Browser flows pass on desktop and mobile |
| M5 — Hardening | Rate limiting, file validation, logging, error handling | Security and reliability controls | Threat-model checklist complete |
| M6 — Release | Staging, deployment, monitoring, backups, runbooks | Production-ready release | Staging smoke test and rollback rehearsal pass |

## 6. Definition of ready for implementation

Coding should begin only after the team has approved the endpoint names, authentication provider, OAuth callback URLs for local/staging/production, MongoDB collections and indexes, model input/output schema, guest persistence rule, admin role policy, and initial test cases. This prevents the frontend and backend from independently inventing incompatible contracts.

The first implementation sprint should produce only the foundation and contract artifacts. The prediction model and UI should then be developed against mocked responses before external inference is enabled. This keeps the interface testable, limits external-service costs during development, and makes failures reproducible.

## References

[1]: https://react.dev/ "React official documentation"

[2]: https://flask.palletsprojects.com/ "Flask official documentation"

[3]: https://www.mongodb.com/docs/ "MongoDB official documentation"

[4]: https://datatracker.ietf.org/doc/rfc9700/ "RFC 9700: Best Current Practice for OAuth 2.0 Security"

[5]: https://playwright.dev/docs/api-testing "Playwright API and end-to-end testing documentation"

[6]: https://vite.dev/ "Vite official documentation"

