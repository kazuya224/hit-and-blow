// server/src/message.js
import { isValidCode } from "./utils.js";
import { calcHitBlow } from "./game.js";
import {
  createRoom,
  joinRoom,
  getRoomByWs,
  setSecret,
  roomStateView,
  onLeave,
} from "./room.js";

function send(ws, type, payload = {}) {
  if (!ws || ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify({ type, ...payload }));
}

// 既存broadcastがあるなら置き換え/中身を修正
export function broadcast(room, msg) {
  // room.players の各要素が { ws, index, ... } を持つ想定
  room.players.forEach((p) => {
    if (!p?.ws) return;

    // ★ you が無いなら自動で付ける（各クライアントごとに違う値を入れられる）
    const withYou =
      msg && msg.you === undefined
        ? { ...msg, you: p.index } // or p.ws.playerIndex でもOK
        : msg;

    p.ws.send(JSON.stringify(withYou));
  });
}

function sendStateToRoom(room) {
  room.players.forEach((p, idx) => {
    send(p.ws, "state", {
      state: roomStateView(room),
      you: idx, // ← p.index ではなく idx
    });
  });
}

export function handleMessage(ws, msg) {
  const { type } = msg;

  // create_room
  if (type === "create_room") {
    const room = createRoom(ws, msg.name || "P1");
    send(ws, "room_created", { roomId: room.roomId });
    sendStateToRoom(room);
    return;
  }
  

  // join_room
  if (type === "join_room") {
    const roomId = (msg.roomId || "").toString().toUpperCase();
    const res = joinRoom(ws, roomId, msg.name || "P2");
    if (!res.ok) return send(ws, "error", { message: res.message });
  
    sendStateToRoom(res.room);
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

    sendStateToRoom(res.room);
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

    room.players.forEach((p) => {
      send(p.ws, "guess_result", {
        by: ws.playerIndex,
        guess,
        hit,
        blow,
        winner,
        state: roomStateView(room),
        you: p.index,
      });
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
