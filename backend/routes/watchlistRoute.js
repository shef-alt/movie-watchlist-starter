import {
  getWatchlist,
  getWatchlistById,
  addToWatchlist,
  deleteFromWatchlist,
} from "../controllers/watchlistController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/", getWatchlist);
router.get("/:id", getWatchlistById);
router.post("/", verifyToken, addToWatchlist);
router.delete("/:id", verifyToken, deleteFromWatchlist);

export default router;
