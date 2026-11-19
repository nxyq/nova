import { useEffect, useRef } from "react";
// ReactBits-style Aurora: drifting additive gradient blobs on a low-res canvas.
export default function Aurora({ colors = ["#7c5cff", "#22d3ee", "#f472b6"], speed = 1, blur = 60 }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current, g = c.getContext("2d"); let raf, t = 0;
    const fit = () => { c.width = c.clientWidth / 3; c.height = c.clientHeight / 3; };
    fit(); addEventListener("resize", fit);
    const loop = () => {
      t += 0.004 * speed; g.globalCompositeOperation = "source-over";
      g.fillStyle = "#08080c"; g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = "lighter";
      colors.forEach((col, i) => {
        const x = c.width * (0.5 + 0.38 * Math.sin(t * (1 + i * 0.6) + i * 2));
        const y = c.height * (0.45 + 0.3 * Math.cos(t * (0.8 + i * 0.5) + i));
        const r = Math.max(c.width, c.height) * 0.55;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, col + "99"); gr.addColorStop(1, col + "00");
        g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
      });
      raf = requestAnimationFrame(loop);
    };
    loop(); return () => { cancelAnimationFrame(raf); removeEventListener("resize", fit); };
  }, []);
  return <canvas ref={ref} className="aurora" style={{ filter: `blur(${blur / 6}px) saturate(1.3)` }} />;
}
