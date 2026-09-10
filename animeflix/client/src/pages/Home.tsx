import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, Info, Loader2, Play, SlidersHorizontal } from "lucide-react";
import { AnimeRow } from "@/components/AnimeCard";
import { API_CONFIGURED, API_BASE, demoHome, fetchApi, getConfiguredApiMessage, normalizeHome, type Anime } from "@/lib/api";

export default function Home() {
  const [home, setHome] = useState<any>(demoHome);
  const [loading, setLoading] = useState(API_CONFIGURED);
  const [provider, setProvider] = useState("animesalt");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("animeflix-provider");
    if (saved) setProvider(saved);
  }, []);

  useEffect(() => {
    if (!API_CONFIGURED) return;
    setLoading(true);
    fetchApi<any>("/home", { provider })
      .then((data) => { setHome(normalizeHome(data)); setError(""); })
      .catch((reason) => { setHome(demoHome); setError(reason instanceof Error ? reason.message : "Live API unavailable"); })
      .finally(() => setLoading(false));
  }, [provider]);

  const hero = useMemo<Anime>(() => home.newestDrops?.[0] || demoHome.newestDrops[0], [home]);
  const newest = home.newestDrops || [];

  function changeProvider(value: string) {
    setProvider(value);
    localStorage.setItem("animeflix-provider", value);
  }

  return (
    <div>
      <section className="grain relative isolate min-h-[580px] overflow-hidden border-b border-white/[0.06] sm:min-h-[650px]">
        <img src={hero.background || hero.image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-70" />
        <div className="hero-mask absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_30%,rgba(229,255,109,.12),transparent_26%)]" />
        <div className="container relative flex min-h-[580px] items-end pb-16 pt-20 sm:min-h-[650px] sm:pb-24">
          <div className="rise-in max-w-2xl">
            <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e5ff6d]"><span className="rounded-full border border-[#e5ff6d]/30 bg-[#e5ff6d]/10 px-3 py-1.5">Featured drop</span><span className="text-white/45">{hero.type === "movie" ? "Movie" : "Series"}</span></div>
            <h1 className="max-w-xl font-display text-5xl font-bold leading-[.95] tracking-[-0.08em] text-white sm:text-7xl">{hero.title}</h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/60 sm:text-base">A universe of stories is waiting. Find your next obsession across fresh drops, classics, movies and fan-favorite series.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3"><Link href={`/anime/${encodeURIComponent(hero.id)}`} className="flex items-center gap-2 rounded-full bg-[#e5ff6d] px-5 py-3 text-sm font-extrabold text-[#11150d] transition hover:bg-[#f0ff9b]"><Play size={16} fill="currentColor" /> Start watching</Link><Link href={`/anime/${encodeURIComponent(hero.id)}`} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"><Info size={16} /> More info</Link></div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-white/50"><span className="font-bold text-white/75">{hero.year || "2026"}</span><span className="h-1 w-1 rounded-full bg-white/25" /><span>{hero.season || "Season 1"}</span><span className="h-1 w-1 rounded-full bg-white/25" /><span>{hero.episodes || "12 episodes"}</span><span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white/70">HD</span></div>
          </div>
        </div>
      </section>

      <div className="container relative -mt-7 z-10"><div className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5ff6d]/10 text-[#e5ff6d]"><SlidersHorizontal size={17} /></span><div><p className="text-sm font-bold text-white">Your catalog, your provider</p><p className="text-xs text-white/40">{loading ? "Syncing the live catalog..." : error ? "Showing the resilient demo catalog" : getConfiguredApiMessage()}</p></div></div><label className="flex items-center gap-2 text-xs font-bold text-white/45">SOURCE <span className="relative"><select value={provider} onChange={(event) => changeProvider(event.target.value)} className="appearance-none rounded-lg border border-white/10 bg-white/[0.06] py-2 pl-3 pr-8 text-xs font-bold text-white outline-none"><option value="animesalt" className="bg-[#151821]">AnimeSalt</option><option value="watchanimeworld" className="bg-[#151821]">WatchAnimeWorld</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/50" /></span></label></div></div>

      <div id="collections" className="container space-y-14 py-16 sm:space-y-20 sm:py-24">
        {loading ? <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/55"><Loader2 size={18} className="animate-spin text-[#e5ff6d]" /> Pulling fresh titles from Renime...</div> : null}
        <AnimeRow title="Trending now" eyebrow="The conversation starter" items={home.mostWatchedShows || newest} ranked />
        <AnimeRow title="Fresh from the source" eyebrow="Newly added" items={newest} />
        <AnimeRow title="Latest anime arrivals" items={home.newAnimeArrivals || []} />
        <AnimeRow title="Movies for tonight" eyebrow="One sitting, all feeling" items={[...(home.animeMovies || []), ...(home.mostWatchedFilms || [])]} />
        <AnimeRow title="Animated worlds" items={[...(home.cartoonSeries || []), ...(home.cartoonFilms || [])]} />
        <div className="flex justify-center pt-2"><Link href="/search" className="group flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-[#e5ff6d]">Explore the full catalog <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link></div>
      </div>
    </div>
  );
}
