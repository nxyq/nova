let ctl, conn, boot;
const STORES = ["config", "cookies", "redirectTrackers", "referrerPolicies", "publicSuffixList"];
const openDB = () => new Promise((res, rej) => {
  const r = indexedDB.open("$scramjet", 1);
  r.onupgradeneeded = () => STORES.forEach((s) => r.result.objectStoreNames.contains(s) || r.result.createObjectStore(s));
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
// Repairs an empty/broken Scramjet DB left by an earlier broken service worker.
async function fixDB() {
  const d = await openDB(); const ok = STORES.every((s) => d.objectStoreNames.contains(s)); d.close();
  if (ok) return;
  await new Promise((res, rej) => {
    const r = indexedDB.deleteDatabase("$scramjet");
    r.onsuccess = res; r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error("Scramjet DB is stuck. Clear site data for this site and reload"));
  });
  (await openDB()).close();
}

const dflt = () =>
  import.meta.env.VITE_WISP_URL ||
  (location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "ws://localhost:8080/wisp/"
    : (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/wisp/");
export const getWisp = () => localStorage.wisp || dflt();
export async function setWisp(url) {
  localStorage.wisp = url;
  if (conn) await conn.setTransport("/epoxy/index.mjs", [{ wisp: url }]);
}
export function initProxy() {
  return (boot ??= (async () => {
    if (!("serviceWorker" in navigator)) throw new Error("Service workers need https or localhost");
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    const lib = "/baremux/index.mjs";
    const { BareMuxConnection } = await import(/* @vite-ignore */ lib);
    conn = new BareMuxConnection("/baremux/worker.js");
    await conn.setTransport("/epoxy/index.mjs", [{ wisp: getWisp() }]);
    await fixDB();
    const { ScramjetController } = $scramjetLoadController();
    ctl = new ScramjetController({
      prefix: "/scramjet/",
      files: { wasm: "/scramjet.wasm.wasm", all: "/scramjet.all.js", sync: "/scramjet.sync.js" },
    });
    await ctl.init();
    return ctl;
  })().catch((e) => { boot = null; throw e; }));
}
export const createFrame = (el) => ctl.createFrame(el);
export const normalize = (v, engine = "https://duckduckgo.com/?q=") => {
  v = v.trim(); if (!v) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return v;
  if (/^(localhost|[^\s/]+\.[a-z]{2,})(:\d+)?([/?#]\S*)?$/i.test(v)) return "https://" + v;
  return engine + encodeURIComponent(v);
};
export const favicon = (u) => { try { return "https://www.google.com/s2/favicons?sz=32&domain=" + new URL(u).hostname; } catch { return ""; } };
