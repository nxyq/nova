# Nova: Chrome-style browser on Scramjet (Vite + React)

Frontend is static, so it deploys to Vercel as-is. The **Wisp WebSocket backend cannot run on Vercel**
(no WebSocket support) and must be hosted elsewhere.

## Local dev
    npm install
    cd server && npm install && cd ..
    npm run wisp      # terminal 1, ws://localhost:8080/wisp/
    npm run dev       # terminal 2, http://localhost:5173

## Deploy
1. **Wisp server**: deploy `server/` to Fly.io / Railway / Render / any VPS
   (`npm install && npm start`, honors `$PORT`). Endpoint: `wss://<host>/wisp/`.
2. **Vercel**: import the repo (framework: Vite). Add env var
   `VITE_WISP_URL=wss://<your-wisp-host>/wisp/`, then deploy.
   (Or leave it unset and paste the URL in the browser's ⋮ → Settings.)

## Notes
- Needs https or localhost (service workers). Vercel provides https.
- `npm run build` copies Scramjet 1.1.0, bare-mux and epoxy-transport into `public/` automatically.
- Shortcuts: Ctrl+T/W/L/R/D, Alt+←/→ (while focus is on the browser chrome).
- UI components (Aurora, SpotlightCard, BlurText, ShinyText) are in the style of ReactBits, in `src/components`.
