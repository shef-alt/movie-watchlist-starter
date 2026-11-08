import { getWatched, markAsWatched } from "../controllers/watchedController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/", verifyToken, getWatched);
router.post("/", verifyToken, markAsWatched);

export default router;
