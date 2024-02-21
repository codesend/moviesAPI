const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require('dotenv').config();
const HTTP_PORT = process.env.PORT || 8080;
const MoviesDB = require("./modules/moviesDB.js");
const db = new MoviesDB();

app.use(cors());
app.use(express.json());

db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("The web server has started...");
      console.log(`Server is listening on port ${HTTP_PORT}`);
      console.log("Press CTRL+C to stop the server.");
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get('/', async (req, res) => {
  try {
    res.json({ message: 'API Listening' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/api/movies', async (req, res) => {
  try {
    const newMovie = await db.addNewMovie(req.body);
    res.json(newMovie);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add new movie' });
  }
});

app.get('/api/movies', async (req, res) => {
  const { page, perPage, title } = req.query;
  try {
    const movies = await db.getAllMovies(page, perPage, title);
    res.json(movies);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  try {
    const movie = await db.getMovieById(movieId);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch movie' });
  }
});

app.put('/api/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  const data = req.body;
  try {
    const result = await db.updateMovieById(data, movieId);
    if (result.nModified > 0) {
      res.json({ message: 'Movie updated successfully' });
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update movie' });
  }
});

app.delete('/api/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  try {
    const result = await db.deleteMovieById(movieId);
    if (result.deletedCount > 0) {
      res.json({ message: 'Movie deleted successfully' });
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete movie' });
  }
});
