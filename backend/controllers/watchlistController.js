import Watchlist from "../models/watchlistModel.js";

export const getWatchlist = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const data = await Watchlist.findAll({ where: { user_id }});
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data watchlist dari database" });
  }
};

export const getWatchlistById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id; 
    const data = await Watchlist.findOne({ where: { id: id, user_id }});

    if (!data) {
      return res.status(404).json({ error: `Tidak ditemukan watchlist dengan id ${id}` });
    }

    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal ambil data watchlist dari database" });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const { movie_id } = req.body;

    const data = await Watchlist.create({ movie_id, user_id })
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambahkan data watchlist ke database" });
  }
};

export const deleteFromWatchlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const data = await Watchlist.destroy({ where: { movie_id: id, user_id}})
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus data watchlist dari database" });
  }
};


