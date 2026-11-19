import { useEffect, useRef, useState } from "react";
import { initProxy, createFrame, normalize, favicon, getWisp, setWisp } from "./proxy.js";
import Aurora from "./components/Aurora.jsx";
import SpotlightCard from "./components/SpotlightCard.jsx";
import ShinyText from "./components/ShinyText.jsx";
import BlurText from "./components/BlurText.jsx";

const ls = (k, d) => { try { return JSON.parse(localStorage[k]) ?? d; } catch { return d; } };
let uid = 0;
const mk = () => ({ id: ++uid, url: "", title: "New Tab" });
const DEFAULT_BM = [
  { url: "https://wikipedia.org", title: "Wikipedia" }, { url: "https://github.com", title: "GitHub" },
  { url: "https://youtube.com", title: "YouTube" }, { url: "https://reddit.com", title: "Reddit" },
];

export default function App() {
  const [tabs, setTabs] = useState(() => [mk()]);
  const [active, setActive] = useState(1);
  const [edit, setEdit] = useState(null);
  const [bm, setBm] = useState(() => ls("bm", DEFAULT_BM));
  const [hist, setHist] = useState(() => ls("hist", []));
  const [menu, setMenu] = useState(false);
  const [err, setErr] = useState("");
  const [wisp, setWispIn] = useState(getWisp());
  const frames = useRef(new Map()), host = useRef(), tabsRef = useRef(tabs), omni = useRef();
  tabsRef.current = tabs;
  const tab = tabs.find((t) => t.id === active) || tabs[0];
  const patch = (id, o) => setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, ...o } : t)));
  const flash = (m) => { setErr(m); setTimeout(() => setErr(""), 7000); };

  useEffect(() => { localStorage.bm = JSON.stringify(bm); }, [bm]);
  useEffect(() => { localStorage.hist = JSON.stringify(hist.slice(0, 300)); }, [hist]);
  useEffect(() => {
    frames.current.forEach((f, id) => f.frame.classList.toggle("on", id === tab.id && !!tab.url));
  }, [tabs, active]);
  useEffect(() => {
    const i = setInterval(() => frames.current.forEach((f, id) => {
      try {
        const ti = f.frame.contentDocument?.title;
        const cur = tabsRef.current.find((t) => t.id === id);
        if (ti && cur && cur.title !== ti) patch(id, { title: ti });
      } catch {}
    }), 800);
    return () => clearInterval(i);
  }, []);

  async function go(id, input) {
    const u = normalize(input); if (!u) return;
    try {
      await initProxy();
      let f = frames.current.get(id);
      if (!f) {
        const el = document.createElement("iframe");
        el.className = "pf"; el.allow = "fullscreen; autoplay; clipboard-write";
        host.current.appendChild(el);
        f = createFrame(el);
        f.addEventListener("urlchange", (e) => {
          const url = String(e.url); patch(id, { url });
          setHist((h) => (h[0]?.url === url ? h : [{ url, title: url, at: Date.now() }, ...h]));
        });
        frames.current.set(id, f);
      }
      patch(id, { url: u, title: u }); f.go(u);
    } catch (e) { flash("Proxy failed: " + e.message + " — check the Wisp URL in ⋮ → Settings."); }
  }
  const newTab = () => { const t = mk(); setTabs((ts) => [...ts, t]); setActive(t.id); setTimeout(() => omni.current?.focus(), 30); };
  const closeTab = (id) => {
    frames.current.get(id)?.frame.remove(); frames.current.delete(id);
    const rest = tabs.filter((t) => t.id !== id);
    if (!rest.length) { const t = mk(); setTabs([t]); setActive(t.id); return; }
    setTabs(rest); if (active === id) setActive(rest[Math.max(0, tabs.findIndex((t) => t.id === id) - 1)].id);
  };
  const fr = () => frames.current.get(tab.id);
  const home = () => patch(tab.id, { url: "", title: "New Tab" });
  const starred = bm.some((b) => b.url === tab.url);
  const star = () => tab.url && setBm((b) => (starred ? b.filter((x) => x.url !== tab.url) : [...b, { url: tab.url, title: tab.title }]));

  useEffect(() => {
    const k = (e) => {
      const m = e.ctrlKey || e.metaKey;
      if (m && e.key === "t") { e.preventDefault(); newTab(); }
      else if (m && e.key === "w") { e.preventDefault(); closeTab(tab.id); }
      else if (m && e.key === "l") { e.preventDefault(); omni.current?.focus(); }
      else if (m && e.key === "r") { e.preventDefault(); fr()?.reload(); }
      else if (m && e.key === "d") { e.preventDefault(); star(); }
      else if (e.altKey && e.key === "ArrowLeft") fr()?.back();
      else if (e.altKey && e.key === "ArrowRight") fr()?.forward();
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  });

  return (
    <div className="app" onClick={() => setMenu(false)}>
      <div className="tabs">
        {tabs.map((t) => (
          <div key={t.id} className={"tab" + (t.id === tab.id ? " on" : "")} onClick={() => setActive(t.id)}
               onAuxClick={(e) => e.button === 1 && closeTab(t.id)}>
            {t.url && <img src={favicon(t.url)} alt="" onError={(e) => (e.target.style.visibility = "hidden")} />}
            <span>{t.title}</span>
            <b onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}>✕</b>
          </div>
        ))}
        <button className="ib plus" onClick={newTab} title="New tab (Ctrl+T)">+</button>
      </div>
      <div className="bar">
        <button className="ib" onClick={() => fr()?.back()} title="Back">←</button>
        <button className="ib" onClick={() => fr()?.forward()} title="Forward">→</button>
        <button className="ib" onClick={() => fr()?.reload()} title="Reload">⟳</button>
        <button className="ib" onClick={home} title="Home">⌂</button>
        <input ref={omni} className="omni" spellCheck={false} placeholder="Search or enter address"
               value={edit ?? tab.url} onChange={(e) => setEdit(e.target.value)}
               onFocus={(e) => e.target.select()} onBlur={() => setEdit(null)}
               onKeyDown={(e) => { if (e.key === "Enter") { go(tab.id, e.target.value); setEdit(null); e.target.blur(); } }} />
        <button className={"ib" + (starred ? " lit" : "")} onClick={star} title="Bookmark (Ctrl+D)">{starred ? "★" : "☆"}</button>
        <button className="ib" onClick={(e) => { e.stopPropagation(); setMenu(!menu); }} title="Menu">⋮</button>
      </div>
      <div className="view">
        <div ref={host} className="frames" />
        {!tab.url && (
          <div className="ntp">
            <Aurora />
            <div className="ntp-in">
              <BlurText text="Browse beyond the walls" />
              <ShinyText text="Scramjet-powered · fast · private by design" />
              <input className="ntp-q" autoFocus placeholder="Search or enter address"
                     onKeyDown={(e) => e.key === "Enter" && go(tab.id, e.target.value)} />
              <div className="tiles">
                {bm.slice(0, 8).map((b) => (
                  <SpotlightCard key={b.url} className="tile" onClick={() => go(tab.id, b.url)}>
                    <img src={favicon(b.url)} alt="" /><span>{b.title}</span>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        )}
        {menu && (
          <SpotlightCard className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="row act" onClick={() => { newTab(); setMenu(false); }}>New tab</div>
            <h3>Bookmarks</h3>
            {bm.map((b) => <div key={b.url} className="row" title={b.url} onClick={() => { go(tab.id, b.url); setMenu(false); }}>{b.title}</div>)}
            <h3>History <a onClick={() => setHist([])}>Clear</a></h3>
            {hist.slice(0, 25).map((h, i) => <div key={i} className="row" title={h.url} onClick={() => { go(tab.id, h.url); setMenu(false); }}>{h.url}</div>)}
            <h3>Settings</h3>
            <div className="set">
              <label>Wisp server URL</label>
              <input value={wisp} onChange={(e) => setWispIn(e.target.value)} />
              <button onClick={() => setWisp(wisp).then(() => flash("Saved"))}>Save</button>
            </div>
          </SpotlightCard>
        )}
        {err && <div className="toast">{err}</div>}
      </div>
    </div>
  );
}
