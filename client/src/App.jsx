import { useCallback, useMemo, useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";

import Home from "./pages/Home";
import WaitingRoom from "./pages/WaitingRoom";
import SecretInput from "./pages/SecretInput";
// import Game from "./pages/Game"; // 後で作る

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

export default function App() {
  const [roomState, setRoomState] = useState(null);   // server: roomStateView(room)
  const [createdRoomId, setCreatedRoomId] = useState("");

  const onWsMessage = useCallback((msg) => {
    if (msg.type === "room_created") {
      setCreatedRoomId(msg.roomId);
    }
    if (msg.type === "state") {
      setRoomState(msg.state);
    }
    if (msg.type === "error") {
      console.error("[server error]", msg.message);
      alert(msg.message);
    }
  }, []);

  const { connected, error, send } = useWebSocket(WS_URL, onWsMessage);

  const phase = roomState?.phase ?? null; // WAITING | READY | PLAYING | FINISHED

  // 共通アクション
  const leave = () => {
    send("leave");
    setRoomState(null);
    setCreatedRoomId("");
  };

  // まだ部屋に入っていない → Home
  if (!roomState) {
    return (
      <div>
        {error ? <div style={{ padding: 12, color: "crimson" }}>{error}</div> : null}
        <Home
          connected={connected}
          lastCreated={createdRoomId}
          onCreate={(name) => send("create_room", { name })}
          onJoin={(roomId, name) => send("join_room", { roomId, name })}
        />
      </div>
    );
  }

  // WAITING / READY → 参加待ち画面（READYになったら SecretInput へ進める）
  if (phase === "WAITING" || phase === "READY") {
    return (
      <WaitingRoom
        state={roomState}
        onLeave={leave}
        onGoSecret={() => {
          // READYのときだけ進める（WAITINGでは押させない）
          if (roomState.phase === "READY") {
            // SecretInput へ。画面遷移は phase でやる設計でもOK。
            // ここは「SecretInputに進む」フラグで管理する場合に使う
          }
        }}
      />
    );
  }

  // PLAYING → Secret入力済みならゲーム画面へ
  if (phase === "PLAYING") {
    return (
      <div style={{ padding: 24 }}>
        <h2>ゲーム開始！</h2>
        <p>Room: {roomState.roomId}</p>
        <button onClick={leave}>退出</button>
        {/* 後で <Game state={roomState} send={send} /> に差し替え */}
      </div>
    );
  }

  // FINISHED など
  return (
    <div style={{ padding: 24 }}>
      <h2>終了</h2>
      <button onClick={leave}>ホームに戻る</button>
    </div>
  );
}
