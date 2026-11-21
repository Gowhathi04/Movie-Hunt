function SearchBar({ onSearch }) {
  const submitSearch = (event) => {
    event.preventDefault()
    onSearch(event.currentTarget.elements.title.value)
  }

  return (
    <>
      <form className="search-form" onSubmit={submitSearch}>
        <svg className="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
          <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <input className="search-input" name="title" type="search" placeholder="Try “The Grand Budapest Hotel”" aria-label="Movie title" />
        <button className="search-button" type="submit">Search films <span aria-hidden="true">→</span></button>
      </form>
    </>
  )
}

export default SearchBar
