import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Search as SearchIcon, Sparkles } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";
import { API_BASE, API_CONFIGURED, demoAnime, normalizeAnime } from "@/lib/api";

async function liveRequest(path: string, params: Record<string, string>) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url.toString(), { headers: { Accept: "application/json" }, cache: "no-store" });
  const body = await response.json();
  if (!response.ok || body?.success === false) throw new Error(body?.error || `API request failed (${response.status})`);
  return body?.data ?? body;
}

export default function Search() {
  const [location] = useLocation();
  const query = new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] || "").get("q") || "";
  const [items, setItems] = useState(API_CONFIGURED ? [] : demoAnime);
  const [loading, setLoading] = useState(API_CONFIGURED);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query && API_CONFIGURED) {
      setLoading(true);
      liveRequest("/home", { provider: "animesalt" })
        .then((data) => { const sourceData = data?.data ?? data ?? {}; const source = ["newestDrops", "newAnimeArrivals", "mostWatchedShows", "animeMovies", "mostWatchedFilms", "cartoonSeries", "cartoonFilms"].flatMap((key) => Array.isArray(sourceData[key]) ? sourceData[key] : []); const seen = new Set<string>(); const unique = source.filter((item: any) => item?.id && !seen.has(String(item.id)) && seen.add(String(item.id))); setItems(unique.map((item: any) => normalizeAnime(item))); setError(""); })
      .catch((reason) => { setItems([]); setError(reason instanceof Error ? reason.message : "Browse unavailable"); })
        .finally(() => setLoading(false));
      return;
    }
    if (!query) { setItems(demoAnime); setLoading(false); return; }
    if (!API_CONFIGURED) { setItems(demoAnime.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase()))); return; }
    setLoading(true);
    liveRequest("/search", { q: query, provider: "animesalt" })
      .then((data) => { const source = Array.isArray(data) ? data : data?.items ?? data?.results ?? data?.animes ?? data?.data?.items ?? []; setItems(source.map(normalizeAnime)); setError(""); })
      .catch((reason) => { setItems([]); setError(reason instanceof Error ? reason.message : "Search unavailable"); })
      .finally(() => setLoading(false));
  }, [query]);

  return <div className="container min-h-[75vh] py-12 sm:py-16"><div className="mb-12 flex flex-col justify-between gap-6 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end"><div><Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45 transition hover:text-[#e5ff6d]"><ArrowLeft size={14} /> Back home</Link><p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e5ff6d]"><Sparkles size={13} /> The full catalog</p><h1 className="font-display text-4xl font-bold tracking-[-0.06em] text-white sm:text-6xl">{query ? <>Results for <span className="text-white/45">“{query}”</span></> : "Browse anime"}</h1></div><div className="flex items-center gap-2 text-sm text-white/40"><SearchIcon size={16} /> {loading ? "Loading..." : `${items.length} titles`}</div></div>{error ? <p className="mb-6 rounded-xl border border-[#ff6b55]/20 bg-[#ff6b55]/10 p-4 text-sm text-[#ffb0a3]">Live catalog unavailable — the provider did not return results.</p> : null}{loading ? <div className="flex items-center gap-3 py-20 text-white/55"><Loader2 size={20} className="animate-spin text-[#e5ff6d]" /> Loading the Renime catalog...</div> : items.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-5 xl:grid-cols-6">{items.map((anime: any, index: number) => <AnimeCard key={`${anime.id}-${index}`} anime={anime} />)}</div> : <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center"><p className="font-display text-2xl font-bold text-white">{error ? "No live results yet" : "Search any world"}</p><p className="mt-2 text-sm text-white/45">{error ? "Fix the API provider, then search again." : "Try “Naruto”, “Demon Slayer” or “One Piece”."}</p></div>}</div>;
}
