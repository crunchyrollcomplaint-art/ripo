# Verification notes

The production build passed with `pnpm check && pnpm build`. The preview was inspected at desktop and a 390×844 mobile viewport for `/`, `/search`, and `/anime/moonlit-requiem`. The dark hero, responsive header, provider selector, poster grid, detail metadata, and season selector render without layout errors. The app starts in a resilient demo state until `NEXT_PUBLIC_API_URL` is configured, then switches to live Renime API catalog loading.
