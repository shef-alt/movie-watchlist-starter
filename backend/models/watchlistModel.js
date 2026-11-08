import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

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

export default Watchlist;