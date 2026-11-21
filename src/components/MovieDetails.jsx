function MovieDetails({ movie, loading, favorite, onClose, onToggleFavorite }) {
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : ''

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="movie-details-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close movie details">×</button>
        {poster
          ? <img className="details-poster" src={poster} alt={`${movie.Title} poster`} />
          : <div className="details-poster poster-placeholder" aria-hidden="true">✳</div>}
        <div className="details-copy">
          <p className="eyebrow">MOVIE DETAILS</p>
          <h2 id="movie-details-title">{movie.Title}</h2>
          <p className="detail-meta">
            <span>{movie.Year}</span><span>·</span><span>{movie.Runtime || 'Runtime unavailable'}</span>
            {movie.imdbRating && movie.imdbRating !== 'N/A' && <span className="detail-rating">★ {movie.imdbRating}</span>}
          </p>
          {loading
            ? <div className="loading-state"><div className="spinner" />Loading details…</div>
            : <>
              <p className="detail-plot">{movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No plot summary is available for this film.'}</p>
              <p className="detail-facts">
                {movie.Genre && movie.Genre !== 'N/A' && <><strong>Genre</strong> · {movie.Genre}<br /></>}
                {movie.Director && movie.Director !== 'N/A' && <><strong>Director</strong> · {movie.Director}<br /></>}
                {movie.Actors && movie.Actors !== 'N/A' && <><strong>Cast</strong> · {movie.Actors}</>}
              </p>
              <button className="modal-favorite" type="button" onClick={onToggleFavorite}>
                {favorite ? '♥  Remove from favorites' : '♡  Add to favorites'}
              </button>
            </>}
        </div>
      </section>
    </div>
  )
}

export default MovieDetails
