// server/src/room.js
import { makeId } from "./utils.js";

// インメモリ：DBなしの代わり
const rooms = new Map(); // roomId -> roomState

export function createRoom(hostWs, name = "P1") {
  const roomId = makeId(6);

  const room = {
    roomId,
    phase: "WAITING", // WAITING | READY | PLAYING | FINISHED
    turnIndex: 0,
    players: [
      {
        ws: hostWs,
        name,
        secret: null,
      },
    ],
    history: [], // { by, guess, hit, blow }
  };

  rooms.set(roomId, room);

  // ws側にも紐付け（DBなしなので重要）
  hostWs.roomId = roomId;
  hostWs.playerIndex = 0;

  return room;
}

export function joinRoom(ws, roomId, name = "P2") {
  const room = rooms.get(roomId);
  if (!room) return { ok: false, message: "Room not found" };
  if (room.players.length >= 2) return { ok: false, message: "Room full" };
  if (room.phase === "FINISHED") return { ok: false, message: "Room finished" };

  room.players.push({ ws, name, secret: null });

  ws.roomId = roomId;
  ws.playerIndex = 1;

  room.phase = "READY";
  return { ok: true, room };
}

export function getRoomByWs(ws) {
  const roomId = ws.roomId;
  if (!roomId) return null;
  return rooms.get(roomId) || null;
}

export function deleteRoom(roomId) {
  rooms.delete(roomId);
}

export function onLeave(ws) {
  const room = getRoomByWs(ws);
  if (!room) return;

  // 最初は簡易運用：誰か抜けたら部屋破棄
  deleteRoom(room.roomId);
}

export function setSecret(ws, code) {
  const room = getRoomByWs(ws);
  if (!room) return { ok: false, message: "Not in a room" };

  const me = room.players[ws.playerIndex];
  if (!me) return { ok: false, message: "Player not found" };

  me.secret = code;

  // 両者揃ったら開始
  if (room.players.length === 2 && room.players.every((p) => p.secret)) {
    room.phase = "PLAYING";
    room.turnIndex = 0; // 0開始固定（必要ならランダムにできる）
  } else if (room.players.length === 2) {
    room.phase = "READY";
  }

  return { ok: true, room };
}

export function roomStateView(room) {
  return {
    roomId: room.roomId,
    phase: room.phase,
    turnIndex: room.turnIndex,
    players: room.players.map((p, idx) => ({
      index: idx,
      name: p.name,
      hasSecret: !!p.secret,
      connected: !!p.ws && p.ws.readyState === p.ws.OPEN,
    })),
    history: room.history,
  };
}

export function broadcast(room, obj) {
  const msg = JSON.stringify(obj);
  for (const p of room.players) {
    if (p.ws && p.ws.readyState === p.ws.OPEN) {
      p.ws.send(msg);
    }
  }
}
