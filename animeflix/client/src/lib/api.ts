export type Anime = {
  id: string;
  title: string;
  image: string;
  background?: string;
  type?: string;
  year?: string;
  season?: string;
  episodes?: string;
  rank?: number;
  description?: string;
  genres?: string[];
  languages?: string[];
  duration?: string;
};

export type Episode = {
  id: string;
  title: string;
  episode: string;
  season: string;
  image: string;
};

export type Server = { server?: number; name: string; url: string };

const env = import.meta.env as Record<string, string | undefined>;
export const API_BASE = (env.NEXT_PUBLIC_API_URL || env.VITE_API_URL || "https://your-renime-api.vercel.app/api").replace(/\/$/, "");
export const API_CONFIGURED = !API_BASE.includes("your-renime-api");

const fallbackArt = [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
];

export function art(index = 0) {
  return fallbackArt[index % fallbackArt.length];
}

export async function fetchApi<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(params || {}).forEach(([key, value]) => value !== undefined && value !== "" && url.searchParams.set(key, String(value)));
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body?.success === false) throw new Error(body?.error || `Request failed (${response.status})`);
    return (body?.data ?? body) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function normalizeAnime(raw: any, index = 0): Anime {
  const id = String(raw?.id ?? raw?.slug ?? raw?.postId ?? `catalog-${index}`);
  return {
    id,
    title: String(raw?.title ?? raw?.name ?? raw?.post_title ?? "Untitled anime"),
    image: String(raw?.image ?? raw?.poster ?? raw?.posterUrl ?? raw?.thumbnail ?? art(index)),
    background: raw?.background ?? raw?.backdrop ?? raw?.banner,
    type: raw?.type ?? "series",
    year: raw?.year ? String(raw.year) : undefined,
    season: raw?.season ? String(raw.season) : undefined,
    episodes: raw?.episodes ? String(raw.episodes) : undefined,
    rank: raw?.rank,
    description: raw?.description ?? raw?.synopsis,
    genres: Array.isArray(raw?.genres) ? raw.genres.map(String) : undefined,
    languages: Array.isArray(raw?.languages) ? raw.languages.map(String) : undefined,
    duration: raw?.duration ? String(raw.duration) : undefined,
  };
}

export function normalizeEpisode(raw: any, index = 0): Episode {
  return {
    id: String(raw?.id ?? raw?.slug ?? `episode-${index}`),
    title: String(raw?.title ?? raw?.name ?? `Episode ${raw?.episode ?? index + 1}`),
    episode: String(raw?.episode ?? index + 1),
    season: String(raw?.season ?? 1),
    image: String(raw?.image ?? raw?.thumbnail ?? art(index + 1)),
  };
}

export function listFrom(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  return payload?.items ?? payload?.results ?? payload?.animes ?? payload?.anime ?? payload?.shows ?? payload?.data ?? [];
}

export const demoAnime: Anime[] = [
  { id: "moonlit-requiem", title: "Moonlit Requiem", image: art(0), background: art(0), type: "series", year: "2026", season: "Season 1", episodes: "12" },
  { id: "the-last-orbit", title: "The Last Orbit", image: art(1), background: art(1), type: "series", year: "2025", season: "Season 2", episodes: "24" },
  { id: "neon-samurai", title: "Neon Samurai", image: art(2), background: art(2), type: "movie", year: "2024", episodes: "1" },
  { id: "paper-kingdom", title: "Paper Kingdom", image: art(3), background: art(3), type: "series", year: "2025", season: "Season 1", episodes: "10" },
  { id: "starfall-academy", title: "Starfall Academy", image: art(4), background: art(4), type: "series", year: "2026", season: "Season 1", episodes: "8" },
  { id: "echoes-of-kyoto", title: "Echoes of Kyoto", image: art(5), background: art(5), type: "series", year: "2023", season: "Season 1", episodes: "13" },
  { id: "wild-signal", title: "Wild Signal", image: art(2), type: "series", year: "2024", episodes: "12" },
  { id: "parallel-blue", title: "Parallel Blue", image: art(4), type: "series", year: "2025", episodes: "16" },
];

export const demoHome = {
  newestDrops: demoAnime.slice(0, 6),
  newAnimeArrivals: demoAnime.slice(2, 8),
  mostWatchedShows: demoAnime.slice(1, 7).map((anime, index) => ({ ...anime, rank: index + 1 })),
  animeMovies: demoAnime.filter((anime) => anime.type === "movie"),
  cartoonSeries: demoAnime.slice(3, 7),
  cartoonFilms: demoAnime.slice(0, 3),
};

export function normalizeHome(payload: any) {
  const source = payload?.data ?? payload ?? {};
  const keys = ["newestDrops", "newAnimeArrivals", "mostWatchedShows", "animeMovies", "cartoonSeries", "cartoonFilms", "mostWatchedFilms"];
  return Object.fromEntries(keys.map((key) => [key, listFrom(source[key]).map(normalizeAnime)]));
}

export function getConfiguredApiMessage() {
  return API_CONFIGURED ? `Connected to ${API_BASE}` : "Demo catalog active · add NEXT_PUBLIC_API_URL on Vercel to load the full live catalog";
}
