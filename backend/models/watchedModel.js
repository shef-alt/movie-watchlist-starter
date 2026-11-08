import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Movie from "./movieModel.js";
import User from "./userModel.js";

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

Watched.belongsTo(Movie, {
    foreignKey: "movie_id",
    targetKey: "id",
    onDelete: "CASCADE"
})

Watched.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "id",
    onDelete: "CASCADE"
})

export default Watched;

await sequelize.sync();