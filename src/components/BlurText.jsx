// ReactBits-style BlurText: words blur/slide in with a stagger.
export default function BlurText({ text, delay = 90, className = "" }) {
  return (
    <h1 className={"blurtext " + className}>
      {text.split(" ").map((w, i) => (
        <span key={i} style={{ animationDelay: i * delay + "ms" }}>{w}&nbsp;</span>
      ))}
    </h1>
  );
}
