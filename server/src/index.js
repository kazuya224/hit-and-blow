// server/src/index.js
import { WebSocketServer } from "ws";
import { handleMessage } from "./message.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running: ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("client connected");

  ws.on("message", (data) => {
    console.log("[WS recv]", data.toString()); // ← data を使う
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(ws, msg);
    } catch (e) {
      console.error("Invalid JSON:", e);
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
    }
  });

  ws.on("close", () => {
    console.log("client disconnected");
    handleMessage.onClose?.(ws);
  });

  ws.on("error", (err) => {
    console.error("ws error:", err);
  });

  // 接続確認用
  ws.send(JSON.stringify({ type: "hello" }));
});

process.on("uncaughtException", (e) => console.error("uncaughtException:", e));
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));
