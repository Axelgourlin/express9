const connection = require("../db-config");
const Joi = require("joi");

const db = connection.promise();

const validate = (data, forCreation = true) => {
  const presence = forCreation ? "required" : "optional";
  return Joi.object({
    title: Joi.string().max(255).presence(presence),
    director: Joi.string().max(255).presence(presence),
    year: Joi.number().integer().min(1888).presence(presence),
    color: Joi.boolean().presence(presence),
    duration: Joi.number().integer().min(1).presence(presence),
  }).validate(data, { abortEarly: false }).error;
};

// Find Movies all movies or movies with filter (color, max duration)
const findManyMovies = ({ filters: { max_duration, color } }) => {
  let sql = "SELECT * FROM movies";
  const sqlValues = [];
  if (color) {
    sql += " WHERE color = ?";
    sqlValues.push(color);
  }
  if (max_duration) {
    if (color) sql += " AND duration <= ? ;";
    else sql += " WHERE duration <= ?";
    sqlValues.push(max_duration);
  }

  return db.query(sql, sqlValues).then(([results]) => results);
};

// find One movie with ID
const findOneMovieWithId = (movieId) => {
  const sql = `"SELECT * FROM movies WHERE id = ?"`;
  return db.query(sql, [movieId]).then(([results]) => results[0]);
};

// Add Movie
const create = ({ title, director, year, color, duration }) => {
  const sql = `INSERT INTO movies (title, director, year, color, duration)
    VALUES (?, ?, ?, ?, ?)`;
  return db
    .query(sql, [title, director, year, color, duration])
    .then(([result]) => {
      const id = result.insertId;
      return { id, title, director, year, color, duration };
    });
};

// Update Movie
const update = ({ movieId, newAttributes }) => {
  const sql = `"UPDATE movies SET ? WHERE id = ?"`;
  return db.query(sql, [newAttributes, movieId]);
};

const deleteMovie = ({ movieId }) => {
  const sql = `"DELETE movies WHERE id = ?"`;
  return db.query(sql, [movieId]).then(([result]) => result.affectedRows !== 0);
};

module.exports = {
  findManyMovies,
  findOneMovieWithId,
  create,
  validate,
  update,
  deleteMovie,
};
