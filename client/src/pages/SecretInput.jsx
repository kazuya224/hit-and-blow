import { useState } from "react";

export default function SecretInput({ state, onSubmit, onLeave }) {
  const [code, setCode] = useState("");

  const submit = () => {
    const v = code.trim();
    if (!/^\d{4}$/.test(v)) {
      alert("4桁の数字を入力してください（例: 1234）");
      return;
    }
    onSubmit(v);
  };

  const myIndex = state?.players?.find((p) => p.hasSecret)?.index; // 雑でもOK（後で改善可）

  return (
    <div style={{ padding: 24 }}>
      <h2>秘密の数字を入力</h2>

      <p style={{ opacity: 0.7 }}>
        Room: <b>{state?.roomId}</b>
      </p>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="1234"
        maxLength={4}
        inputMode="numeric"
        style={{ fontSize: 24, letterSpacing: 8, padding: 8 }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>決定</button>
        <button onClick={onLeave} style={{ marginLeft: 8 }}>退出</button>
      </div>

      <p style={{ marginTop: 16, opacity: 0.7 }}>
        決定後、相手も入力するとゲームが開始します。
      </p>
    </div>
  );
}
