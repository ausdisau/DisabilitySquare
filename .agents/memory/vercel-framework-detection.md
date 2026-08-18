---
name: Vercel framework detection
description: Deployment constraint caused by legacy Next.js files in the Vite/Express project.
---

Vercel can detect the legacy Next.js scaffold in this repository even though the active application is built with Vite and served by Express. Deployments must explicitly select the generic framework, build the Vite/Express output, and route API requests to the serverless Express entrypoint.

**Why:** The build command completed successfully but Vercel failed afterward while looking for a `.next` directory that this application does not produce.

**How to apply:** Preserve the Vite build output (`dist/public`), keep the API function entrypoint and rewrites aligned with the Express routes, and do not rely on Vercel's automatic framework detection for this repository.