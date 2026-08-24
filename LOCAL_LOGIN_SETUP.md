# Local User Login Setup

The managed frontend uses Manus OAuth. A local clone must receive the same public Vite variables that are injected automatically in the managed project environment.

## Required variables

Create the local environment file expected by the project tooling and provide:

```env
VITE_APP_ID=your-manus-oauth-app-id
VITE_OAUTH_PORTAL_URL=https://api.manus.im
```

Do not commit the real values to GitHub. For a localhost development clone without these variables, the User Login page uses a clearly labelled `LOCAL DEMO LOGIN` button. This creates a non-admin demo session only on `localhost`, `127.0.0.1`, or `::1`; it is disabled in production and on hosted preview domains. Configure the variables above when you need real Manus OAuth.

## Correct local origin

Run the managed WebApp from the project root:

```bash
pnpm install
pnpm dev
```

Open the exact URL printed by Vite. The OAuth callback is generated from the current browser origin:

```text
<current-origin>/api/oauth/callback
```

Therefore, the local origin must be registered as an allowed callback for the OAuth application. A callback configured only for the hosted `manus.computer` preview will not automatically authorize `http://localhost:3000`.

## Login checklist

The backend must be running, `VITE_APP_ID` and `VITE_OAUTH_PORTAL_URL` must be present when Vite starts, and the browser must use the same origin that is registered for OAuth. Restart Vite after changing environment variables because Vite embeds `VITE_*` values during startup.

For the separate Flask/React reference implementation, use its own JWT login flow and start Flask before Vite; it does not use the managed Manus OAuth callback.
