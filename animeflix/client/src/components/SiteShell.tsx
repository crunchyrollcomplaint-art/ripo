import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Compass, Menu, Search, X } from "lucide-react";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const urlQuery = new URLSearchParams(location.split("?")[1] || "").get("q");
    setQuery(urlQuery || "");
    setMobileOpen(false);
  }, [location]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    setLocation(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  }

  return (
    <div className="min-h-screen bg-[#090b11] text-[#f3f5ee]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#090b11]/80 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between gap-5">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 outline-none">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5ff6d] text-lg font-black text-[#11150d] shadow-[0_0_26px_rgba(229,255,109,.22)]">A</span>
            <span className="font-display text-xl font-bold tracking-[-0.06em] text-white">anime<span className="text-[#e5ff6d]">flix</span></span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/50 md:flex">
            <Link href="/" className={location === "/" ? "text-white" : "transition hover:text-white"}>Home</Link>
            <Link href="/search" className={location.startsWith("/search") ? "text-white" : "transition hover:text-white"}>Browse</Link>
            <a href="#collections" className="transition hover:text-white">Collections</a>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <form onSubmit={submit} className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3.5 py-2 transition focus-within:border-[#e5ff6d]/60 focus-within:bg-white/[0.08] sm:flex">
              <Search size={16} className="text-white/45" />
              <input aria-label="Search anime" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles..." className="w-32 bg-transparent text-sm text-white outline-none placeholder:text-white/35 md:w-44" />
            </form>
            <Link href="/search" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white/70 transition hover:border-white/20 hover:text-white sm:hidden"><Search size={17} /></Link>
            <button aria-label="Toggle menu" onClick={() => setMobileOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white/70 transition hover:text-white md:hidden">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
            <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#222733] text-xs font-bold text-[#e5ff6d] sm:flex">AF</span>
          </div>
        </div>
        {mobileOpen ? <div className="container border-t border-white/[0.06] py-4 md:hidden"><form onSubmit={submit} className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3.5 py-3"><Search size={16} className="text-white/45" /><input autoFocus aria-label="Search anime" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anime..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35" /></form><div className="flex gap-6 text-sm font-semibold text-white/60"><Link href="/">Home</Link><Link href="/search">Browse</Link><a href="#collections" onClick={() => setMobileOpen(false)}>Collections</a></div></div> : null}
      </header>
      <main className="pt-[72px]">{children}</main>
      <footer className="container flex flex-col gap-3 border-t border-white/[0.07] py-10 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 AnimeFlix. A discovery interface for anime fans.</p><p className="flex items-center gap-2"><Compass size={14} className="text-[#e5ff6d]" /> Powered by Renime API</p></footer>
    </div>
  );
}
