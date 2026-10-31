// Service Worker com Estratégia Network-First:
// Sempre busca a versão mais nova do servidor quando há internet (sem precisar dar Clear Site Data!)
// E mantém o cache atualizado automaticamente para funcionar offline quando necessário.
const CACHE_NAME = "mundinho-magico-v4";

self.addEventListener("install", () => {
  // Assume o controle imediatamente sem ficar preso esperando fechar abas
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Ignora requisições de extensões ou esquemas não-http
  if (!event.request.url.startsWith("http")) return;

  // Para páginas HTML (navegação), força busca direta na rede ignorando cache HTTP do navegador
  const isHtmlNavigation =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");

  const networkFetch = isHtmlNavigation
    ? fetch(event.request.url, { cache: "no-store" })
    : fetch(event.request);

  // ESTRATÉGIA NETWORK-FIRST (Rede Primeiro, Cache apenas se estiver Offline)
  event.respondWith(
    networkFetch
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === "basic" || networkResponse.type === "cors")
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Somente se estiver sem internet (offline), usa o cache salvo
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/");
        });
      })
  );
});
