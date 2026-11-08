import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email dan password wajib diisi" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const data = await User.create({ username, email, password_hash });

    res.status(201).json({ message: "Berhasil registrasi", user: data[0] });
  } catch (err) {
    if (err.name == "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }
    res.status(500).json({ error: "Gagal memproses autentikasi register" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    const data = await User.findAll({ where: { email: email } });

    const user = data[0];
    const isValid =
      user && (await bcrypt.compare(password, user.password_hash));

    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Email atau password yang dimasukkan salah" });
    }

    const tokenPayload = {
      user_id: user.id,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).json({
      message: "Login berhasil",
      token: token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memproses autentikasi login" });
  }
};
