import { createApp, log } from "./app";

createApp()
  .then(({ httpServer }) => {
    // Replit and other long-running Node hosts provide PORT. The fallback
    // keeps local development consistent with the existing workflow.
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  })
  .catch((error) => {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  });