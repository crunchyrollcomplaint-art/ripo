import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Server as ServerIcon } from "lucide-react";
import { API_CONFIGURED, fetchApi, type Server } from "@/lib/api";

// The provider is cross-origin, so its DOM and network requests cannot be
// filtered by this app. Keep playback enabled while denying popup creation,
// top-level navigation, downloads, and form submissions.
const PLAYER_SANDBOX = "allow-scripts allow-same-origin allow-presentation";

export default function Player() {
  const [location] = useLocation();
  const id = decodeURIComponent(location.split("/watch/")[1]?.split("?")[0] || "");
  const title = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : location.split("?")[1] || "",
  ).get("title") || "Episode player";

  const [servers, setServers] = useState<Server[]>([]);
  const [active, setActive] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!API_CONFIGURED) {
      setLoading(false);
      return;
    }

    fetchApi<any>(`/embed/${encodeURIComponent(id)}`, {
      provider: localStorage.getItem("animeflix-provider") || "animesalt",
    })
      .then((data) => {
        const list = Array.isArray(data?.servers) ? data.servers : [];
        setServers(list);
        setActive(list[0] || null);
      })
      .catch(() => {
        setServers([]);
        setActive(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const animeId = id.split("-").slice(0, -1).join("-") || id;

  return (
    <main className="container min-h-[75vh] py-8 sm:py-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/anime/${encodeURIComponent(animeId)}`}
            className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/50 hover:text-[#e5ff6d]"
          >
            <ArrowLeft size={14} /> Back to title
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        </div>

        {servers.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {servers.map((server, index) => (
              <button
                key={`${server.url}-${index}`}
                type="button"
                onClick={() => setActive(server)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  active?.url === server.url
                    ? "border-[#e5ff6d] bg-[#e5ff6d] text-black"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                <ServerIcon size={14} />
                {server.name || `Server ${index + 1}`}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
        <div className="aspect-video min-h-[240px] w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-3 text-sm text-white/60">
              <Loader2 className="animate-spin text-[#e5ff6d]" size={20} />
              Loading original player...
            </div>
          ) : active?.url ? (
            <iframe
              title={`${title} original player`}
              src={active.url}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox={PLAYER_SANDBOX}
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/60">
              Original player is unavailable for this episode.
            </div>
          )}
        </div>
      </section>

      <p className="mt-4 text-xs text-white/40">
        Provider popups and popunders are blocked by the embedded player sandbox. Ads rendered inside the provider player
        itself require the provider to remove them or a server-side proxy.
      </p>
    </main>
  );
}
