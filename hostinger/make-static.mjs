// Builds the static production bundle for Hostinger and writes dist/client/index.html.
// Usage: node hostinger/make-static.mjs   (after `npm install`)
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

execSync("npx vite build --config vite.static.config.ts", { stdio: "inherit" });
if (!existsSync("dist/client/_shell.html")) throw new Error("SPA shell was not generated.");
copyFileSync("dist/client/_shell.html", "dist/client/index.html");
console.log("Ready: upload the contents of dist/client into public_html");
