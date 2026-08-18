import { createApp } from "../server/app";
import path from "path";

// Reuse one initialization promise across warm Vercel invocations so route
// registration and idempotent seed operations happen only once per instance.
const appPromise = createApp({
  development: false,
  staticPath: path.resolve(process.cwd(), "dist/public"),
});

export default async function handler(req: any, res: any) {
  const { app } = await appPromise;
  return app(req, res);
}