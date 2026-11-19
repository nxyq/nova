importScripts("/scramjet.all.js");
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (ev) => {
  ev.respondWith((async () => {
    await scramjet.loadConfig();
    return scramjet.route(ev) ? scramjet.fetch(ev) : fetch(ev.request);
  })());
});
