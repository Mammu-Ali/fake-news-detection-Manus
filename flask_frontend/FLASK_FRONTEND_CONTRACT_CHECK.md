# Flask Frontend Contract Verification

The standalone React frontend was reviewed against the Flask backend contract after the final integration pass.

| Backend route | React client method | UI consumer | Verified fields or behavior |
|---|---|---|---|
| `POST /api/auth/register` | `api.register` | Auth screen | Name, email, password, returned user identity. |
| `POST /api/auth/login` | `api.login` | Auth screen and session hook | Access token and user role. |
| `GET /api/auth/me` | `api.me` | Session bootstrap | id, email, name, role. |
| `POST /api/predictions/analyze` | `api.analyze` | Dashboard result panel | id, verdict, confidence, processing time, explanation, linguistic patterns, emotional tone, credibility signals, signals, highlighted phrases, disclaimer. |
| `GET /api/predictions/stats` | `api.stats` | Dashboard stat cards | total, fake, real, Fake percentage, Real percentage. |
| `GET /api/predictions` | `api.history` | Prediction log | items, article text, verdict, confidence, created date, filters, sort. |
| `DELETE /api/predictions/:id` | `api.deletePrediction` | History delete action | success response and reload. |
| `GET /api/admin/datasets` | `api.datasets` | Admin dataset registry | items, dataset metadata, file name, counts, version, status. |
| `POST /api/admin/datasets` | `api.createDataset` | Admin dataset registration | Plain-text file name, base64 file content, metadata, and counts. |
| `PATCH /api/admin/datasets/:id/archive` | `api.archiveDataset` | Dataset status action | success response and reload. |
| `DELETE /api/admin/datasets/:id` | `api.deleteDataset` | Dataset delete action | success response and reload. |
| `GET /api/admin/metrics` | `api.metrics` | Admin metric cards, matrix, history | model, dataset, accuracy, precision, recall, F1, TP, TN, FP, FN. |
| `POST /api/admin/metrics` | `api.createMetric` | Complete admin evaluation form | Percentage validation, non-negative count validation, submission, and visible API errors. |

The client uses a single API base URL, attaches the JWT bearer token to protected calls, surfaces request failures through page-level error states, and preserves the Flask response field names in the local TypeScript types. The production checklist remains to configure HTTPS, restrict CORS, and replace localStorage token persistence with a secure-cookie or refresh-token strategy.
