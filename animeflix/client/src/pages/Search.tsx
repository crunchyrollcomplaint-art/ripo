import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Search as SearchIcon, Sparkles } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";
import { API_CONFIGURED, demoAnime, fetchApi, listFrom, normalizeAnime } from "@/lib/api";

export default function Search() {
  const [location] = useLocation();
  const query = new URLSearchParams(location.split("?")[1] || "").get("q") || "";
  const [items, setItems] = useState(API_CONFIGURED ? [] : demoAnime);
  const [loading, setLoading] = useState(Boolean(query && API_CONFIGURED));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) { setItems(API_CONFIGURED ? [] : demoAnime); return; }
    if (!API_CONFIGURED) { setItems(demoAnime.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase()))); return; }
    setLoading(true);
    fetchApi<any>("/search", { q: query, provider: localStorage.getItem("animeflix-provider") || "animesalt" })
      .then((data) => { setItems(listFrom(data).map(normalizeAnime)); setError(""); })
      .catch((reason) => { setItems([]); setError(reason instanceof Error ? reason.message : "Search unavailable"); })
      .finally(() => setLoading(false));
  }, [query]);

  return <div className="container min-h-[75vh] py-12 sm:py-16"><div className="mb-12 flex flex-col justify-between gap-6 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end"><div><Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45 transition hover:text-[#e5ff6d]"><ArrowLeft size={14} /> Back home</Link><p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e5ff6d]"><Sparkles size={13} /> The full catalog</p><h1 className="font-display text-4xl font-bold tracking-[-0.06em] text-white sm:text-6xl">{query ? <>Results for <span className="text-white/45">“{query}”</span></> : "Browse anime"}</h1></div><div className="flex items-center gap-2 text-sm text-white/40"><SearchIcon size={16} /> {loading ? "Searching..." : `${items.length} titles`}</div></div>{error ? <p className="mb-6 rounded-xl border border-[#ff6b55]/20 bg-[#ff6b55]/10 p-4 text-sm text-[#ffb0a3]">Live search unavailable — the API provider did not return results.</p> : null}{loading ? <div className="flex items-center gap-3 py-20 text-white/55"><Loader2 size={20} className="animate-spin text-[#e5ff6d]" /> Searching the Renime catalog...</div> : items.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-5 xl:grid-cols-6">{items.map((anime: any, index: number) => <AnimeCard key={`${anime.id}-${index}`} anime={anime} />)}</div> : <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center"><p className="font-display text-2xl font-bold text-white">{error ? "No live results yet" : "Search any world"}</p><p className="mt-2 text-sm text-white/45">{error ? "Fix the API provider, then search again." : "Try “Naruto”, “Demon Slayer” or “One Piece”."}</p></div>}</div>;
}
