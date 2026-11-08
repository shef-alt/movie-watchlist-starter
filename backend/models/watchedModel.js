import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Watched = sequelize.define(
  "watched",
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
    },
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    review: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: "uq_user_movie",
        unique: true,
        fields: ["user_id", "movie_id"],
      },
    ]
  },
);

export default Watched;