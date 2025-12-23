// server/src/index.js
import { WebSocketServer } from "ws";
import { handleMessage } from "./message.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running: ws://localhost:${PORT}`);

wss.on("connection", (ws, req) => {
  console.log("client connected");

  ws.on("close", () => console.log("client disconnected"));
  ws.on("error", (e) => console.log("ws error", e));

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      handleMessage(ws, msg);
    } catch (e) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid JSON",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("client disconnected");
    if (handleMessage.onClose) {
      handleMessage.onClose(ws);
    }
  });

  ws.on("error", (err) => {
    console.error("ws error:", err);
  });

  // 接続確認用（クライアントの connected=true になる）
  ws.send(JSON.stringify({ type: "hello" }));
});
