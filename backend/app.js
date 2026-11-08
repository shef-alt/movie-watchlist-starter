import "dotenv/config";
import express from "express";
import cors from "cors";
import MovieRoute from "./routes/movieRoute.js";
import WatchlistRoute from "./routes/watchlistRoute.js";
import WatchedRoute from "./routes/watchedRoute.js";
import AuthRoute from "./routes/authRoute.js";
import { sequelize } from "./config/db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/movies", MovieRoute);
app.use("/api/watchlist", WatchlistRoute);
app.use("/api/watched", WatchedRoute);
app.use("/api/auth", AuthRoute);

try {
  await sequelize.sync();
  console.log("Berhasil sinkronisasi database");
} catch (err) {
  console.error("Gagal sinkronisasi database: ", err);
}

app.listen(process.env.PORT, () => {
  console.log(`server berhasil berjalan di port ${process.env.PORT}`);
});
