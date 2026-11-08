import { getWatched, markAsWatched } from "../controllers/WatchedController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/", getWatched);
router.post("/", verifyToken, markAsWatched);

export default router;
