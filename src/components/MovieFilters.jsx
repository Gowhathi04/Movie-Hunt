function MovieFilters({
  sortBy,
  onSortByChange,
  genre,
  onGenreChange,
  language,
  onLanguageChange,
  year,
  onYearChange,
  genres,
  languages,
  years,
}) {
  return (
    <div className="movie-filters" aria-label="Filter movies">
      <label className="filter-control">
        <span>Sort</span>
        <select value={sortBy} onChange={(event) => onSortByChange(event.target.value)}>
          <option value="rating">Top rated</option>
          <option value="title-asc">Title: A-Z</option>
          <option value="title-desc">Title: Z-A</option>
        </select>
      </label>
      <label className="filter-control">
        <span>Genre</span>
        <select value={genre} onChange={(event) => onGenreChange(event.target.value)}>
          <option value="">All genres</option>
          {genres.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className="filter-control">
        <span>Language</span>
        <select value={language} onChange={(event) => onLanguageChange(event.target.value)}>
          <option value="">All languages</option>
          {languages.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className="filter-control">
        <span>Year</span>
        <select value={year} onChange={(event) => onYearChange(event.target.value)}>
          <option value="">All years</option>
          {years.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
    </div>
  )
}

export default MovieFilters
