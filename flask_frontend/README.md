# React + Tailwind Frontend Reference Implementation

This directory contains a separate React.js and Tailwind CSS frontend boilerplate that connects to the Flask backend in `../flask_backend`. It does not replace the managed WebApp frontend.

## Setup

```bash
cd flask_frontend
pnpm install
export VITE_FLASK_API_URL=http://localhost:5000/api
pnpm dev
```

Set `VITE_FLASK_API_URL` to the Flask API base URL. If it is omitted, the client defaults to `http://localhost:5000/api`.

## Included screens

The frontend includes a login and local reference registration screen, a protected signal dashboard, article text input, plain-text upload, prediction result explanation, confidence and processing time, user statistics, prediction history search/filter/sort/delete, and an administrator console for dataset registration, archive/delete actions, storage metadata, evaluation history, and confusion-matrix values.

## API integration

The client is centralized in `src/lib/api.ts`. It adds the JWT bearer token from `localStorage` to protected requests and exposes typed wrappers for the Flask routes. The token key is `fake-real-token`. For production, consider replacing localStorage with a secure cookie-based session or a carefully designed token refresh flow.

## Development notes

The frontend expects the Flask API contract documented in `../flask_backend/README.md`. The admin metric panel displays stored metric data and is prepared for adding numeric evaluation-entry fields. The article result panel renders the structured explanation fields returned by the Flask model service.

## Production checklist

Set a production API URL, restrict Flask CORS to the deployed frontend origin, serve the frontend over HTTPS, add a token refresh or secure-cookie strategy, configure error monitoring, and replace the Flask stub classifier with the trained model adapter.
