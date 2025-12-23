import { useWebSocket } from "./hooks/useWebSocket";
import Home from "./pages/Home";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

export default function App() {
  const { connected, error, send } = useWebSocket(WS_URL);

  return (
    <div>
      {error ? <div style={{ padding: 12, color: "crimson" }}>{error}</div> : null}
      <Home
        connected={connected}
        onCreate={(name) => send("create_room", { name })}
        onJoin={(roomId, name) => send("join_room", { roomId, name })}
      />
    </div>
  );
}
