import MovieItem from './MovieItem.jsx'

function MovieList({ movies, favorites, loading, hasSearched, error, emptyMessage, onSelect, onToggleFavorite }) {
  if (loading) {
    return <div className="loading-state" role="status"><div className="spinner" />Finding films for you…</div>
  }
  if (hasSearched && !error && movies.length === 0) {
    return <div className="empty-state"><strong>No films found</strong><p>{emptyMessage || 'Try another title or adjust the filters.'}</p></div>
  }
  if (!movies.length) return null

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieItem
          key={movie.imdbID}
          movie={movie}
          favorite={favorites.some((item) => item.imdbID === movie.imdbID)}
          onSelect={() => onSelect(movie)}
          onToggleFavorite={() => onToggleFavorite(movie)}
        />
      ))}
    </div>
  )
}

export default MovieList
