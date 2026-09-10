```tsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Play,
  Server as ServerIcon,
} from "lucide-react";
import { API_CONFIGURED, fetchApi, type Server } from "@/lib/api";

export default function Player() {
  const [location] = useLocation();

  const id = decodeURIComponent(
    location.split("/watch/")[1]?.split("?")[0] || ""
  );

  const title =
    new URLSearchParams(location.split("?")[1] || "").get("title") ||
    "Episode player";

  const [servers, setServers] = useState<Server[]>([]);
  const [active, setActive] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  /*
   * Strong ad/overlay cleanup for SAME-ORIGIN embeds.
   *
   * This cannot bypass browser same-origin security.
   * Therefore it only modifies iframe DOM when the iframe
   * belongs to the same origin as this website.
   */
  const blockAdsInsideIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc =
        iframe.contentDocument ||
        iframe.contentWindow?.document;

      if (!doc) return;

      // Aggressive but common ad/overlay selectors.
      const adSelectors = [
        // Generic ad classes / IDs
        ".ad",
        ".ads",
        ".advert",
        ".advertisement",
        ".advertising",
        ".ad-container",
        ".ad-wrapper",
        ".ad-banner",
        ".ad-overlay",
        ".ad-popup",
        ".adsbox",
        ".adsbygoogle",

        // Common naming patterns
        '[class*="advert"]',
        '[id*="advert"]',
        '[class*="ads-"]',
        '[id*="ads-"]',
        '[class*="ad-"]',
        '[id*="ad-"]',
        '[class*="-ad"]',
        '[id*="-ad"]',

        // Popup / overlay naming
        ".popup",
        ".pop-up",
        ".modal-ad",
        ".popup-ad",
        ".overlay-ad",
        ".video-ad",
        ".preroll",
        ".midroll",
        ".postroll",

        // Common external ad containers
        "ins.adsbygoogle",
        "iframe[src*=\"doubleclick\"]",
        "iframe[src*=\"googlesyndication\"]",
        "iframe[src*=\"adservice\"]",
        "iframe[src*=\"popads\"]",
        "iframe[src*=\"onclick\"]",
        "iframe[src*=\"exoclick\"]",
      ];

      const removeAds = () => {
        adSelectors.forEach((selector) => {
          try {
            doc.querySelectorAll(selector).forEach((element) => {
              element.remove();
            });
          } catch {
            // Ignore invalid/unsupported selectors.
          }
        });

        // Remove suspicious fixed/sticky elements that cover the player.
        doc.querySelectorAll<HTMLElement>("*").forEach((element) => {
          try {
            const style = iframe.contentWindow?.getComputedStyle(element);

            if (!style) return;

            const position = style.position;
            const zIndex = Number.parseInt(style.zIndex || "0", 10);

            if (
              (position === "fixed" || position === "sticky") &&
              zIndex >= 999
            ) {
              const text = (
                element.className?.toString() +
                " " +
                element.id
              ).toLowerCase();

              if (
                text.includes("ad") ||
                text.includes("popup") ||
                text.includes("overlay") ||
                text.includes("banner") ||
                text.includes("promo")
              ) {
                element.remove();
              }
            }
          } catch {
            // Ignore inaccessible/invalid elements.
          }
        });
      };

      // CSS-level hiding as an additional layer.
      const styleId = "__animeflix_adblock_css__";

      if (!doc.getElementById(styleId)) {
        const style = doc.createElement("style");
        style.id = styleId;

        style.textContent = `
          .ad,
          .ads,
          .advert,
          .advertisement,
          .advertising,
          .ad-container,
          .ad-wrapper,
          .ad-banner,
          .ad-overlay,
          .ad-popup,
          .adsbox,
          .adsbygoogle,
          [class*="advert"],
          [id*="advert"],
          [class*="ads-"],
          [id*="ads-"],
          [class*="ad-"],
          [id*="ad-"],
          [class*="-ad"],
          [id*="-ad"],
          .popup,
          .pop-up,
          .modal-ad,
          .popup-ad,
          .overlay-ad,
          .video-ad,
          .preroll,
          .midroll,
          .postroll,
          iframe[src*="doubleclick"],
          iframe[src*="googlesyndication"],
          iframe[src*="adservice"],
          iframe[src*="popads"],
          iframe[src*="onclick"],
          iframe[src*="exoclick"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;

        doc.head?.appendChild(style);
      }

      // First cleanup.
      removeAds();

      // Keep watching for dynamically inserted ads.
      const observer = new MutationObserver(() => {
        removeAds();
      });

      observer.observe(doc.documentElement, {
        childList: true,
        subtree: true,
      });

      // Extra cleanup for ads injected shortly after player load.
      const intervals = [
        window.setTimeout(removeAds, 500),
        window.setTimeout(removeAds, 1500),
        window.setTimeout(removeAds, 3000),
        window.setTimeout(removeAds, 5000),
        window.setTimeout(removeAds, 10000),
      ];

      // Store cleanup on iframe element.
      (
        iframe as HTMLIFrameElement & {
          __animeflixCleanup?: () => void;
        }
      ).__animeflixCleanup = () => {
        observer.disconnect();
        intervals.forEach((timer) => window.clearTimeout(timer));
      };
    } catch {
      /*
       * Cross-origin iframe:
       * Browser will prevent access to contentDocument.
       * The external player remains untouched.
       */
    }
  };

  const handleIframeLoad = () => {
    blockAdsInsideIframe();
  };

  useEffect(() => {
    if (!API_CONFIGURED) {
      setLoading(false);
      return;
    }

    fetchApi<any>(`/embed/${encodeURIComponent(id)}`, {
      provider:
        localStorage.getItem("animeflix-provider") || "animesalt",
    })
      .then((data) => {
        const list = Array.isArray(data?.servers)
          ? data.servers
          : [];

        setServers(list);
        setActive(list[0] || null);
      })
      .catch(() => setServers([]))
      .finally(() => setLoading(false));
  }, [id]);

  // Cleanup previous iframe observer when server changes/unmounts.
  useEffect(() => {
    return () => {
      const iframe = iframeRef.current;

      if (iframe) {
        const cleanup = (
          iframe as HTMLIFrameElement & {
            __animeflixCleanup?: () => void;
          }
        ).__animeflixCleanup;

        cleanup?.();
      }
    };
  }, [active?.url]);

  return (
    <div className="container min-h-[75vh] py-8 sm:py-12">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href={`/anime/${encodeURIComponent(
              id.split("-").slice(0, -1).join("-") || id
            )}`}
            className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45 transition hover:text-[#e5ff6d]"
          >
            <ArrowLeft size={14} />
            Back to title
          </Link>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#e5ff6d]/25 bg-[#e5ff6d]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#e5ff6d]">
              Now playing
            </span>

            <span className="text-xs text-white/35">
              AnimeFlix player
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Select an available authorized source.
          </p>
        </div>

        {servers.length ? (
          <div className="flex flex-wrap gap-2">
            {servers.map((server, index) => (
              <button
                key={`${server.url}-${index}`}
                onClick={() => setActive(server)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                  active?.url === server.url
                    ? "border-[#e5ff6d] bg-[#e5ff6d] text-[#11150d]"
                    : "border-white/10 bg-white/[0.05] text-white/65 hover:border-white/25 hover:text-white"
                }`}
              >
                <ServerIcon size={13} />
                {server.name || `Server ${index + 1}`}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-black shadow-[0_24px_90px_rgba(0,0,0,.45)] ring-1 ring-white/[0.03]">
        <div className="relative aspect-video min-h-[260px] w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-3 text-sm text-white/50">
              <Loader2
                className="animate-spin text-[#e5ff6d]"
                size={20}
              />
              Finding authorized embeds...
            </div>
          ) : active?.url ? (
            <iframe
              ref={iframeRef}
              key={active.url}
              title={`${title} player`}
              src={active.url}
              onLoad={handleIframeLoad}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e5ff6d]/10 text-[#e5ff6d]">
                <Play size={22} />
              </div>

              <h2 className="font-display text-xl font-bold text-white">
                No embed available
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
                The provider did not return an authorized player for this
                episode. Try another provider or come back later.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-white/50">
        <AlertTriangle
          size={16}
          className="mt-0.5 shrink-0 text-[#e5ff6d]"
        />

        <p>
          Player source is supplied by the configured provider.{" "}
          <a
            href="https://github.com/itzzzDark/Renime-API"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#e5ff6d]"
          >
            API docs
            <ExternalLink size={11} />
          </a>
        </p>
      </div>
    </div>
  );
}
```
