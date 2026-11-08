import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Movie from "./movieModel.js";
import User from "./userModel.js";

const Watchlist = sequelize.define(
  "watchlist",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
  },
);

Watchlist.belongsTo(Movie, {
    foreignKey: "movie_id",
    targetKey: "id",
    onDelete: "CASCADE"
})

Watchlist.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "id",
    onDelete: "CASCADE"
})

export default Watchlist;

await sequelize.sync();