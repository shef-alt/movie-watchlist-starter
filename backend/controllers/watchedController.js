import Watched from "../models/watchedModel.js";

export const getWatched = async (req, res) => {
  try {
    const data = await Watched.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data watched dari database" });
  }
};

export const markAsWatched = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { movie_id, rating, review } = req.body;

    const data = await Watched.create({ movie_id, user_id, rating, review })
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan data watched ke database" });
  }
}
