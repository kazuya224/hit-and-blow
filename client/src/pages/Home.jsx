import { useEffect, useState } from "react";

export default function Home({ connected, onCreate, onJoin }) {
  const [name, setName] = useState("Player");
  const [roomId, setRoomId] = useState("");
  const [lastCreated, setLastCreated] = useState("");

  // サーバが roomId を返しても、今は Home がそれを受け取ってないので
  // ひとまず「Create後に表示したい」なら、App側で渡すのがベスト。
  // ただ今すぐは、Join用入力欄に手で入れる運用でもOK。

  useEffect(() => {
    // ここは将来的に props で roomId を受け取って setLastCreated する想定
  }, []);

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>Hit & Blow</h1>

      <div style={styles.card}>
        <div style={styles.row}>
          <label style={styles.label}>名前</label>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div style={styles.sep} />

        <button
          style={styles.btn}
          disabled={!connected}
          onClick={() => onCreate(name)}
        >
          ルームを作成
        </button>

        {lastCreated && (
          <div style={styles.createdBox}>
            <div style={{ opacity: 0.7, fontSize: 13 }}>ルームを作成</div>
            <div style={styles.roomId}>{lastCreated}</div>
            <button
              style={styles.btn2}
              onClick={() => navigator.clipboard.writeText(lastCreated)}
            >
              Copy
            </button>
          </div>
        )}

        <div style={styles.row}>
          <input
            style={styles.input}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder="ROOM ID (e.g. ABC123)"
          />
          <button
            style={styles.btn2}
            disabled={!connected || !roomId}
            onClick={() => onJoin(roomId, name)}
          >
            参加
          </button>
        </div>

        <p style={styles.muted}>
          Status: {connected ? "connected" : "disconnected"}
        </p>

        <p style={styles.muted2}>
          ※ CreateしたルームIDの表示は、次に App.jsx で受け取って表示にします
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 },
  title: { margin: 0, marginBottom: 12 },
  card: {
    width: "min(520px, 95vw)",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
  },
  row: { display: "flex", gap: 8, alignItems: "center", marginTop: 10 },
  label: { width: 70, opacity: 0.8 },
  input: { flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" },
  btn: { width: "100%", padding: "10px 12px", borderRadius: 10, cursor: "pointer" },
  btn2: { padding: "10px 12px", borderRadius: 10, cursor: "pointer" },
  muted: { marginTop: 12, opacity: 0.7, fontSize: 13 },
  muted2: { marginTop: 6, opacity: 0.55, fontSize: 12 },
  sep: { height: 10 },
  createdBox: {
    marginTop: 10,
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 10,
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
  },
  roomId: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 18 },
};
