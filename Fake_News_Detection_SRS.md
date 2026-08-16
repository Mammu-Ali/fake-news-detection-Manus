# Software Requirements Specification
## Fake News Detection Using Deep Learning

**Document version:** 1.0  
**Status:** Final SRS baseline for MVP and Admin Extension  
**Prepared for:** Fake News Detection WebApp  
**Prepared by:** Manus AI  
**Date:** 16 August 2026  

---

## 1. Document Purpose and Control

### 1.1 Purpose

This Software Requirements Specification defines the approved requirements for the Fake News Detection Using Deep Learning WebApp. It describes the product vision, users, scope, functional behavior, interface expectations, data model, AI contract, security controls, non-functional targets, architecture, testing strategy, deployment assumptions, and future enhancement boundaries.

This document is the formal baseline for implementation and acceptance of the current MVP and administrator extension. It reconciles the supplied Product Requirements Document, the supplied comparative fake-news research report, and the functionality implemented in the project repository.

### 1.2 Intended Audience

The document is intended for the product owner, academic supervisor, developers, machine-learning engineers, UI designers, administrators, testers, and future maintainers.

### 1.3 Document Control

| Version | Date | Status | Description |
|---|---|---|---|
| 1.0 | 16 August 2026 | Final baseline | Complete SRS for MVP and admin dashboard extension |

The product owner or academic supervisor may add institution, course, enrollment, approval, signature, and final-submission information before formal academic submission.

### 1.4 Source Artifacts

This SRS is grounded in the following project artifacts:

| Artifact | Use in this SRS |
|---|---|
| Fake News Detection Product Requirements Document | Product vision, personas, user stories, feature scope, success targets, and preferred technology direction. |
| Fake News Detection: A Comparative Review and Analysis of Twenty Research Papers | Research context, model categories, datasets, limitations, metrics, explainability, and future research direction. |
| `IMPLEMENTATION_NOTES.md` | Explanation of the managed-runtime adaptation from the preferred academic stack to the available WebApp environment. |
| Current source code, schema, tests, and TODO | Implemented routes, procedures, entities, visual behavior, and verification evidence. |

### 1.5 Definitions

| Term | Definition |
|---|---|
| Fake | A model classification that the submitted text exhibits patterns associated with misinformation or unreliable content. |
| Real | A model classification that the submitted text exhibits patterns associated with credible or authentic content. |
| Confidence | A model certainty score expressed as a percentage; it is not the probability that the article is factually true. |
| Prediction | One completed article-analysis event belonging to an authenticated user. |
| Dataset | A labeled corpus registered and managed by an administrator. |
| Model metric | An evaluation measure such as accuracy, precision, recall, F1 score, or a confusion-matrix count. |
| Visitor | An unauthenticated person using the public entry experience. |
| User | An authenticated non-administrator. |
| Administrator | An authenticated account with server-enforced admin privileges. |
| SRS | Software Requirements Specification. |

---

## 2. Product Description

### 2.1 Vision

The WebApp shall provide an accessible and technically immersive awareness tool that helps students, researchers, journalists, bloggers, teachers, and general readers examine suspicious news content. It shall provide fast pattern-based analysis while clearly explaining that it does not independently verify facts.

### 2.2 Product Perspective

The system consists of a public entry screen, an OAuth-authenticated application shell, a user dashboard, a prediction history area, and an administrator console. The browser communicates with typed server procedures. The server validates input, checks user ownership or administrator role, invokes the configured server-side AI integration, persists records, and returns structured results.

The preferred academic PRD stack identifies React with Tailwind CSS, Flask/Python, LSTM or Bi-LSTM with GloVe or Word2Vec, MongoDB, JWT, and Flask model serving. The managed project environment instead supplies React, Tailwind CSS, a Node-based typed server, OAuth sessions, a managed relational database, managed object storage, and a protected server-side LLM integration. The user-facing product behavior remains the governing requirement; this infrastructure adaptation is documented explicitly rather than being represented as an implementation that does not exist.

### 2.3 User Classes

| User | Needs | Permissions |
|---|---|---|
| Visitor | Understand the product and authenticate. | View public entry page and initiate login. |
| Authenticated user | Analyze articles and review personal activity. | Submit text, view results, dashboard, history, filters, sorting, and owned-record deletion. |
| Administrator | Operate datasets and review model quality. | All user functions plus dataset registration, storage metadata, archive/delete, metric entry, confusion matrix, and evaluation history. |

### 2.4 Operating Environment

The application shall operate in modern desktop, tablet, and mobile browsers with JavaScript enabled and an internet connection. The managed runtime uses a single web-server process, typed server procedures, managed relational persistence, managed storage, and OAuth session state. The MVP shall not require a local worker, persistent background daemon, or client-side AI credential.

### 2.5 Design Direction

The visual system shall use a deep black background, bold white sans-serif type, monospaced secondary labels, cyan and red chromatic aberration, lime-green status accents, CRT scan lines, terminal-inspired brackets, subtle horizontal displacement, and restrained glitch effects. Fake results shall be red across result, history, and dashboard areas. Real results shall be green across the same areas. Accessibility, contrast, visible focus, and responsive layout shall override decorative effects when the two conflict.

---

## 3. Scope

### 3.1 MVP Scope

The MVP includes OAuth login and logout, protected dashboard routes, article text entry, plain-text article upload, AI Fake/Real analysis, confidence percentage, processing time, structured explanation, influential phrase highlighting, pattern-based disclaimer, dashboard statistics, recent activity, searchable and filterable prediction history, sorting, individual deletion, responsive sidebar navigation, and the cyberpunk interface.

### 3.2 Admin Extension Scope

The admin extension includes an admin-only route, dataset registration, plain-text dataset upload, managed storage references, dataset record and label counts, dataset version and description, dataset listing, archive, database deletion, model evaluation entry, accuracy/precision/recall/F1 cards, confusion matrix, dataset summary cards, and evaluation history.

### 3.3 Out of Scope

Automatic fact verification against authoritative sources, legal or editorial certification, social-media crawling, URL extraction, image/video analysis, multilingual detection, automatic retraining, automatic labeling, public sharing of private history, and production experiment orchestration are outside this baseline.

### 3.4 Assumptions and Constraints

The MVP assumes English-language text, labeled data for future training or evaluation, internet connectivity, and a model or AI service that can respond within the target latency. Model output depends on training data quality, class balance, domain coverage, label quality, and evaluation protocol. The system shall not claim that a verdict is a verified fact or that confidence is a guarantee.

---

## 4. Functional Requirements

### 4.1 Authentication and Authorization

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| AUTH-001 | The system shall provide managed OAuth login. | Must | A visitor can start the login flow and return with a valid session. |
| AUTH-002 | The system shall provide logout. | Must | Logout clears the session and returns the user to public access. |
| AUTH-003 | Dashboard and history data shall require authentication. | Must | Unauthenticated procedure calls are rejected. |
| AUTH-004 | Administrator procedures shall require the admin role. | Must | A normal user receives a forbidden response. |
| AUTH-005 | Authorization shall be enforced server-side. | Must | Hiding a UI link cannot grant access to an unauthorized caller. |
| AUTH-006 | Users shall access only their own prediction records. | Must | Database predicates include the authenticated user identifier. |

### 4.2 Article Input and File Validation

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| INPUT-001 | The application shall provide a text area for article input. | Must | Users can paste or type text before analysis. |
| INPUT-002 | The application shall accept plain-text `.txt` files. | Must | A valid file populates the input or dataset workflow. |
| INPUT-003 | Non-plain-text files shall be rejected. | Must | The user receives a clear error and no analysis is started. |
| INPUT-004 | Article input shall have a minimum length. | Must | Text shorter than the configured minimum is rejected before AI invocation. |
| INPUT-005 | Article input shall have a maximum length. | Must | Oversized text is rejected or safely bounded. |
| INPUT-006 | Dataset files shall be stored through managed object storage. | Must | The database retains storage key and URL metadata. |

### 4.3 Prediction and AI Result

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| PRED-001 | The server shall analyze submitted text using a protected AI workflow. | Must | The browser never receives the server credential. |
| PRED-002 | The completed verdict shall be Fake or Real. | Must | No third completed label is displayed. |
| PRED-003 | The result shall include confidence from 1 to 99 percent. | Must | Confidence is visible beside the verdict. |
| PRED-004 | The result shall include server-measured processing time in milliseconds. | Must | Processing time appears in the result panel. |
| PRED-005 | The completed result shall be persisted under the authenticated user. | Must | The result appears in the user’s history. |
| PRED-006 | Incomplete AI output shall produce a safe fallback or controlled error. | Should | The interface does not fail silently. |

### 4.4 Explanation and Interpretability

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| EXP-001 | The system shall return a natural-language explanation. | Must | The explanation appears after a completed analysis. |
| EXP-002 | The explanation shall address linguistic patterns. | Must | A dedicated linguistic-pattern field is shown. |
| EXP-003 | The explanation shall address emotional tone. | Must | A dedicated emotional-tone field is shown. |
| EXP-004 | The explanation shall address credibility signals. | Must | A dedicated credibility-signals field is shown. |
| EXP-005 | Influential signals and phrases shall be returned. | Must | Signal chips and phrase data are rendered. |
| EXP-006 | Influential phrases shall be highlighted in the submitted text. | Must | Matching phrases receive a visible highlight. |
| EXP-007 | The result shall display: “Results are pattern-based and not verified facts.” | Must | The exact disclaimer is visible with every result. |

### 4.5 User Dashboard and History

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| USER-001 | The dashboard shall display total predictions. | Must | The total count is visible. |
| USER-002 | The dashboard shall display Fake and Real percentages. | Must | Percentages are calculated from the user’s records. |
| USER-003 | The dashboard shall display recent activity. | Must | Recent records show verdict, preview, date, and confidence. |
| USER-004 | Fake shall be red and Real shall be green. | Must | Color semantics are consistent across dashboard and history. |
| HIST-001 | History shall support text and verdict search. | Must | Search narrows the returned list. |
| HIST-002 | History shall support Fake, Real, and all-verdict filters. | Must | The verdict filter changes the result set. |
| HIST-003 | History shall support minimum and maximum confidence. | Must | Records outside the range are excluded. |
| HIST-004 | History shall support from and to dates. | Must | Records outside the date range are excluded. |
| HIST-005 | History shall support newest, oldest, and confidence sorting. | Must | The order changes as selected. |
| HIST-006 | Users shall delete individual owned predictions. | Must | Only the authenticated owner can delete a record. |

### 4.6 Dataset Administration

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| DATA-001 | Administrators shall register dataset metadata. | Must | Name, description, file name, version, and counts are stored. |
| DATA-002 | The system shall count or accept total, Fake, and Real records. | Must | Counts appear in dataset and summary views. |
| DATA-003 | The system shall persist storage key and URL metadata. | Must | The uploaded file is referenced by the dataset record. |
| DATA-004 | Administrators shall list datasets and statuses. | Must | Rows show metadata and ready/processing/archived status. |
| DATA-005 | Administrators shall archive datasets. | Must | The status becomes archived. |
| DATA-006 | Administrators shall delete dataset records. | Must | The record is removed after a valid admin request. |
| DATA-007 | Dataset operations shall be admin-authorized. | Must | Normal users cannot call them successfully. |

### 4.7 Model Evaluation Administration

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| MET-001 | Administrators shall record model and dataset names. | Must | Both fields are persisted. |
| MET-002 | The system shall store accuracy, precision, recall, and F1. | Must | Each metric accepts a value from 0 to 100. |
| MET-003 | The system shall store TP, TN, FP, and FN counts. | Must | All four values are persisted. |
| MET-004 | The console shall display latest metric cards. | Must | Accuracy, precision, recall, and F1 are visible. |
| MET-005 | The console shall display a confusion matrix. | Must | Actual and predicted classes are labeled. |
| MET-006 | The console shall display dataset summary cards. | Must | Total records, Fake labels, Real labels, and active corpora are visible. |
| MET-007 | The console shall display evaluation history. | Must | Model, dataset, date, accuracy, and F1 are listed. |

### 4.8 Interface and Visual Requirements

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| UI-001 | The application shall provide responsive sidebar navigation. | Must | Desktop, tablet, and mobile layouts remain usable. |
| UI-002 | The interface shall use the approved high-contrast glitch-art aesthetic. | Must | Black background, white type, chromatic shifts, scan lines, and terminal labels are present. |
| UI-003 | Controls shall provide readable labels, focus states, and errors. | Must | Keyboard and visual review identify no blocking accessibility issue. |
| UI-004 | Loading and empty states shall be visible. | Must | Analysis, history, datasets, and metrics provide feedback when empty or loading. |

---

## 5. Data Requirements

### 5.1 User Table

| Field | Type | Required | Description |
|---|---|---|---|
| id | Integer | Yes | Primary identifier. |
| openId | String | Yes | Managed OAuth identifier. |
| name | String | No | Display name. |
| email | String | No | Account email. |
| role | Enum | Yes | `user` or `admin`. |
| createdAt, updatedAt, lastSignedIn | Timestamp | Yes | Account lifecycle timestamps. |

### 5.2 Prediction Table

| Field | Type | Required | Description |
|---|---|---|---|
| id, userId | Integer | Yes | Prediction and owner identifiers. |
| articleText | Text | Yes | Submitted article. |
| verdict | Enum | Yes | Fake or Real. |
| confidence | Integer | Yes | 1–99 percentage. |
| processingTimeMs | Integer | Yes | Server processing duration. |
| explanation | Text | Yes | General explanation. |
| linguisticPatterns | Text | Yes | Linguistic analysis. |
| emotionalTone | Text | Yes | Emotional analysis. |
| credibilitySignals | Text | Yes | Credibility analysis. |
| highlightedPhrases | Text | Yes | Serialized phrase list. |
| signals | Text | Yes | Serialized signal list. |
| createdAt | Timestamp | Yes | Creation timestamp. |

### 5.3 Dataset Table

The dataset entity shall contain identifier, name, description, file name, managed storage key, managed storage URL, total record count, Fake count, Real count, status, version, uploading administrator, and creation timestamp. Status shall be `ready`, `processing`, or `archived`.

### 5.4 Model Metrics Table

The model metric entity shall contain identifier, model name, dataset name, accuracy, precision, recall, F1 score, true-positive count, true-negative count, false-positive count, false-negative count, and evaluation timestamp.

### 5.5 Validation Rules

All procedures shall validate required fields, string lengths, numeric ranges, enum values, identifiers, article length, and file type. Invalid requests shall be rejected before AI invocation or database mutation. Timestamps shall be stored in UTC-compatible form and localized only for display.

---

## 6. System and Interface Architecture

### 6.1 Logical Flow

1. A visitor opens the public entry page.
2. The visitor starts the managed OAuth flow.
3. The authenticated browser loads dashboard data through typed server procedures.
4. The user enters article text or selects a plain-text file.
5. The server validates the text and invokes the protected AI integration.
6. The server validates the structured response, measures processing time, stores the prediction, and returns the result.
7. The client renders verdict, confidence, time, explanation dimensions, signals, phrases, and disclaimer.
8. User statistics and history query only the authenticated user’s records.
9. Administrators use separate server-authorized procedures for datasets and evaluation metrics.
10. Dataset bytes are sent to managed storage and metadata is stored in the database.

### 6.2 Technology Baseline

| Layer | Managed implementation | PRD relationship |
|---|---|---|
| Frontend | React with Tailwind CSS and provided UI components | Directly aligned with PRD. |
| Backend | Typed Node server procedures | Runtime adaptation of preferred Flask/Python endpoint. |
| AI | Protected server-side AI integration with structured JSON response | Preserves AI classification and explanation contract. |
| Database | Managed relational database through Drizzle | Runtime adaptation of preferred MongoDB. |
| Authentication | Managed OAuth session | Runtime adaptation of preferred JWT flow. |
| Storage | Managed object storage with database metadata | Required for persistent dataset files. |
| Hosting | Managed WebApp hosting | Runtime adaptation of separate frontend/backend hosting. |

### 6.3 Internal Procedures

The system shall provide protected procedures for prediction analysis, statistics, history listing, history deletion, admin dataset listing/creation/archive/deletion, and admin metric listing/creation. Every protected procedure shall perform authorization before data access or mutation.

### 6.4 AI Interface Contract

The server shall send article text and a cautious system instruction to the AI service. The structured response shall include `verdict`, `confidence`, `explanation`, `linguisticPatterns`, `emotionalTone`, `credibilitySignals`, `highlightedPhrases`, and `signals`. The instruction shall prohibit claims of independent factual verification. The client shall not receive AI or storage credentials.

---

## 7. Non-Functional Requirements

| ID | Category | Requirement | Target or rule |
|---|---|---|---|
| NFR-001 | Performance | Normal article prediction should complete quickly. | Product target below 3 seconds when service latency permits. |
| NFR-002 | Security | Protected actions must be server-authorized. | No UI-only authorization. |
| NFR-003 | Privacy | Prediction history is private by user. | Owner predicate on reads and deletes. |
| NFR-004 | Reliability | AI and database errors must be controlled. | Loading, error, fallback, and empty states. |
| NFR-005 | Accessibility | Text and controls must remain usable. | Keyboard focus, readable contrast, responsive layout. |
| NFR-006 | Maintainability | Code, schema, tests, TODO, and SRS remain aligned. | Update documentation when behavior changes. |
| NFR-007 | Compatibility | The application shall support modern desktop and mobile browsers. | Desktop, tablet, and mobile verification. |
| NFR-008 | Storage | Files shall not be stored as database blobs. | Store bytes in managed storage and references in DB. |
| NFR-009 | Scalability | Queries should support future growth. | Add indexes/pagination before high-volume production use. |
| NFR-010 | Observability | Users and operators need operational context. | Processing duration, statuses, and metric history are visible. |

---

## 8. Security, Privacy, and Responsible Use

The system shall use the managed OAuth session flow and shall not store custom passwords in the application. Server procedures shall enforce authentication, user ownership, and admin roles. Credentials for AI, storage, database, and authentication services shall remain in environment configuration and shall never be committed to client code or public files.

Input shall be validated at both client and server boundaries. Uploaded files shall be restricted to plain text and stored through managed storage. The database shall retain metadata and references rather than file bytes. Error messages shall not expose secrets, stack traces, or unrelated users’ records.

The product shall display the limitation that results are pattern-based and not verified facts. It shall not present the output as legal, medical, financial, electoral, editorial, or scientific certification. Users should independently verify consequential claims.

---

## 9. AI, Dataset, and Evaluation Requirements

### 9.1 Model Limitations

The system may perform poorly on satire, emerging events, domain shifts, adversarial wording, incomplete context, manipulated quotations, multilingual content, and claims requiring external evidence. Confidence may be miscalibrated. Dataset accuracy shall not be treated as universal real-world truth.

### 9.2 Dataset Registration Convention

Administrators should record source, language, label definitions, collection period, total records, class counts, version, split strategy, preprocessing, intended use, and known limitations. A dataset may be registered from a plain-text file, but the label convention must be documented.

### 9.3 Evaluation Convention

Each evaluation should record model name and version, dataset name and version, evaluation date, split strategy, accuracy, precision, recall, F1, confusion-matrix counts, decision threshold or policy, preprocessing configuration, and class-balance notes. This permits responsible comparison between model versions.

### 9.4 Future Model Path

The system may later integrate a trained LSTM/Bi-LSTM, DistilBERT, RoBERTa, knowledge-graph model, social-context model, or multimodal model. A replacement must preserve the result contract or update this SRS and must be evaluated on a documented dataset and protocol.

---

## 10. Use Cases

### UC-01: Login

A visitor selects login, completes OAuth, and returns to the authenticated dashboard. If the flow is cancelled, the visitor remains on the public entry experience.

### UC-02: Analyze Article

An authenticated user enters sufficient text or selects a valid `.txt` file, selects Run Detection, and receives a Fake or Real result with confidence, processing time, structured explanation, highlighted phrases, signals, and disclaimer. The result is persisted under the user.

### UC-03: Review History

The user opens Prediction Log, searches text or verdict, filters by verdict/date/confidence, sorts the result set, and deletes an owned record. The UI refreshes after deletion.

### UC-04: Register Dataset

An administrator enters dataset name, description, version, and file. The browser validates plain text and computes or accepts counts. The server uploads bytes to managed storage and persists metadata. The new dataset appears as ready.

### UC-05: Operate Dataset Lifecycle

An administrator archives a dataset to preserve status history or deletes a dataset record when removal is required. The server checks admin role for both actions.

### UC-06: Record Evaluation

An administrator enters model and dataset names, percentage metrics, and confusion-matrix counts. The system persists the evaluation and updates latest metric cards, summary, confusion matrix, and history.

---

## 11. Error Handling and Operational Behavior

The system shall provide actionable messages for missing authentication, short articles, oversized input, unsupported files, invalid numeric ranges, incomplete dataset metadata, failed storage upload, failed AI response, unavailable database, unauthorized admin access, and unsuccessful deletion.

The UI shall prevent duplicate submissions while an operation is pending. Empty states shall provide next actions such as running the first scan, registering a dataset, or recording an evaluation. AI fallback behavior shall remain cautious and retain the disclaimer.

Database schema changes shall be generated, reviewed, applied through the approved migration workflow, and verified. Production publication shall require a valid checkpoint. Secrets shall be configured through managed environment settings.

---

## 12. Testing and Acceptance

### 12.1 Automated Testing

The automated suite shall cover authentication logout, protected prediction access, short-input validation, statistics aggregation, history filtering and sorting, owner deletion, admin authorization, metric range validation, dataset create/archive/delete procedure contracts, and representative history behavior. The current implementation has verified TypeScript compilation and 16 passing Vitest tests after the admin extension.

### 12.2 Integration Testing

Integration tests should verify user ownership predicates, prediction persistence, dataset storage metadata, admin dataset lifecycle, metric persistence, and confusion-matrix values. Tests that mutate shared production data must use isolated test infrastructure or mocks.

### 12.3 UI Testing

Acceptance review shall cover public login, protected routes, article entry, file validation, prediction results, explanation disclaimer, verdict colors, dashboard statistics, history controls, admin visibility, dataset forms, dataset lifecycle controls, metric forms, confusion matrix, empty states, and responsive navigation.

### 12.4 Acceptance Criteria

The baseline is accepted when all Must requirements in Section 4 are implemented, server-side authorization is verified, automated checks pass, the production build succeeds, and desktop/tablet/mobile review finds no blocking layout, contrast, navigation, or data-display defect.

---

## 13. Deployment and Maintenance

The WebApp shall use managed hosting and the project’s configured environment variables for authentication, database, AI, storage, and analytics. It shall not rely on local file persistence. Uploaded dataset bytes shall use managed storage and database references. Future high-volume deployments should add pagination, indexes, upload limits, audit logs, and monitoring.

Maintenance shall include dependency updates, schema review, test execution, evaluation record maintenance, storage lifecycle review, model-quality review, and SRS updates whenever product behavior or architecture changes.

---

## 14. Traceability Matrix

| Requirement area | PRD intent | Implemented artifact | Verification |
|---|---|---|---|
| Authentication | OAuth login/logout and protected routes | Managed OAuth, protected/admin procedures, route guards | Auth and admin tests |
| Input | Paste/type and text upload | Article input panel and file validation | UI and validation checks |
| Prediction | Fake/Real, confidence, processing time | Server analysis procedure and result console | Prediction contract tests |
| Explanation | Linguistic, emotional, credibility analysis | Structured fields, signals, highlights, disclaimer | Result UI review |
| Dashboard | Counts, percentages, recent activity | Dashboard statistics and activity list | Aggregation tests |
| History | Search, filters, sort, delete | History procedure and table controls | History behavior tests |
| Datasets | Admin registration and management | Dataset schema, admin procedures, managed storage | Admin workflow tests |
| Metrics | Evaluation metrics and confusion matrix | Metrics schema, cards, matrix, history | Metric validation and UI review |
| Visual system | Cyberpunk glitch-art responsiveness | Global stylesheet and responsive layouts | Desktop/tablet/mobile screenshots |
| Security | Authenticated and role-based access | Server-side protected/admin procedures | Authorization tests |

---

## 15. Future Enhancements and Open Decisions

Future enhancements may include URL-based extraction, similar-news retrieval, AI summaries, multilingual support, browser extensions, image/text multimodal analysis, knowledge graphs, social propagation features, model comparison charts, calibration plots, drift monitoring, annotation workflows, scheduled retraining, and public verification links.

The project owner must decide whether the final academic demonstration will use the configured server-side AI workflow or a trained LSTM/Bi-LSTM model, whether future datasets will remain plain text or move to a validated CSV schema, which label taxonomy will be used, and which evaluation protocol will be reported. Any decision that changes scope, data handling, model behavior, or deployment must update this SRS.

---

## 16. Final Baseline Statement

This document is the final SRS baseline for the Fake News Detection WebApp MVP and administrator extension. It covers the approved product scope, implemented user and admin behavior, managed-runtime architecture adaptation, persisted entities, AI response contract, security, responsible-use limitations, testing, deployment, assumptions, constraints, and future work. Subsequent changes should be traceable to a new requirement, acceptance criterion, or approved revision of this document.
