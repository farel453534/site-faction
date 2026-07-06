import { Router } from "express";
import dgram from "node:dgram";

const router = Router();

const GMD_HOST = "51.91.215.65";
const GMD_PORT = 27015;

const A2S_HEADER = Buffer.from([0xff, 0xff, 0xff, 0xff]);
const A2S_INFO_PAYLOAD = Buffer.from([
  0x54,
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
    let challenged = false;

    const timer = setTimeout(() => {
      socket.close();
      reject(new Error("timeout"));
    }, 5000);

    const parseInfo = (msg: Buffer) => {
      if (msg.length < 9 || msg[4] !== 0x49) { reject(new Error("bad response")); return; }
      let off = 6;
      const name   = readNullString(msg, off); off = name.offset;
      const map    = readNullString(msg, off); off = map.offset;
      const folder = readNullString(msg, off); off = folder.offset;
      const game   = readNullString(msg, off); off = game.offset;
      off += 2;
      const players    = msg[off]     ?? 0;
      const maxPlayers = msg[off + 1] ?? 0;
      resolve({ players, maxPlayers, name: name.value, map: map.value });
    };

    socket.on("message", (msg) => {
      if (msg[4] === 0x41 && !challenged) {
        // Challenge response — resend with the 4 challenge bytes appended
        challenged = true;
        const challenge = msg.slice(5, 9);
        const req = Buffer.concat([A2S_HEADER, A2S_INFO_PAYLOAD, challenge]);
        socket.send(req, 0, req.length, GMD_PORT, GMD_HOST);
      } else if (msg[4] === 0x49) {
        clearTimeout(timer);
        socket.close();
        parseInfo(msg);
      } else {
        clearTimeout(timer);
        socket.close();
        reject(new Error(`unexpected type 0x${msg[4]?.toString(16)}`));
      }
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      socket.close();
      reject(err);
    });

    const req = Buffer.concat([A2S_HEADER, A2S_INFO_PAYLOAD]);
    socket.send(req, 0, req.length, GMD_PORT, GMD_HOST);
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
