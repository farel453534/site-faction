import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "node:path";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Same-origin by default: only enable cross-origin CORS when FRONTEND_URL is
// explicitly set (cross-domain "Option B"). Otherwise disallow credentialed
// cross-origin requests instead of reflecting any origin.
const allowedOrigin = process.env["FRONTEND_URL"];
app.use(
  cors({ origin: allowedOrigin ? [allowedOrigin] : false, credentials: true }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env["SESSION_SECRET"]));

app.use("/api", router);

// Same-origin mode: serve the built frontend from ./public (copied in by build.mjs)
// so a single service can host both the site and the API. Skipped in dev (no dir).
const staticDir = process.env["STATIC_DIR"] ?? path.join(__dirname, "public");
if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path === "/api" || req.path.startsWith("/api/")) return next();
    if (path.extname(req.path)) return next();
    res.sendFile(path.join(staticDir, "index.html"));
  });
  logger.info({ staticDir }, "Serving static frontend (same-origin mode)");
}

export default app;
