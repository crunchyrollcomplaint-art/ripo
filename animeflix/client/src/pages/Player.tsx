import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertTriangle, ArrowLeft, ExternalLink, Expand, FastForward, Loader2, Pause, Play, Rewind, Server as ServerIcon, Settings, Volume2 } from "lucide-react";
import { API_CONFIGURED, fetchApi, type Server } from "@/lib/api";

export default function Player() {
  const [location] = useLocation();
  const id = decodeURIComponent(location.split("/watch/")[1]?.split("?")[0] || "");
  const title = new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] || "").get("title") || "Episode player";
  const [servers, setServers] = useState<Server[]>([]);
  const [active, setActive] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUi, setShowUi] = useState(true);
  const [pausedUi, setPausedUi] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!API_CONFIGURED) { setLoading(false); return; }
    fetchApi<any>(`/embed/${encodeURIComponent(id)}`, { provider: localStorage.getItem("animeflix-provider") || "animesalt" })
      .then((data) => { const list = Array.isArray(data?.servers) ? data.servers : []; setServers(list); setActive(list[0] || null); })
      .catch(() => setServers([]))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const reset = () => {
      setShowUi(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => { if (!pausedUi) setShowUi(false); }, 4500);
    };
    reset();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [active, pausedUi]);

  const toggleUi = () => {
    setShowUi((value) => !value);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const fullscreen = () => {
    const element = frameRef.current?.parentElement?.parentElement;
    if (element && !document.fullscreenElement) element.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return <div className="container min-h-[75vh] py-8 sm:py-12">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><Link href={`/anime/${encodeURIComponent(id.split("-").slice(0, -1).join("-") || id)}`} className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45 transition hover:text-[#e5ff6d]"><ArrowLeft size={14} /> Back to title</Link><h1 className="font-display text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">{title}</h1><p className="mt-2 text-sm text-white/40">Cinema player · select an available source.</p></div>
      {servers.length ? <div className="flex flex-wrap gap-2">{servers.map((server, index) => <button key={`${server.url}-${index}`} onClick={() => setActive(server)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${active?.url === server.url ? "border-[#e5ff6d] bg-[#e5ff6d] text-[#11150d]" : "border-white/10 bg-white/[0.05] text-white/65 hover:border-white/25 hover:text-white"}`}><ServerIcon size={13} />{server.name || `Server ${index + 1}`}</button>)}</div> : null}
    </div>

    <div className={`cinema-player relative overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-black shadow-[0_24px_90px_rgba(0,0,0,.55)] ${showUi || pausedUi ? "show-ui" : ""}`} onMouseMove={() => setShowUi(true)} onClick={toggleUi}>
      <div className="relative aspect-video min-h-[260px] w-full bg-black">
        {loading ? <div className="flex h-full items-center justify-center gap-3 text-sm text-white/50"><Loader2 className="animate-spin text-[#e5ff6d]" size={20} /> Finding authorized embeds...</div> : active?.url ? <iframe ref={frameRef} title={`${title} player`} src={active.url} className="pointer-events-auto h-full w-full border-0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation" allowFullScreen /> : <div className="flex h-full flex-col items-center justify-center px-6 text-center"><Play className="mb-4 text-[#e5ff6d]" size={32} /><h2 className="font-display text-xl font-bold text-white">No embed available</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/45">The provider did not return an authorized player for this episode.</p></div>}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95 opacity-0 transition-opacity duration-200 [.show-ui_&]:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 opacity-0 transition-all duration-200 [.show-ui_&]:opacity-100 sm:p-6"><div className="flex min-w-0 items-center gap-3"><Link onClick={(event) => event.stopPropagation()} href={`/anime/${encodeURIComponent(id.split("-").slice(0, -1).join("-") || id)}`} className="pointer-events-auto grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-white/20"><ArrowLeft size={18} /></Link><div className="min-w-0"><p className="truncate text-sm font-bold text-white drop-shadow-lg">{title}</p><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">AnimeFlix cinema</p></div></div><div className="flex items-center gap-1"><span className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/75 backdrop-blur-md">External source</span></div></div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 [.show-ui_&]:opacity-100"><div className="flex items-center gap-7 rounded-full bg-black/30 px-5 py-3 backdrop-blur-sm"><button className="pointer-events-auto text-white/90 transition hover:scale-110" title="Rewind control is provided by the external player"><Rewind size={28} /></button><button className="pointer-events-auto grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105" title="Use the external player controls"><Play className="ml-1" size={28} fill="currentColor" /></button><button className="pointer-events-auto text-white/90 transition hover:scale-110" title="Forward control is provided by the external player"><FastForward size={28} /></button></div></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-2 p-4 opacity-0 transition-all duration-200 [.show-ui_&]:opacity-100 sm:p-6"><div className="h-1 rounded-full bg-white/25"><div className="h-full w-1/3 rounded-full bg-white shadow-[0_0_10px_white]" /></div><div className="flex items-center justify-between"><div className="flex items-center gap-1"><button className="pointer-events-auto grid h-8 w-8 place-items-center rounded-lg text-white hover:bg-white/15" title="External player controls"><Pause size={18} /></button><button className="pointer-events-auto grid h-8 w-8 place-items-center rounded-lg text-white hover:bg-white/15"><Volume2 size={18} /></button><span className="ml-2 text-[11px] font-mono text-white/70">External player</span></div><div className="flex items-center gap-1"><button className="pointer-events-auto grid h-8 w-8 place-items-center rounded-lg text-white hover:bg-white/15"><Settings size={17} /></button><button onClick={(event) => { event.stopPropagation(); fullscreen(); }} className="pointer-events-auto grid h-8 w-8 place-items-center rounded-lg text-white hover:bg-white/15" title="Fullscreen"><Expand size={18} /></button></div></div></div>
      </div>
    </div>
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-white/50"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#e5ff6d]" /><p>This is the provided cinema UI around the external player. Playback, seeking, audio and quality controls remain controlled by the provider iframe. <a href="https://github.com/itzzzDark/Renime-API" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#e5ff6d]">API docs <ExternalLink size={11} /></a></p></div>
  </div>;
}
