// Production build for shared hosting (Hostinger): static SPA output, no Node server.
// Usage: npx vite build --config vite.static.config.ts   → dist/client (upload to public_html)
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    spa: { enabled: true },
  },
});
