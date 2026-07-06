import { Router } from "express";
import dgram from "node:dgram";

const router = Router();

const GMD_HOST = "51.91.215.65";
const GMD_PORT = 27015;
const QUERY_TIMEOUT = 4000;

// Source Engine A2S_INFO query
const A2S_INFO_REQUEST = Buffer.from([
  0xff, 0xff, 0xff, 0xff, // header
  0x54,                   // A2S_INFO
  // "Source Engine Query\0"
  0x53, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x20, 0x45, 0x6e, 0x67,
  0x69, 0x6e, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, 0x00,
]);

function readNullString(buf: Buffer, offset: number): { value: string; offset: number } {
  const end = buf.indexOf(0x00, offset);
  if (end === -1) return { value: "", offset: buf.length };
  return { value: buf.toString("utf8", offset, end), offset: end + 1 };
}

function querySourceServer(): Promise<{ players: number; maxPlayers: number; name: string; map: string }> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error("timeout"));
    }, QUERY_TIMEOUT);

    socket.on("message", (msg) => {
      clearTimeout(timer);
      socket.close();
      try {
        // msg: FF FF FF FF 49 <protocol> <name\0> <map\0> <folder\0> <game\0> <appid:2> <players:1> <maxPlayers:1> ...
        if (msg.length < 6 || msg[4] !== 0x49) {
          // Might be a challenge (0x41) — re-send with challenge bytes
          if (msg[4] === 0x41 && msg.length >= 9) {
            reject(new Error("challenge required"));
          } else {
            reject(new Error("unexpected response type"));
          }
          return;
        }
        let offset = 6; // skip header (4) + type (1) + protocol (1)
        const name = readNullString(msg, offset);
        offset = name.offset;
        const map = readNullString(msg, offset);
        offset = map.offset;
        const folder = readNullString(msg, offset);
        offset = folder.offset;
        const game = readNullString(msg, offset);
        offset = game.offset;
        offset += 2; // app_id (short)
        const players = msg[offset] ?? 0;
        const maxPlayers = msg[offset + 1] ?? 0;
        resolve({ players, maxPlayers, name: name.value, map: map.value });
      } catch (e) {
        reject(e);
      }
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      socket.close();
      reject(err);
    });

    socket.send(A2S_INFO_REQUEST, 0, A2S_INFO_REQUEST.length, GMD_PORT, GMD_HOST);
  });
}

router.get("/server-status", async (_req, res) => {
  try {
    const info = await querySourceServer();
    res.json({ online: true, players: info.players, maxPlayers: info.maxPlayers, name: info.name, map: info.map });
  } catch {
    res.json({ online: false, players: null, maxPlayers: null });
  }
});

export default router;
