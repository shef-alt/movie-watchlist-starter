import Movie from "../models/movieModel.js";
import { GoogleGenAI, FunctionCallingConfigMode, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMovies = async (req, res) => {
  try {
    const data = await Movie.findAll();
    res
      .status(200)
      .json({ message: "Berhasil mengambil data film dari database", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data film dari database" });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Movie.findOne({ where: { id: id } });

    if (!data) {
      return res
        .status(404)
        .json({ error: `Movie dengan id ${id} tidak ditemukan` });
    }

    res
      .status(200)
      .json({
        message: `Berhasil mengambil data film id ${id} dari database`,
        data,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data film dari database" });
  }
};

export const recommendMovie = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (typeof prompt !== "string" || prompt.trim() === "") {
      return res
        .status(400)
        .json({ message: "Deskripsi atau prompt wajib diisi" });
    }

    const data = await Movie.findAll();

    const recommendMovieDeclaration = {
      name: "recommend_movie",
      description:
        "pilih satu film dari daftar untuk user, atau tandai bahwa pesan user bukan permintaan film",
      parametersJsonSchema: {
        type: "object",
        properties: {
          is_movie_request: {
            type: "boolean",
            description:
              "apakah prompt user benar-benar permintaan rekomendasi film",
          },
          movie_id: { type: "integer" },
          reasoning: { type: "string", description: "alasan rekomendasi film" },
        },
        required: ["is_movie_request", "movie_id", "reasoning"],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `buatkan rekomendasi film dari permintaan user: ${prompt} dengan memilih dari daftar film ${JSON.stringify(data)}`,
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

    const args = response.functionCalls?.[0].args;

    if (!args) {
      return res
        .status(502)
        .json({ message: "AI tidak mewmberikan rekomendasi" });
    }

    const { is_movie_request, movie_id, reasoning } = args;

    if (!is_movie_request) {
      return res.status(400).json({
        message: "Berikan permintaan mengenai rekomendasi film",
      });
    }

    const movie = data.find((m) => String(m.id) === String(movie_id));
    if (!movie) {
      return res.status(502).json({
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
    res.status(500).json({ error: "Gagal mendapatkan rekomendasi dari AI" });
  }
};
