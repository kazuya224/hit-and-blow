export default function WaitingRoom({ state, onLeave, onGoSecret }) {
    if (!state) return <div style={{ padding: 24 }}>loading...</div>;
  
    return (
      <div style={{ padding: 24 }}>
        <h2>参加待ち</h2>
        <p>ROOM ID: <b>{state.roomId}</b></p>
  
        <ul>
          {state.players.map((p) => (
            <li key={p.index}>
              {p.name} {p.connected ? "🟢" : "⚫"} {p.hasSecret ? "🔐" : ""}
            </li>
          ))}
        </ul>
  
        {state.phase === "WAITING" && <p>相手の参加を待っています…</p>}
  
        {state.phase === "READY" && (
          <>
            <p>✔ 2人揃いました！</p>
            <button onClick={onGoSecret}>秘密の数字を入力する</button>
          </>
        )}
  
        <div style={{ marginTop: 16 }}>
          <button onClick={onLeave}>退出</button>
        </div>
      </div>
    );
  }
  