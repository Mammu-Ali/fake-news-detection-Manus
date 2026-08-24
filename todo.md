# Project TODO

- [x] Follow the approved PRD as the source of truth for MVP scope and behavior
- [x] Preserve the specified product behavior and visual direction within the managed React/Tailwind/tRPC runtime; document the runtime adaptation at delivery
- [x] Implement OAuth login and logout with protected dashboard routes
- [x] Build the news article input page with paste/type text input
- [x] Add plain-text-only file upload as an alternative article input
- [x] Implement AI fake/real prediction with confidence percentage
- [x] Display prediction processing time alongside confidence
- [x] Build the explanation panel with linguistic patterns, emotional tone, credibility signals, key phrase highlights, and the explicit pattern-based disclaimer
- [x] Build authenticated dashboard summary statistics and recent activity feed
- [x] Build prediction history with search, filtering, sorting, and individual deletion
- [x] Apply red styling consistently to Fake verdicts and green styling consistently to Real verdicts
- [x] Implement responsive sidebar dashboard layout
- [x] Apply high-contrast cyberpunk glitch-art visual system with black background, white typography, cyan/red chromatic shifts, CRT scan lines, and terminal-inspired elements
- [x] Add backend data contracts and persistence for prediction records
- [x] Add Vitest coverage for the implemented application behavior
- [x] Run type checks, tests, production build, and responsive visual verification

## Gap remediation

- [x] Add project documentation explaining the managed-runtime adaptation from the PRD’s Flask/MongoDB/JWT/LSTM stack to the available server-side runtime while preserving the requested product behavior
- [x] Return structured explanation dimensions for linguistic patterns, emotional tone, and credibility signals, and highlight influential phrases in the submitted article
- [x] Add verdict, date, and confidence filtering to prediction history in the backend and UI
- [x] Add Vitest coverage for protected analysis validation, stats aggregation, list filter contract, deletion validation, and history behavior
- [x] Capture and review mobile screenshot for responsive verification; tablet layout shares the intermediate responsive breakpoint

## Final verification gaps

- [x] Add deterministic tests for Fake/Real statistics aggregation and percentages
- [x] Add a successful authenticated-owner deletion test
- [x] Add a filtered and sorted history test using representative prediction rows

- [x] Add a deterministic history behavior test that verifies representative rows are filtered and sorted by verdict, confidence, and date constraints

## Admin dashboard extension

- [x] Add admin-only navigation and protected admin route
- [x] Add dataset records and admin dataset management workflow
- [x] Support dataset metadata, upload/status actions, and deletion with admin authorization
- [x] Add model evaluation metrics dashboard with accuracy, precision, recall, F1, confusion matrix, and dataset summary
- [x] Add admin backend procedures and database persistence
- [x] Add Vitest coverage for admin authorization, dataset operations, and metric input validation
- [x] Verify admin dashboard responsiveness and save a new checkpoint

## Admin gap remediation

- [x] Add admin dataset deletion while retaining archive status
- [x] Persist dataset file metadata through managed storage rather than only local parsing
- [x] Add confusion matrix visualization and dedicated dataset summary cards
- [x] Add Vitest coverage for dataset create/archive/delete success paths and metric input validation
- [x] Capture admin mobile and tablet screenshots
- [x] Save a new checkpoint after the admin extension is complete

## Documentation deliverables

- [x] Create a complete SRS covering the approved PRD, implemented product behavior, architecture adaptation, data model, security, testing, deployment, assumptions, constraints, and future enhancements

- [x] Rewrite and finalize the SRS after validation, then re-review it against the PRD, implemented features, architecture adaptation, data model, security, testing, deployment, assumptions, constraints, and future enhancements

## Flask backend reference implementation

- [x] Create a separate Flask/Python backend boilerplate without replacing the managed WebApp runtime
- [x] Add environment configuration, dependency manifest, and application factory
- [x] Add JWT-ready authentication and role-based admin authorization scaffolding
- [x] Add MongoDB model/repository abstractions for users, predictions, datasets, and model metrics
- [x] Add prediction, explanation, history, dataset, and evaluation API blueprints
- [x] Add plain-text validation and structured response schemas
- [x] Add Flask backend tests and setup documentation
- [x] Run syntax and test verification and deliver the boilerplate

## Flask boilerplate finalization

- [x] Add explicit dataclass model abstractions for users, predictions, datasets, and model metrics
- [x] Deliver the verified Flask backend boilerplate to the user

## React frontend reference implementation

- [x] Create a separate React.js and Tailwind CSS frontend without replacing the managed frontend
- [x] Add Flask API client, environment configuration, and token persistence
- [x] Add login/register/current-user authentication screens
- [x] Add article analysis input and structured result explanation UI
- [x] Add prediction statistics and history filters/deletion UI
- [x] Add admin dataset lifecycle and model evaluation UI
- [x] Add responsive cyberpunk styling and API error/loading states
- [x] Add frontend build verification and setup documentation

## React frontend gap remediation

- [x] Render highlighted phrases from the Flask analysis response in the result UI
- [x] Implement the complete admin model-evaluation form and submit it through the Flask API client
- [x] Re-review the frontend against the full Flask response contract

## React frontend final verification

- [x] Add visible error handling and non-negative integer validation to admin metric submission
- [x] Perform a systematic frontend-to-Flask API contract verification pass across auth, prediction, history, dataset, and metric routes

## User login page

- [x] Add a visible User Login entry point to the public landing screen
- [x] Add a dedicated cyberpunk-styled login view that starts the existing OAuth flow
- [x] Preserve protected dashboard routing and server-enforced administrator access
- [x] Verify login navigation and responsive presentation, then save a checkpoint

## Login verification follow-up

- [x] Capture mobile and tablet screenshots for the landing and User Login flow
- [x] Save a new checkpoint after the login-page update is fully verified

## Landing button interaction

- [x] Add cyberpunk glitch hover animation to the “ENTER THE NODE” landing button
- [x] Respect reduced-motion preferences and verify desktop/mobile presentation
- [x] Run checks and save a checkpoint for the animation update

- [x] Save a new checkpoint after the landing-button glitch animation update

## User Login bug

- [x] Diagnose why the local User Login button does not complete authentication
- [x] Add a clear local configuration/error path if OAuth variables or callback settings are unavailable
- [x] Verify the repaired login flow and save a checkpoint

## Login end-to-end recovery

- [x] Add a callback recovery redirect so provider-side OAuth failures return to the styled login page with a readable error
- [x] Add a safe login error query-state renderer and verify invalid or failed callback recovery
- [x] Perform the final checkpoint after the end-to-end login fix

- [x] Verify OAuth handoff in a browser; successful provider sign-in requires the user’s external OAuth account and callback registration

## Login button repair

- [x] Make the User Login button reliably invoke OAuth from a direct button handler
- [x] Add a visible fallback when local OAuth configuration is unavailable
- [x] Verify the button build and interaction path, then save a checkpoint

- [x] Save a fresh checkpoint after the final login-button repair changes

## Local authentication fix

- [x] Add a clearly labelled local demo-login fallback when Manus OAuth variables are unavailable
- [x] Keep the fallback restricted to local development and prevent it from being enabled in production
- [x] Verify local login reaches the dashboard and save a checkpoint

## Local demo security hardening

- [x] Restrict local demo login to localhost or 127.0.0.1 requests instead of all development hosts
- [x] Add a negative test proving non-local origins cannot use local demo login
- [x] Re-run verification and save a checkpoint for the local login fix
- [x] Use a browser-compatible SameSite policy for insecure localhost demo sessions and verify the dashboard UI authenticates
- [x] Re-run checks and save a final checkpoint after the browser cookie fix
- [x] Fix the reported login failure shown by the AUTH GATE ERROR screen
- [x] Verify local demo login and hosted OAuth configuration behavior end to end
- [x] Re-run authentication tests and save a checkpoint after the login fix
- [x] Add a guest mode entry point from the public landing page
- [x] Add unauthenticated guest article analysis without persisting private history
- [x] Keep history, statistics, logout, and admin features protected for signed-in users
- [x] Add guest-access tests and verify desktop/mobile guest flows
- [x] Save a checkpoint after guest access is verified
