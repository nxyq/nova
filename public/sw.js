importScripts("/scramjet.all.js");
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
const STORES = ["config", "cookies", "redirectTrackers", "referrerPolicies", "publicSuffixList"];
// Scramjet's SW opens the DB without an upgrade handler; create the stores first so the
// SW can never leave behind an empty DB (which breaks the page's controller.init()).
const ready = new Promise((res, rej) => {
  const r = indexedDB.open("$scramjet", 1);
  r.onupgradeneeded = () => STORES.forEach((s) => r.result.objectStoreNames.contains(s) || r.result.createObjectStore(s));
  r.onsuccess = () => { r.result.close(); res(); };
  r.onerror = () => rej(r.error);
});
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (ev) => {
  ev.respondWith((async () => {
    try {
      await ready;
      await scramjet.loadConfig();
      if (scramjet.config && scramjet.route(ev)) return await scramjet.fetch(ev);
    } catch (e) { console.error("sw:", e); }
    return fetch(ev.request);
  })());
});
