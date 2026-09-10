import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertTriangle, ArrowLeft, ExternalLink, Loader2, Play, Server as ServerIcon } from "lucide-react";
import { API_CONFIGURED, fetchApi, type Server } from "@/lib/api";

export default function Player() {
  const [location] = useLocation();
  const id = decodeURIComponent(location.split("/watch/")[1]?.split("?")[0] || "");
  const title = new URLSearchParams(location.split("?")[1] || "").get("title") || "Episode player";
  const [servers, setServers] = useState<Server[]>([]);
  const [active, setActive] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!API_CONFIGURED) { setLoading(false); return; }
    fetchApi<any>(`/embed/${encodeURIComponent(id)}`, { provider: localStorage.getItem("animeflix-provider") || "animesalt" })
      .then((data) => { const list = Array.isArray(data?.servers) ? data.servers : []; setServers(list); setActive(list[0] || null); })
      .catch(() => setServers([]))
      .finally(() => setLoading(false));
  }, [id]);

  return <div className="container min-h-[75vh] py-8 sm:py-12"><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link href={`/anime/${encodeURIComponent(id.split("-").slice(0, -1).join("-") || id)}`} className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45 transition hover:text-[#e5ff6d]"><ArrowLeft size={14} /> Back to title</Link><div className="flex items-center gap-3"><span className="rounded-full border border-[#e5ff6d]/25 bg-[#e5ff6d]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#e5ff6d]">Now playing</span><span className="text-xs text-white/35">AnimeFlix player</span></div><h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">{title}</h1><p className="mt-2 text-sm text-white/40">Select an available authorized source.</p></div>{servers.length ? <div className="flex flex-wrap gap-2">{servers.map((server, index) => <button key={`${server.url}-${index}`} onClick={() => setActive(server)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${active?.url === server.url ? "border-[#e5ff6d] bg-[#e5ff6d] text-[#11150d]" : "border-white/10 bg-white/[0.05] text-white/65 hover:border-white/25 hover:text-white"}`}><ServerIcon size={13} />{server.name || `Server ${index + 1}`}</button>)}</div> : null}</div><div className="overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-black shadow-[0_24px_90px_rgba(0,0,0,.45)] ring-1 ring-white/[0.03]"><div className="relative aspect-video min-h-[260px] w-full">{loading ? <div className="flex h-full items-center justify-center gap-3 text-sm text-white/50"><Loader2 className="animate-spin text-[#e5ff6d]" size={20} /> Finding authorized embeds...</div> : active?.url ? <iframe title={`${title} player`} src={active.url} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : <div className="flex h-full flex-col items-center justify-center px-6 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e5ff6d]/10 text-[#e5ff6d]"><Play size={22} /></div><h2 className="font-display text-xl font-bold text-white">No embed available</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/45">The provider did not return an authorized player for this episode. Try another provider or come back later.</p></div>}</div></div><div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-white/50"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#e5ff6d]" /><p>Player source is supplied by the configured provider. Ads or provider notices may appear inside an external player and cannot be removed by AnimeFlix. <a href="https://github.com/itzzzDark/Renime-API" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#e5ff6d]">API docs <ExternalLink size={11} /></a></p></div></div>;
}
