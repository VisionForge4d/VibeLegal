import express from "express";
import requestId from "express-request-id";
import { errorHandler } from "./middleware/errorHandler";
import { routes } from "./routes";

const app = express();
app.use(requestId());
app.use(express.json());
app.use("/api", routes);

// must be last
app.use(errorHandler);

export default app;
