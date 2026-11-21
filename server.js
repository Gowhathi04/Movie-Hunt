import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'

const app = express()
const port = Number(process.env.PORT) || 3000
const omdbApiKey = process.env.OMDB_API_KEY
const frontendOrigin = process.env.FRONTEND_ORIGIN
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const topRatedMovieIds = [
  'tt0111161',
  'tt0068646',
  'tt0468569',
  'tt0108052',
  'tt0050083',
  'tt0167260',
  'tt0110912',
  'tt0109830',
  'tt0137523',
  'tt0120737',
]
let topRatedMoviesCache

app.use((req, res, next) => {
  const origin = req.get('Origin')
  const isAllowedOrigin = Boolean(frontendOrigin && origin === frontendOrigin)

  if (isAllowedOrigin) {
    res.set('Access-Control-Allow-Origin', frontendOrigin)
    res.vary('Origin')
  }

  if (req.method === 'OPTIONS') {
    if (!isAllowedOrigin) return res.sendStatus(403)
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    return res.sendStatus(204)
  }

  next()
})

async function fetchOmdb(params) {
  if (!omdbApiKey) {
    const error = new Error('OMDB_API_KEY is missing. Add it to the .env file in the project root and restart the server.')
    error.status = 500
    throw error
  }

  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', omdbApiKey)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  const response = await fetch(url)
  if (!response.ok) {
    const error = new Error(`OMDb returned HTTP ${response.status}`)
    error.status = 502
    throw error
  }
  return response.json()
}

app.get('/api/movies', async (req, res) => {
  const query = String(req.query.q || '').trim()
  if (!query) {
    return res.status(400).json({ error: 'Enter a movie title to search.' })
  }

  try {
    const data = await fetchOmdb({ s: query, type: 'movie' })
    res.json(data)
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message })
  }
})

app.get('/api/movie', async (req, res) => {
  const imdbId = String(req.query.id || '').trim()
  if (!/^tt\d+$/.test(imdbId)) {
    return res.status(400).json({ error: 'A valid IMDb ID is required.' })
  }

  try {
    const data = await fetchOmdb({
      i: imdbId,
      plot: req.query.plot === 'full' ? 'full' : 'short',
    })
    res.json(data)
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message })
  }
})

app.get('/api/top-rated', async (_req, res) => {
  try {
    if (!topRatedMoviesCache) {
      topRatedMoviesCache = Promise.all(
        topRatedMovieIds.map((id) => fetchOmdb({ i: id })),
      ).then((movies) => {
        const failedMovie = movies.find((movie) => movie.Response !== 'True')
        if (failedMovie) throw new Error(failedMovie.Error || 'Could not load top-rated movies.')

        return movies.sort((first, second) =>
          Number.parseFloat(second.imdbRating) - Number.parseFloat(first.imdbRating))
      }).catch((error) => {
        topRatedMoviesCache = undefined
        throw error
      })
    }

    res.json({ Search: await topRatedMoviesCache })
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message })
  }
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found.' })
    }
    if (req.method !== 'GET') return next()
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  })
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' })
  })
  app.use(vite.middlewares)
}

app.listen(port, () => {
  console.log(`Movie Hunt is running at http://localhost:${port}`)
})
