// server/src/index.js
import { WebSocketServer } from "ws";
import { handleMessage } from "./message.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running: ws://localhost:${PORT}`);

/**
 * 送信ヘルパー（共通）
 */
export function send(ws, type, payload = {}) {
  if (!ws || ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify({ type, ...payload }));
}

/**
 * 切断時の共通処理（ルームから抜ける等）
 * ※ message.js 側で onClose(ws) を実装している想定
 *   未実装なら、いったん何もしなくてもOK（後で追加）
 */
async function safeClose(ws) {
  try {
    // message.js に onClose を用意している場合だけ呼ぶ
    if (typeof handleMessage.onClose === "function") {
      await handleMessage.onClose(ws);
    }
  } catch (e) {
    console.error("onClose error:", e);
  }
}

wss.on("connection", (ws, req) => {
  // 任意：ログ用に簡易ID
  ws._id = Math.random().toString(36).slice(2, 10);

  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket.remoteAddress;

  console.log(`[WS] connected id=${ws._id} ip=${ip}`);

  // ping/pong（接続維持に強くなる）
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return send(ws, "error", { message: "Invalid JSON" });
    }

    // type がない/変な場合は弾く
    if (!msg.type || typeof msg.type !== "string") {
      return send(ws, "error", { message: "Missing message type" });
    }

    try {
      handleMessage(ws, msg);
    } catch (e) {
      console.error("handleMessage error:", e);
      send(ws, "error", { message: "Server error" });
    }
  });

  ws.on("close", () => {
    console.log(`[WS] closed id=${ws._id}`);
    safeClose(ws);
  });

  ws.on("error", (err) => {
    console.error(`[WS] error id=${ws._id}:`, err);
  });

  // 接続直後に hello（任意）
  send(ws, "hello", { message: "connected" });
});

/**
 * 接続監視（死んだ接続を掃除）
 * - DBなしのルーム制だと「ゴースト接続」が残りやすいので効果大
 */
const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

wss.on("close", () => clearInterval(interval));
