import Watchlist from "./watchlistModel.js";
import Watched from "./watchedModel.js";
import Movie from "./movieModel.js";
import User from "./userModel.js";

Movie.hasMany(Watchlist, {
  foreignKey: "movie_id",
  onDelete: "CASCADE",
});

Movie.hasMany(Watched, {
  foreignKey: "movie_id",
  onDelete: "CASCADE",
});

User.hasMany(Watchlist, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasMany(Watched, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Watched.belongsTo(Movie, {
  foreignKey: "movie_id",
  targetKey: "id",
  onDelete: "CASCADE",
});

Watched.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
  onDelete: "CASCADE",
});

Watchlist.belongsTo(Movie, {
  foreignKey: "movie_id",
  targetKey: "id",
  onDelete: "CASCADE",
});

Watchlist.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
  onDelete: "CASCADE",
});
