# Flask Backend Reference Implementation

This directory contains a separate Flask/Python backend boilerplate aligned with the Fake News Detection SRS. It is a reference implementation for the PRD’s Flask, MongoDB, JWT, and model-serving architecture. It does not replace the existing managed React WebApp runtime.

## Structure

```text
flask_backend/
  app/
    api/                  # auth, predictions, and admin blueprints
    repositories/         # MongoDB persistence helpers
    services/             # model-service abstraction and stub classifier
    __init__.py           # application factory
    auth.py               # JWT and admin decorators
    config.py             # environment-backed configuration
    schemas.py            # validation and response contract
  tests/                  # Flask API tests
  requirements.txt
  run.py
```

## Setup

Create a Python virtual environment, install the dependencies, and provide environment variables from the deployment platform. Do not commit real secrets.

```bash
cd flask_backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=run.py
export MONGO_URI=mongodb://localhost:27017/fake_news_detection
export JWT_SECRET_KEY='replace-me'
flask run --port 5000
```

The health endpoint is available at `GET /api/health`. The API uses JSON requests and JWT bearer tokens for protected operations. The current model service uses a deterministic stub for local development. Replace `app/services/model_service.py` with a trained LSTM/Bi-LSTM inference adapter or an approved inference provider before production use.

## API surface

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Service health check. |
| POST | `/api/auth/register` | Public | Register a local reference account. |
| POST | `/api/auth/login` | Public | Issue a JWT. |
| GET | `/api/auth/me` | Authenticated | Return current JWT claims. |
| POST | `/api/predictions/analyze` | Authenticated | Analyze article text and persist prediction. |
| GET | `/api/predictions` | Authenticated | Search, filter, and sort personal history. |
| GET | `/api/predictions/stats` | Authenticated | Return personal Fake/Real statistics. |
| DELETE | `/api/predictions/<id>` | Authenticated | Delete an owned prediction. |
| GET | `/api/admin/datasets` | Admin | List datasets. |
| POST | `/api/admin/datasets` | Admin | Register a plain-text dataset metadata record. |
| PATCH | `/api/admin/datasets/<id>/archive` | Admin | Archive a dataset. |
| DELETE | `/api/admin/datasets/<id>` | Admin | Delete a dataset record. |
| GET | `/api/admin/metrics` | Admin | List model evaluation records. |
| POST | `/api/admin/metrics` | Admin | Record model metrics and confusion counts. |

## Dataset file storage

The dataset endpoint accepts a base64-encoded plain-text file in `fileContentBase64` and stores file-size metadata. In production, replace the storage placeholder in `app/api/admin.py` with an S3-compatible upload service and persist the resulting object key and URL. The database should store references rather than file bytes.

## Testing

Run the reference tests from this directory:

```bash
pytest -q
```

The tests cover service health, authentication boundaries, minimum article length, admin authorization, and metric-range validation. MongoDB-backed success paths should be tested with an isolated test database or repository mocks.

## Production hardening checklist

Before production deployment, set strong secret values, use HTTPS, restrict CORS to the deployed frontend, add rate limiting, configure MongoDB authentication and indexes, replace the stub classifier, validate and scan uploaded files, add structured logging, add request IDs, use isolated test data, and configure a production WSGI server such as Gunicorn.
