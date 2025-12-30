// server/src/index.js
import http from "http";
import { WebSocketServer } from "ws";
import { handleMessage } from "./message.js";

const PORT = process.env.PORT || 8080;

// Render 対策：HTTPサーバを作って PORT を開ける
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running\n");
});

// WebSocket を HTTP サーバに紐付ける
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("client connected");

  ws.on("message", (data) => {
    console.log("[WS recv]", data.toString());
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

  ws.send(JSON.stringify({ type: "hello" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("listening on", PORT);
});

process.on("uncaughtException", (e) => console.error("uncaughtException:", e));
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));
