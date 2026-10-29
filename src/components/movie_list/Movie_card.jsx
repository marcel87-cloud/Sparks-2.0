import React from 'react'

import './Movie_card.css';

const Movie_card = ({ movie }) => {
  return (
    <a
      href={`https://www.themoviedb.org/movie/${movie.id}`}
      target="_blank"
      rel="noreferrer"
      className="movie_card"
    >
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={`${movie.title} poster`}
            className="movie_poster"
          />
        ) : (
          <div className="movie_poster movie_poster_placeholder">{movie.title}</div>
        )}

        <div className="movie_details">
          <h3 className="movie_details_heading">{movie.title}</h3>

          <div className="movie_date_rate">
            <p>{movie.release_date || "TBA"}</p>
            <p>{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <p className="movie_description">
            {movie.overview ? `${movie.overview.slice(0, 100)}...` : "No description available."}
          </p>
        </div>
    </a>
  )
}

export default Movie_card
