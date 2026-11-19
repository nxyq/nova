// Standalone Wisp server. Deploy on Fly.io / Railway / Render / a VPS (NOT Vercel: no WebSockets).
const http = require("http");
const wisp = require("wisp-server-node");
const server = http.createServer((_, res) => { res.writeHead(200); res.end("wisp ok"); });
server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
  else socket.destroy();
});
const port = process.env.PORT || 8080;
server.listen(port, () => console.log("wisp on :" + port + "/wisp/"));
