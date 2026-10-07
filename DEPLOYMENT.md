# Deploying ProdHive on Render

The Render Blueprint deploys the React frontend as the only public web service.
It forwards `/api` and `/ws` to the private gateway, which routes requests to
the private auth and core services. GitHub can therefore deliver webhooks to
the frontend's stable HTTPS URL without a tunnel.

## Deploy

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repository. Render reads
   `render.yaml` and creates the services, databases, and persistent upload disk.
3. When prompted for `JWT_SECRET`, enter the **same random secret** for auth,
   core, and gateway. Use a long random value.
4. Set the GitHub App values when prompted for the core service:
   `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, and `GITHUB_APP_WEBHOOK_SECRET`.
   `OPENROUTER_API_KEY` is optional if the AI features are not used.
5. Wait for `prodhive-frontend` to deploy. Its default URL is
   `https://prodhive-frontend.onrender.com`; if Render assigns a different URL,
   update `GITHUB_APP_SETUP_REDIRECT` on `prodhive-core` to that URL and redeploy.
6. In the GitHub App settings, set the **Setup URL** to
   `https://prodhive-frontend.onrender.com/api/core/github/app/setup` (using the
   actual frontend URL if it differs). Set the **Webhook URL** to
   `https://prodhive-frontend.onrender.com/api/core/webhooks/github`, use the
   same webhook secret as `GITHUB_APP_WEBHOOK_SECRET`, and enable the Pull
   request events needed by the app.

All Render services and databases are configured for the Oregon region. The
Blueprint uses paid starter services, paid PostgreSQL instances, and a
persistent disk; review Render's current pricing before confirming creation.
Keep the backend services private. Only the frontend needs a public URL.

## Local development

The Render Dockerfile is separate from the Vite development server. Local
frontend API and WebSocket requests continue to use the Vite proxy to the
gateway on `localhost:8080`. Run the existing Docker Compose stack and start
the frontend with `npm run dev` from `prodhive_frontend`.
