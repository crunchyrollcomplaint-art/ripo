[1mdiff --git a/animeflix/client/src/pages/Player.tsx b/animeflix/client/src/pages/Player.tsx[m
[1mindex cf2dc26..57659dc 100644[m
[1m--- a/animeflix/client/src/pages/Player.tsx[m
[1m+++ b/animeflix/client/src/pages/Player.tsx[m
[36m@@ -3,6 +3,11 @@[m [mimport { Link, useLocation } from "wouter";[m
 import { ArrowLeft, Loader2, Server as ServerIcon } from "lucide-react";[m
 import { API_CONFIGURED, fetchApi, type Server } from "@/lib/api";[m
 [m
[32m+[m[32m// The provider is cross-origin, so its DOM and network requests cannot be[m
[32m+[m[32m// filtered by this app. Keep playback enabled while denying popup creation,[m
[32m+[m[32m// top-level navigation, downloads, and form submissions.[m
[32m+[m[32mconst PLAYER_SANDBOX = "allow-scripts allow-same-origin allow-presentation";[m
[32m+[m
 export default function Player() {[m
   const [location] = useLocation();[m
   const id = decodeURIComponent(location.split("/watch/")[1]?.split("?")[0] || "");[m
[36m@@ -84,7 +89,8 @@[m [mexport default function Player() {[m
               src={active.url}[m
               className="h-full w-full border-0"[m
               allow="autoplay; fullscreen; encrypted-media; picture-in-picture"[m
[31m-              sandbox="allow-scripts allow-same-origin allow-presentation"[m
[32m+[m[32m              sandbox={PLAYER_SANDBOX}[m
[32m+[m[32m              referrerPolicy="no-referrer-when-downgrade"[m
               allowFullScreen[m
             />[m
           ) : ([m
[36m@@ -96,7 +102,8 @@[m [mexport default function Player() {[m
       </section>[m
 [m
       <p className="mt-4 text-xs text-white/40">[m
[31m-        Original provider player loaded directly. Playback controls belong to the provider.[m
[32m+[m[32m        Provider popups and popunders are blocked by the embedded player sandbox. Ads rendered inside the provider player[m
[32m+[m[32m        itself require the provider to remove them or a server-side proxy.[m
       </p>[m
     </main>[m
   );[m
