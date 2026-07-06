import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import dgram from "node:dgram";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

const GMD_HOST = "51.91.215.65";
const GMD_PORT = 27015;

const A2S_HEADER = Buffer.from([0xff, 0xff, 0xff, 0xff]);
const A2S_INFO_PAYLOAD = Buffer.from([
  0x54,
  0x53,0x6f,0x75,0x72,0x63,0x65,0x20,0x45,0x6e,0x67,
  0x69,0x6e,0x65,0x20,0x51,0x75,0x65,0x72,0x79,0x00,
]);

function readNullString(buf: Buffer, offset: number) {
  const end = buf.indexOf(0x00, offset);
  if (end === -1) return { value: "", offset: buf.length };
  return { value: buf.toString("utf8", offset, end), offset: end + 1 };
}

function queryGmod(): Promise<{ online: true; players: number; maxPlayers: number; name: string; map: string }> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    let challenged = false;

    const timer = setTimeout(() => {
      try { socket.close(); } catch {}
      reject(new Error("timeout"));
    }, 5000);

    const parseInfo = (msg: Buffer) => {
      if (msg.length < 9 || msg[4] !== 0x49) { reject(new Error("bad type")); return; }
      let off = 6;
      const name   = readNullString(msg, off); off = name.offset;
      const map    = readNullString(msg, off); off = map.offset;
      const folder = readNullString(msg, off); off = folder.offset;
      const game   = readNullString(msg, off); off = game.offset;
      off += 2;
      const players    = msg[off]     ?? 0;
      const maxPlayers = msg[off + 1] ?? 0;
      resolve({ online: true, players, maxPlayers, name: name.value, map: map.value });
    };

    socket.on("message", (msg) => {
      if (msg[4] === 0x41 && !challenged) {
        challenged = true;
        const challenge = msg.slice(5, 9);
        const req = Buffer.concat([A2S_HEADER, A2S_INFO_PAYLOAD, challenge]);
        socket.send(req, 0, req.length, GMD_PORT, GMD_HOST);
      } else if (msg[4] === 0x49) {
        clearTimeout(timer);
        try { socket.close(); } catch {}
        parseInfo(msg);
      } else {
        clearTimeout(timer);
        try { socket.close(); } catch {}
        reject(new Error(`unexpected type 0x${msg[4]?.toString(16)}`));
      }
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      try { socket.close(); } catch {}
      reject(err);
    });

    const req = Buffer.concat([A2S_HEADER, A2S_INFO_PAYLOAD]);
    socket.send(req, 0, req.length, GMD_PORT, GMD_HOST);
  });
}

// Cache polled in the background every 30s — browser gets an instant response
type CachedStatus = { online: boolean; players: number | null; maxPlayers: number | null };
let cachedStatus: CachedStatus = { online: false, players: null, maxPlayers: null };

async function pollOnce() {
  try {
    const info = await queryGmod();
    cachedStatus = { online: true, players: info.players, maxPlayers: info.maxPlayers };
  } catch {
    cachedStatus = { online: false, players: null, maxPlayers: null };
  }
}

function serverStatusPlugin(): Plugin {
  return {
    name: "server-status",
    apply: "serve", // dev server only — never runs during production build
    // Inject cached status directly into every HTML response — no browser fetch needed
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { type: "text/javascript" },
          children: `window.__GMOD_STATUS__=${JSON.stringify(cachedStatus)};`,
          injectTo: "head-prepend" as const,
        },
      ];
    },
    configureServer(server) {
      // Poll immediately then every 30s so the cache stays fresh
      pollOnce();
      const interval = setInterval(pollOnce, 30_000);
      server.httpServer?.on("close", () => clearInterval(interval));
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    serverStatusPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
