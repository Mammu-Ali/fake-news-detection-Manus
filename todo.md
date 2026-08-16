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
