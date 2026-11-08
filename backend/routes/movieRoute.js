import express from "express";
import {
  getMovies,
  recommendMovie,
  getMovieById,
} from "../controllers/movieController.js";

const router = express.Router();

router.get("/", getMovies);
router.get("/:id", getMovieById);
router.post("/recommend", recommendMovie);

export default router;
