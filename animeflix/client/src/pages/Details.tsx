import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CalendarDays, ChevronDown, Clock3, Languages, Loader2, Play, Plus, Sparkles } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";
import { API_CONFIGURED, art, demoAnime, fetchApi, listFrom, normalizeAnime, normalizeEpisode, type Anime, type Episode } from "@/lib/api";

export default function Details() {
  const [location] = useLocation();
  const id = decodeURIComponent(location.split("/anime/")[1]?.split("?")[0] || "");
  const [anime, setAnime] = useState<Anime | null>(null);
  const [recommended, setRecommended] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seasons, setSeasons] = useState<string[]>(["1"]);
  const [season, setSeason] = useState("1");
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    if (!API_CONFIGURED) {
      const found = demoAnime.find((item) => item.id === id) || demoAnime[0];
      setAnime(found); setRecommended(demoAnime.filter((item) => item.id !== found.id).slice(0, 5));
      setSeasons(found.type === "movie" ? [] : ["1", "2"]); setLoading(false); return;
    }
    fetchApi<any>(`/info/${encodeURIComponent(id)}`, { provider: localStorage.getItem("animeflix-provider") || "animesalt" })
      .then((data) => { const normalized = normalizeAnime(data); setAnime(normalized); setRecommended(listFrom(data?.recommended).map(normalizeAnime)); const rawSeasons = data?.seasonsList || data?.seasons || []; setSeasons(rawSeasons.map(String)); setSeason(String(rawSeasons[0] || "1")); setEpisodes(listFrom(data?.episodesList).map(normalizeEpisode)); setError(""); })
      .catch((reason) => { setError(reason instanceof Error ? reason.message : "Details unavailable"); const found = demoAnime.find((item) => item.id === id) || demoAnime[0]; setAnime(found); setRecommended(demoAnime.filter((item) => item.id !== found.id).slice(0, 5)); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!API_CONFIGURED || !id || !seasons.length) return;
    setEpisodeLoading(true);
    fetchApi<any>(`/episodes/${encodeURIComponent(id)}/${season}`, { provider: localStorage.getItem("animeflix-provider") || "animesalt" })
      .then((data) => setEpisodes(listFrom(data?.episodes ?? data).map(normalizeEpisode)))
      .catch(() => setEpisodes([]))
      .finally(() => setEpisodeLoading(false));
  }, [id, season, seasons.length]);

  const isMovie = anime?.type === "movie" || seasons.length === 0;
  const backdrop = anime?.background || anime?.image || art(0);

  if (loading) return <div className="container flex min-h-[70vh] items-center justify-center gap-3 text-white/50"><Loader2 className="animate-spin text-[#e5ff6d]" size={21} /> Loading title universe...</div>;
  if (!anime) return <div className="container py-20 text-white">Title not found.</div>;

  return <div>
    <section className="relative min-h-[560px] overflow-hidden border-b border-white/[0.07] sm:min-h-[640px]"><img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" /><div className="absolute inset-0 bg-[linear-gradient(90deg,#090b11_0%,rgba(9,11,17,.92)_35%,rgba(9,11,17,.42)_72%,#090b11_100%),linear-gradient(0deg,#090b11_0%,transparent_55%)]" /><div className="container relative flex min-h-[560px] items-end pb-14 sm:min-h-[640px] sm:pb-20"><div className="max-w-3xl"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/50 transition hover:text-[#e5ff6d]"><ArrowLeft size={14} /> Back to browse</Link><div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#e5ff6d]"><span className="rounded-full border border-[#e5ff6d]/25 bg-[#e5ff6d]/10 px-3 py-1.5">{anime.type === "movie" ? "Movie" : "Series"}</span>{anime.year ? <span className="text-white/45">{anime.year}</span> : null}</div><h1 className="font-display text-5xl font-bold leading-[.95] tracking-[-0.08em] text-white sm:text-7xl">{anime.title}</h1><div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/55"><span className="flex items-center gap-1.5"><CalendarDays size={15} /> {anime.year || "New"}</span><span className="h-1 w-1 rounded-full bg-white/25" /><span className="flex items-center gap-1.5"><Clock3 size={15} /> {anime.duration || "24 min"}</span><span className="h-1 w-1 rounded-full bg-white/25" /><span className="flex items-center gap-1.5"><Languages size={15} /> {(anime.languages || ["Hindi", "English"]).join(" · ")}</span></div><p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">{anime.description || "A new story begins here. Explore seasons, episodes and alternate servers for this title."}</p><div className="mt-7 flex flex-wrap gap-3"><a href={isMovie ? `#episodes` : `#episodes`} className="flex items-center gap-2 rounded-full bg-[#e5ff6d] px-5 py-3 text-sm font-extrabold text-[#11150d] transition hover:bg-[#f0ff9b]"><Play size={16} fill="currentColor" /> {isMovie ? "Watch movie" : "View episodes"}</a><button className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"><Plus size={16} /> My list</button></div><div className="mt-6 flex flex-wrap gap-2">{(anime.genres || ["Action", "Adventure", "Fantasy"]).slice(0, 4).map((genre) => <span key={genre} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/50">{genre}</span>)}</div></div></div></section>
    <div className="container space-y-16 py-14 sm:py-20">
      {error ? <p className="rounded-xl border border-[#ff6b55]/20 bg-[#ff6b55]/10 p-4 text-sm text-[#ffb0a3]">Live details unavailable — showing a resilient preview state.</p> : null}
      {!isMovie ? <section id="episodes"><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e5ff6d]">Choose your chapter</p><h2 className="font-display text-3xl font-bold tracking-[-0.05em] text-white">Episodes</h2></div><label className="flex items-center gap-2 text-xs font-bold text-white/40">SEASON <span className="relative"><select value={season} onChange={(event) => setSeason(event.target.value)} className="appearance-none rounded-lg border border-white/10 bg-white/[0.06] py-2 pl-3 pr-8 text-sm font-bold text-white outline-none"><option value="1" className="bg-[#151821]">Season 1</option>{seasons.filter((item) => item !== "1").map((item) => <option key={item} value={item} className="bg-[#151821]">Season {item}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/50" /></span></label></div>{episodeLoading ? <div className="flex items-center gap-2 py-8 text-sm text-white/45"><Loader2 size={17} className="animate-spin text-[#e5ff6d]" /> Loading episodes...</div> : episodes.length ? <div className="grid gap-3">{episodes.map((episode, index) => <Link href={`/watch/${encodeURIComponent(episode.id)}?title=${encodeURIComponent(anime.title)}`} key={`${episode.id}-${index}`} className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 transition hover:border-[#e5ff6d]/30 hover:bg-white/[0.06] sm:p-4"><span className="w-7 text-center font-display text-lg font-bold text-white/25 group-hover:text-[#e5ff6d]">{episode.episode}</span><img src={episode.image} alt="" className="h-16 w-24 rounded-xl object-cover opacity-80 sm:h-20 sm:w-32" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-white/85 group-hover:text-white">{episode.title}</span><span className="mt-1 block text-xs text-white/40">Season {episode.season} · Episode {episode.episode}</span></span><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-white/60 transition group-hover:bg-[#e5ff6d] group-hover:text-[#11150d]"><Play size={15} fill="currentColor" /></span></Link>)}</div> : <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center text-sm text-white/45">Episodes will appear here once the provider returns a season list.</div>}</section> : null}
      {recommended.length ? <section><div className="mb-6 flex items-end justify-between"><div><p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e5ff6d]"><Sparkles size={13} /> More to explore</p><h2 className="font-display text-3xl font-bold tracking-[-0.05em] text-white">You may also like</h2></div></div><div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">{recommended.map((item, index) => <AnimeCard key={`${item.id}-${index}`} anime={item} />)}</div></section> : null}
    </div>
  </div>;
}
