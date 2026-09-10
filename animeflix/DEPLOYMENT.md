# AnimeFlix deployment

## 1. Deploy the Renime API

From the Renime API repository, run `npm install`, then deploy the repository to Vercel as a Node project. Its API root is the deployed URL plus `/api`, for example `https://your-renime-api.vercel.app/api`. Configure `CORS_ORIGIN` in the API project to include the AnimeFlix domain (or `*` for development). The API repository documents the `/api/home`, `/api/search`, `/api/info/:id`, `/api/episodes/:id/:season`, `/api/embed/:id`, `/api/category/*`, and `/api/letter/*` routes.

## 2. Deploy this frontend

Import the `renime-animeflix` project into Vercel. The current build uses `pnpm build` and outputs `dist/public`. The included `vercel.json` rewrites client-side routes such as `/anime/...` and `/watch/...` to `index.html`.

In **Vercel → Project Settings → Environment Variables**, add:

```text
NEXT_PUBLIC_API_URL=https://your-renime-api.vercel.app/api
```

Use the real URL of your deployed Renime API. Redeploy after saving the variable. The app dynamically fetches the catalog and never imports 10,000 anime manually. For local development, place the same key in a local `.env.local` file (do not commit it).

## Notes

The UI also includes a resilient demo catalog when the API URL is not configured or the upstream provider is temporarily unavailable. The player only renders embed URLs returned by the configured API; it does not host video files. Check the copyright, provider terms, and applicable laws before publishing a public catalog/player.
