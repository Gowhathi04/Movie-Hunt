import MovieItem from './MovieItem.jsx'

function FavoritesList({ favorites, onSelect, onRemove }) {
  if (!favorites.length) {
    return <div className="empty-state"><strong>Your watchlist is waiting</strong><p>Save films with the heart button and they’ll show up here.</p></div>
  }

  return (
    <div className="movie-grid">
      {favorites.map((movie) => (
        <MovieItem
          key={movie.imdbID}
          movie={movie}
          favorite
          onSelect={() => onSelect(movie)}
          onToggleFavorite={() => onRemove(movie)}
        />
      ))}
    </div>
  )
}

export default FavoritesList
