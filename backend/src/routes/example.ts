import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { notFound } from "../utils/httpErrors";
const r = Router();

r.get("/explode", asyncHandler(async (_req, _res) => {
  throw notFound("Demo: thing not found");
}));

export default r;
