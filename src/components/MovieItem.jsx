function MovieItem({ movie, favorite, onSelect, onToggleFavorite }) {
  const hasPoster = movie.Poster && movie.Poster !== 'N/A'

  return (
    <article className="movie-card">
      <button className="poster-button" type="button" onClick={onSelect} aria-label={`View details for ${movie.Title}`}>
        {hasPoster
          ? <img src={movie.Poster} alt={`${movie.Title} poster`} loading="lazy" />
          : <span className="poster-placeholder" aria-hidden="true">✳</span>}
        <span className="rating-badge">★ {movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : '—'}</span>
      </button>
      <button className={favorite ? 'favorite-button is-favorite' : 'favorite-button'} type="button" onClick={onToggleFavorite} aria-label={favorite ? `Remove ${movie.Title} from favorites` : `Add ${movie.Title} to favorites`}>
        {favorite ? '♥' : '♡'}
      </button>
      <p className="movie-title" title={movie.Title}>{movie.Title}</p>
      <span className="movie-year">{movie.Year}</span>
    </article>
  )
}

export default MovieItem
