import { useMemo, useState } from "react";

export default function Game({ state, you, send, onLeave }) {
    const [guess, setGuess] = useState("");
  
    const isMyTurn = you != null && state?.turnIndex === you;
  
    const submitGuess = () => {
      if (!isMyTurn) {
        alert("相手のターンです");
        return;
      }
      const v = guess.trim();
      if (!/^\d{4}$/.test(v)) {
        alert("4桁の数字を入力してください（例: 1234）");
        return;
      }
      console.log(guess);
      send("guess", { guess: v });
      setGuess("");
    };
  
    return (
      <div style={{ padding: 24 }}>
        <h2>対戦中</h2>
        <p>Room: <b>{state.roomId}</b></p>
  
        <p style={{ fontWeight: 700 }}>
          {you == null ? "あなたのプレイヤー情報取得中..." : (isMyTurn ? "あなたのターン" : "相手のターン")}
        </p>
  
        <div style={{ marginTop: 12 }}>
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="予想: 1234"
            maxLength={4}
            inputMode="numeric"
            disabled={!isMyTurn}
            style={{ fontSize: 24, letterSpacing: 8, padding: 8 }}
          />
          <button onClick={submitGuess} disabled={!isMyTurn} style={{ marginLeft: 8 }}>
            送信
          </button>
          <button onClick={onLeave} style={{ marginLeft: 8 }}>
            退出
          </button>
        </div>
        {/* 履歴はそのままでOK */}
      </div>
    );
  }
  
