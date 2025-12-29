import { useCallback, useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";

import Home from "./pages/Home";
import WaitingRoom from "./pages/WaitingRoom";
import SecretInput from "./pages/SecretInput";
import Game from "./pages/Game";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

export default function App() {
  const [roomState, setRoomState] = useState(null);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [screen, setScreen] = useState("WAITING"); // "WAITING" | "SECRET"
  const [you, setYou] = useState(null); // 0 or 1 を想定

  const onWsMessage = useCallback((msg) => {
    console.log("[ws msg]", msg);

    if (msg.type === "room_created") {
      setCreatedRoomId(msg.roomId);
    }

    // ✅ state / guess_result どっちでも roomState を更新
    if (msg.type === "state" || msg.type === "guess_result") {
      const nextState = msg.state ?? msg.roomState ?? null;
      if (nextState) setRoomState(nextState);

      // ✅ you の候補をいくつか見て拾う（サーバー実装差異に強くする）
      const nextYou =
        msg.you ??
        nextState?.you ??
        nextState?.playerIndex ??
        nextState?.myIndex;

      if (nextYou !== undefined && nextYou !== null) {
        setYou(Number(nextYou)); // "0" でも比較できるように数値化
      }
    }

    if (msg.type === "error") {
      console.error("[server error]", msg.message);
      alert(msg.message);
    }
  }, []);

  const { connected, error, send } = useWebSocket(WS_URL, onWsMessage);

  const phase = roomState?.phase ?? null; // WAITING | READY | PLAYING | FINISHED

  const leave = () => {
    send("leave");
    setRoomState(null);
    setCreatedRoomId("");
    setScreen("WAITING");
    setYou(null);
  };

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

  if (phase === "WAITING" || phase === "READY") {
    if (screen === "SECRET") {
      return (
        <SecretInput
          state={roomState}
          onLeave={leave}
          onBack={() => setScreen("WAITING")}
          onSubmit={(secret) => {
            send("set_secret", { code: secret });
            setScreen("WAITING");
          }}
        />
      );
    }

    return (
      <WaitingRoom
        state={roomState}
        onLeave={leave}
        onGoSecret={() => {
          if (roomState.phase === "READY") setScreen("SECRET");
        }}
      />
    );
  }

  if (phase === "PLAYING" || phase === "FINISHED") {
    return <Game state={roomState} you={you} send={send} onLeave={leave} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>終了</h2>
      <button onClick={leave}>ホームに戻る</button>
    </div>
  );
}
