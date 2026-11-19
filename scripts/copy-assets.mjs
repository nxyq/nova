import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
const nm = "node_modules/@mercuryworkshop";
const jobs = [
  [`${nm}/scramjet/dist/scramjet.all.js`, "public/scramjet.all.js"],
  [`${nm}/scramjet/dist/scramjet.sync.js`, "public/scramjet.sync.js"],
  [`${nm}/scramjet/dist/scramjet.wasm.wasm`, "public/scramjet.wasm.wasm"],
  [`${nm}/bare-mux/dist/index.mjs`, "public/baremux/index.mjs"],
  [`${nm}/bare-mux/dist/worker.js`, "public/baremux/worker.js"],
  [`${nm}/epoxy-transport/dist/index.mjs`, "public/epoxy/index.mjs"],
];
for (const [from, to] of jobs) {
  if (!existsSync(from)) throw new Error("Missing " + from + " (run npm install)");
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to);
}
console.log("proxy assets copied");
