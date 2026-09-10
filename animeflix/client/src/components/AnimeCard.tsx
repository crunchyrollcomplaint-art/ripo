import { Link } from "wouter";
import { Play, Plus, Star } from "lucide-react";
import type { Anime } from "@/lib/api";

export default function AnimeCard({ anime, ranked = false }: { anime: Anime; ranked?: boolean }) {
  return (
    <Link href={`/anime/${encodeURIComponent(anime.id)}`} className="group relative block min-w-0 outline-none">
      <article className="poster-card relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151821] shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-white/20 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.38)] group-focus-visible:ring-2 group-focus-visible:ring-[#e5ff6d]">
        <img src={anime.image} alt={anime.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b11] via-transparent to-black/5 opacity-85" />
        {ranked && anime.rank ? <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#e5ff6d] text-sm font-black text-[#10130c]">{anime.rank}</span> : null}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="mb-2 flex gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b0d12]"><Play size={15} fill="currentColor" /></span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur"><Plus size={16} /></span>
          </div>
          <p className="line-clamp-2 text-sm font-bold leading-tight text-white">{anime.title}</p>
        </div>
      </article>
      <div className="mt-3 flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-white/90 transition group-hover:text-[#e5ff6d]">{anime.title}</h3>
          <p className="mt-1 truncate text-xs text-white/45">{anime.year || "New release"} <span className="px-1 text-white/20">•</span> {anime.type === "movie" ? "Movie" : anime.season || "Series"}</p>
        </div>
        {anime.rank ? <span className="flex shrink-0 items-center gap-1 text-xs text-[#e5ff6d]"><Star size={12} fill="currentColor" /> 9.{anime.rank + 1}</span> : null}
      </div>
    </Link>
  );
}

export function AnimeRow({ title, eyebrow, items, ranked = false }: { title: string; eyebrow?: string; items: Anime[]; ranked?: boolean }) {
  if (!items.length) return null;
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow ? <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#e5ff6d]">{eyebrow}</p> : null}
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
        </div>
        <span className="hidden text-xs font-semibold text-white/35 sm:block">{items.length} titles <span className="px-1">→</span></span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((anime, index) => <AnimeCard key={`${anime.id}-${index}`} anime={anime} ranked={ranked} />)}
      </div>
    </section>
  );
}
