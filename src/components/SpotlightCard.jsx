import { useRef } from "react";
// ReactBits-style SpotlightCard: radial highlight follows the cursor.
export default function SpotlightCard({ children, className = "", color = "rgba(139,116,255,.28)", ...p }) {
  const ref = useRef();
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", e.clientX - r.left + "px");
    ref.current.style.setProperty("--my", e.clientY - r.top + "px");
  };
  return (
    <div ref={ref} onMouseMove={move} className={"spot " + className} style={{ "--spot": color }} {...p}>
      {children}
    </div>
  );
}
