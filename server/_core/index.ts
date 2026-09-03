import "dotenv/config";
import { createServer } from "http";
import { buildApp } from "./app";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = buildApp();
  const server = createServer(app);
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 3000;

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
