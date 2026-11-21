# Movie Hunt

This React app sends OMDb requests through the Express API, which keeps the API key server-side.

## Setup

1. Copy `.env.example` to `.env`.
2. Add your OMDb key to `.env`:

   ```text
   OMDB_API_KEY=your_omdb_api_key
   ```

3. Run the app:

   ```powershell
   npm install
   npm run dev
   ```

Open `http://localhost:3000`.

## Production

```powershell
npm run build
npm start
```

## Deploy to GitHub Pages

The GitHub Actions workflow builds the frontend at `https://gowhathi04.github.io/Movie-Hunt/`.
GitHub Pages hosts only static files, so movie search needs the Express API deployed separately.

1. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
2. Deploy the API to Render using the included `render.yaml` blueprint. Add `OMDB_API_KEY` as a secret environment variable in Render; do not put it in GitHub or the frontend.
3. In the Render service, set `FRONTEND_ORIGIN` to `https://gowhathi04.github.io`.
4. After the Render service is live, add a GitHub repository variable named `VITE_API_BASE_URL` with the service URL, for example `https://movie-hunt-api.onrender.com`.
5. Push to `main` or run the **Deploy to GitHub Pages** workflow manually.

The `.env` file is ignored by Git and should remain local. If `VITE_API_BASE_URL` is unset, the Pages site will load, but API-backed movie features will not work.
