import express from "express";
import requestId from "express-request-id";
import { routes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./utils/httpErrors";

const app = express();

app.use(requestId());
app.use(express.json());
app.use("/api", routes);

// If no route matched, forward a typed 404 into the centralized handler
app.use((_req, _res, next) => next(notFound("Route not found")));

// MUST be last
app.use(errorHandler);

export default app;
