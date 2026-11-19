export default function ShinyText({ text, speed = 4, className = "" }) {
  return <span className={"shiny " + className} style={{ animationDuration: speed + "s" }}>{text}</span>;
}
