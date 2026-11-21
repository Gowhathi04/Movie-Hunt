import { useEffect, useMemo, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import MovieList from './components/MovieList.jsx'
import MovieFilters from './components/MovieFilters.jsx'
import MovieDetails from './components/MovieDetails.jsx'
import FavoritesList from './components/FavoritesList.jsx'
import './App.css'

const FAVORITES_KEY = 'reelgood-favorites'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const apiUrl = (path) => `${API_BASE_URL}${path}`

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('The movie API returned a web page instead of JSON. Run the app with npm run dev or npm start.')
  }
  return response.json()
}

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function MovieHuntMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span>MH</span>
    </span>
  )
}

function App() {
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []))
  const [featuredMovies, setFeaturedMovies] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState('')
  const [movies, setMovies] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [activeView, setActiveView] = useState('discover')
  const [sortBy, setSortBy] = useState('rating')
  const [genre, setGenre] = useState('')
  const [language, setLanguage] = useState('')
  const [year, setYear] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadFeaturedMovies = async () => {
      try {
        const response = await fetch(apiUrl('/api/top-rated'))
        const data = await readApiResponse(response)
        if (!response.ok) throw new Error(data.error || 'Could not load top-rated movies.')
        if (!cancelled) setFeaturedMovies(data.Search || [])
      } catch (loadError) {
        if (!cancelled) setFeaturedError(loadError.message || 'Could not load top-rated movies.')
      } finally {
        if (!cancelled) setFeaturedLoading(false)
      }
    }

    loadFeaturedMovies()
    return () => { cancelled = true }
  }, [])

  const saveFavorites = (nextFavorites) => {
    setFavorites(nextFavorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites))
  }

  const searchMovies = async (term) => {
    const normalizedTerm = term.trim()
    setQuery(normalizedTerm)
    setError('')
    setHasSearched(true)
    setMovies([])

    if (!normalizedTerm) {
      setError('Enter a movie title to start your search.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(apiUrl(`/api/movies?q=${encodeURIComponent(normalizedTerm)}`))
      const data = await readApiResponse(response)
      if (!response.ok) {
        setError(data.error || 'Something went wrong while searching.')
        setMovies([])
        return
      }
      if (data.Response === 'False') {
        setError(data.Error === 'Movie not found!' ? '' : data.Error || 'Something went wrong while searching.')
        setMovies([])
        return
      }

      const searchResults = (data.Search || []).map((movie) => ({ ...movie, imdbRating: '' }))
      setMovies(searchResults)

      const ratedMovies = await Promise.all(searchResults.map(async (movie) => {
        try {
          const detailResponse = await fetch(apiUrl(`/api/movie?id=${encodeURIComponent(movie.imdbID)}`))
          const details = await readApiResponse(detailResponse)
          return details.Response === 'True'
            ? { ...movie, imdbRating: details.imdbRating || '', details }
            : movie
        } catch {
          return movie
        }
      }))
      setMovies(ratedMovies)
    } catch {
      setError('We couldn’t reach the movie service. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const openMovie = async (movie) => {
    setSelectedMovie(movie)
    if (movie.details) {
      setSelectedMovie(movie.details)
      return
    }
    setDetailsLoading(true)
    try {
      const response = await fetch(apiUrl(`/api/movie?id=${encodeURIComponent(movie.imdbID)}&plot=full`))
      const details = await readApiResponse(response)
      if (response.ok && details.Response === 'True') setSelectedMovie(details)
      else setError(details.Error || 'Could not load movie details.')
    } catch {
      setError('We couldn’t load the movie details. Please try again.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const toggleFavorite = (movie) => {
    const exists = favorites.some((favorite) => favorite.imdbID === movie.imdbID)
    saveFavorites(exists
      ? favorites.filter((favorite) => favorite.imdbID !== movie.imdbID)
      : [...favorites, movie])
  }

  const isFavorite = (movie) => favorites.some((favorite) => favorite.imdbID === movie.imdbID)

  const currentMovies = hasSearched ? movies : featuredMovies
  const movieFilters = useMemo(() => {
    const valuesFor = (field) => [...new Set(currentMovies.flatMap((movie) => {
      const details = movie.details || movie
      return String(details[field] || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    }))].sort((first, second) => first.localeCompare(second))

    return {
      genres: valuesFor('Genre'),
      languages: valuesFor('Language'),
      years: valuesFor('Year').sort((first, second) => Number(second) - Number(first)),
    }
  }, [currentMovies])

  const visibleMovies = useMemo(() => {
    const filtered = currentMovies.filter((movie) => {
      const details = movie.details || movie
      const matchesGenre = !genre || String(details.Genre || '').split(',').map((value) => value.trim()).includes(genre)
      const matchesLanguage = !language || String(details.Language || '').split(',').map((value) => value.trim()).includes(language)
      const matchesYear = !year || String(movie.Year || details.Year || '') === year
      return matchesGenre && matchesLanguage && matchesYear
    })

    return filtered.sort((first, second) => {
      if (sortBy === 'title-asc') return first.Title.localeCompare(second.Title)
      if (sortBy === 'title-desc') return second.Title.localeCompare(first.Title)
      return (Number.parseFloat(second.imdbRating) || 0) - (Number.parseFloat(first.imdbRating) || 0)
    })
  }, [currentMovies, genre, language, sortBy, year])

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setActiveView('discover')} aria-label="Movie Hunt home">
          <MovieHuntMark />
          <span>Movie <span>Hunt</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={activeView === 'discover' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveView('discover')}>Discover</button>
          <button className={activeView === 'favorites' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveView('favorites')}>
            My favorites <span className="nav-count">{favorites.length}</span>
          </button>
        </nav>
        <div className="topbar-note"><span className="status-dot" /> Your next favorite is out there</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT MOVIE NIGHT</p>
            <h1>Make tonight<br /><span>cinematic.</span></h1>
            <p className="hero-description">Big-screen stories, one click away. Find a new favorite and save what you want to watch next.</p>
            <a className="hero-cta" href="#movie-search" onClick={() => setActiveView('discover')}>
              Explore movies <span aria-hidden="true">→</span>
            </a>
            <p className="hero-caption">CURATED PICKS <span /> MADE FOR MOVIE NIGHT</p>
          </div>
          <div className="hero-art">
            <div className="art-glow" />
            {featuredMovies.slice(0, 3).map((movie, index) => (
              <button
                className={`hero-poster hero-poster-${index + 1}`}
                key={movie.imdbID}
                type="button"
                onClick={() => openMovie(movie)}
                aria-label={`View details for ${movie.Title}`}
              >
                {movie.Poster && movie.Poster !== 'N/A'
                  ? <img src={movie.Poster} alt="" />
                  : <span className="hero-poster-placeholder">{movie.Title}</span>}
                <span className="hero-poster-copy">
                  <span>{movie.Title}</span>
                  <span>{movie.Year}</span>
                </span>
                {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                  <span className="hero-poster-rating" aria-label={`Rating ${movie.imdbRating}`}>{movie.imdbRating}</span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="search-section" id="movie-search" aria-label="Movie search">
          <div className="section-heading">
            <div>
              <p className="eyebrow">START EXPLORING</p>
              <h2>{activeView === 'favorites' ? 'Your saved films' : 'What are you in the mood for?'}</h2>
            </div>
            {activeView === 'discover' && <span className="heading-note">Search by movie title</span>}
          </div>

          {activeView === 'discover' ? (
            <>
              <SearchBar onSearch={searchMovies} />
              {error && <p className="error-message" role="alert"><span>!</span>{error}</p>}
              <MovieFilters
                sortBy={sortBy}
                onSortByChange={setSortBy}
                genre={genre}
                onGenreChange={setGenre}
                language={language}
                onLanguageChange={setLanguage}
                year={year}
                onYearChange={setYear}
                {...movieFilters}
              />
              <div className="results-heading">
                <h3>{hasSearched ? `Results for “${query}”` : 'Featured movies'}</h3>
                <span>{visibleMovies.length} {visibleMovies.length === 1 ? 'film' : 'films'}</span>
              </div>
              {featuredError && !hasSearched && <p className="error-message" role="alert"><span>!</span>{featuredError}</p>}
              <MovieList
                movies={visibleMovies}
                favorites={favorites}
                loading={hasSearched ? loading : featuredLoading}
                hasSearched={true}
                query={query}
                error={hasSearched ? error : featuredError}
                emptyMessage={hasSearched ? 'No movies match your search and filters.' : 'Top-rated movies are not available right now.'}
                onSelect={openMovie}
                onToggleFavorite={toggleFavorite}
              />
            </>
          ) : (
            <FavoritesList
              favorites={favorites}
              onSelect={openMovie}
              onRemove={toggleFavorite}
            />
          )}
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#" onClick={() => setActiveView('discover')}>
          <MovieHuntMark /><span>Movie <span>Hunt</span></span>
        </a>
        <p>Made for movie nights and everything in between.</p>
      </footer>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          loading={detailsLoading}
          favorite={isFavorite(selectedMovie)}
          onClose={() => setSelectedMovie(null)}
          onToggleFavorite={() => toggleFavorite(selectedMovie)}
        />
      )}
    </div>
  )
}

export default App
