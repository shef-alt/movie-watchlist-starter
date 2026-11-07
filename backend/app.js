import "dotenv/config";
import express from "express";
import { pool } from "./config/db.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { GoogleGenAI, FunctionCallingConfigMode, Type } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Movies
app.get("/api/movies", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM movies");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch data" });
  }
});

app.get("/api/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM movies WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "movies not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch data" });
  }
});

// Watchlist
app.get("/api/watchlist", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM watchlist");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch data" });
  }
});

app.get("/api/watchlist/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM watchlist WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "watchlist not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch data" });
  }
});

app.post("/api/watchlist", async (req, res) => {
  try {
    const { movie_id } = req.body;

    const { rows } = await pool.query(
      "INSERT INTO watchlist ( movie_id) VALUES ($1) RETURNING *",
      [movie_id],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to post data" });
  }
});

app.delete("/api/watchlist/:id", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const {rows} = await pool.query("DELETE FROM watchlist WHERE movie_id = $1 AND user_id = $2",
      [id, user_id],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete data" });
  }
})

// Watched & reviews
app.get("/api/watched", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM watched");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch data" });
  }
});

app.post("/api/watched", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { movie_id, rating, review } = req.body;

    const { rows } = await pool.query(
      "INSERT INTO watched (movie_id, user_id, rating, review) VALUES ($1, $2, $3, $4) RETURNING *",
      [movie_id, user_id, rating, review],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to post data" });
  }
});

// Movie recommendation
app.post("/api/movies/recommend", async (req, res) => {
  try {
    const { prompt } = req.body;
    prompt.trim();
    if (!prompt) {
      return res
        .status(400)
        .json({ message: "Deskripsi atau prompt wajib diisi" });
    }

    const { rows } = await pool.query("SELECT * FROM movies");
    if (rows.length === 0) {
      return res.status(404).json({ message: "Movies not found" });
    }

    const recommendMovieDeclaration = {
      name: "recommend_movie",
      description: "pilih satu film dari daftar untuk user, atau tandai bahwa pesan user bukan permintaan film",
      parametersJsonSchema: {
        type: "object",
        properties: {
          is_movie_request: { type: "boolean", description: "apakah prompt user benar-benar permintaan rekomendasi film"},
          movie_id: { type: "integer" },
          reasoning: { type: "string", description: "alasan rekomendasi film" },
        },
        required: ["is_movie_request", "movie_id", "reasoning"],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `buatkan rekomendasi film dari permintaan user: ${prompt} dengan memilih dari daftar film ${JSON.stringify(rows)}`,
      config: {
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: ["recommend_movie"],
          },
        },
        tools: [{ functionDeclarations: [recommendMovieDeclaration] }],
      },
    });

    const { is_movie_request, movie_id, reasoning } = response.functionCalls?.[0].args;

    if(!is_movie_request) {
      return res
        .status(400)
        .json({
          message: "Berikan permintaan mengenai rekomendasi film",
        });
    }

    const movie = rows.find((m) => String(m.id) === String(movie_id));
    if (!movie) {
      return res
        .status(502)
        .json({
          message: "AI memilih film yang tidak ada di database",
        });
    }

    return res.status(200).json({
      movie_id,
      reasoning,
      movie,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to get recommendation from AI" });
  }
});

// auth
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email dan password wajib diisi" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [username, email, passwordHash],
    );
    res.status(201).json({ message: "registrasi berhasil", user: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "email sudah terdaftar" });
    }
    console.error(err);
    res.status(500).json({ error: "failed to post data" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email dan password wajib diisi" });
    }

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = rows[0];
    const isValid =
      user && (await bcrypt.compare(password, user.password_hash));

    if (!isValid) {
      return res
        .status(401)
        .json({ message: "email atau password yang dimasukkan salah" });
    }

    const tokenPayload = {
      userId: user.id,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    req.user = { id: token.sub };
    return res.status(200).json({
      message: "login berhasil",
      token: token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to get data" });
  }
});

// Middleware
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.listen(process.env.PORT, () => {
  console.log(`server berhasil berjalan di port ${process.env.PORT}`);
});
