// server/src/message.js
import { isValidCode } from "./utils.js";
import { calcHitBlow } from "./game.js";
import {
  createRoom,
  joinRoom,
  getRoomByWs,
  setSecret,
  roomStateView,
  broadcast,
  onLeave,
} from "./room.js";

function send(ws, type, payload = {}) {
  if (!ws || ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify({ type, ...payload }));
}

export function handleMessage(ws, msg) {
  const { type } = msg;

  // create_room
  if (type === "create_room") {
    const room = createRoom(ws, msg.name || "P1");
    send(ws, "room_created", { roomId: room.roomId });
    send(ws, "state", { state: roomStateView(room) });
    return;
  }

  // join_room
  if (type === "join_room") {
    const roomId = (msg.roomId || "").toString().toUpperCase();
    const res = joinRoom(ws, roomId, msg.name || "P2");
    if (!res.ok) return send(ws, "error", { message: res.message });

    send(ws, "room_joined", { roomId });
    broadcast(res.room, { type: "state", state: roomStateView(res.room) });
    return;
  }

  const room = getRoomByWs(ws);
  if (!room) return send(ws, "error", { message: "Not in a room" });

  // set_secret
  if (type === "set_secret") {
    const code = msg.code;
    if (!isValidCode(code)) return send(ws, "error", { message: "Invalid code" });

    const res = setSecret(ws, code);
    if (!res.ok) return send(ws, "error", { message: res.message });

    broadcast(res.room, { type: "state", state: roomStateView(res.room) });
    return;
  }

  // guess
  if (type === "guess") {
    if (room.phase !== "PLAYING") return send(ws, "error", { message: "Not playing" });
    if (ws.playerIndex !== room.turnIndex) return send(ws, "error", { message: "Not your turn" });

    const guess = msg.guess;
    if (!isValidCode(guess)) return send(ws, "error", { message: "Invalid guess" });

    const opponentIndex = ws.playerIndex === 0 ? 1 : 0;
    const opponent = room.players[opponentIndex];
    if (!opponent?.secret) return send(ws, "error", { message: "Opponent is not ready" });

    const { hit, blow } = calcHitBlow(opponent.secret, guess);
    room.history.push({ by: ws.playerIndex, guess, hit, blow });

    let winner = null;
    if (hit === 4) {
      room.phase = "FINISHED";
      winner = ws.playerIndex;
    } else {
      room.turnIndex = opponentIndex;
    }

    broadcast(room, {
      type: "guess_result",
      by: ws.playerIndex,
      guess,
      hit,
      blow,
      winner,
      state: roomStateView(room),
    });
    return;
  }

  // leave
  if (type === "leave") {
    onLeave(ws);
    return;
  }

  send(ws, "error", { message: `Unknown type: ${type}` });
}

// 切断時
handleMessage.onClose = async (ws) => {
  onLeave(ws);
};
