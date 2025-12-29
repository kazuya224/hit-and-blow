import { useMemo, useState } from "react";

export default function Game({ state, you, send, onLeave }) {
  const [guess, setGuess] = useState("");

  // ===== 勝敗判定（stateに合わせて拾う） =====
  const winnerIndex =
    state?.winnerIndex ??
    state?.winner ?? // もし winner が 0/1 の形式なら
    null;

  const hasWinner = winnerIndex !== null && winnerIndex !== undefined;

  const iWin = you != null && hasWinner && Number(winnerIndex) === Number(you);
  const iLose = you != null && hasWinner && Number(winnerIndex) !== Number(you);

  // ===== 勝者が出た後の入力可否（サーバー state に完全準拠） =====
const finalTurn = Boolean(state?.finalTurn);
const finalGuessIndex = state?.finalGuessIndex ?? null;
const showFinalResult = hasWinner && !finalTurn;


const isMyTurnNormal = you != null && Number(state?.turnIndex) === Number(you);

const canGuessAfterWin = useMemo(() => {
  if (!hasWinner) return false;

  // 先攻(0)が勝ったときだけ、後攻に最後の1回を許可
  if (Number(winnerIndex) === 0 && finalTurn) {
    return you != null && Number(finalGuessIndex) === Number(you);
  }

  // 後攻(1)が勝ったら即終了
  return false;
}, [hasWinner, winnerIndex, finalTurn, finalGuessIndex, you]);

const canInput =
  state?.phase === "PLAYING" &&
  (hasWinner ? canGuessAfterWin : isMyTurnNormal);


  const submitGuess = () => {
    if (!canInput) {
      alert(hasWinner ? "ゲーム終了（あなたは回答できません）" : "相手のターンです");
      return;
    }
    const v = guess.trim();
    if (!/^\d{4}$/.test(v)) {
      alert("4桁の数字を入力してください（例: 1234）");
      return;
    }
    send("guess", { guess: v });
    setGuess("");
  };

  // 履歴（あなたのstateに合わせてここだけ調整）
  const history = state?.history ?? [];

  // 自分/相手に分ける（by が誰の手か）
  const myHistory = history.filter((h) => you != null && Number(h.by) === Number(you));
  const oppHistory = history.filter((h) => you != null && Number(h.by) !== Number(you));

  return (
    <div style={{ padding: 24 }}>
      <h2>対戦中</h2>
      <p>Room: <b>{state?.roomId}</b></p>

      {/* ===== 勝敗表示 ===== */}
      {showFinalResult ? (
  <p style={{ fontWeight: 800, fontSize: 18 }}>
    {iWin ? "あなたの勝ち 🎉" : "あなたの負け 😭"}
  </p>
) : hasWinner && finalTurn ? (
  <p style={{ fontWeight: 700 }}>
    先攻が正解！後攻は最後に1回だけ回答できます
  </p>
) : (
  <p style={{ fontWeight: 700 }}>
    {you == null
      ? "あなたのプレイヤー情報取得中..."
      : (Number(state?.turnIndex) === Number(you) ? "あなたのターン" : "相手のターン")}
  </p>
)}


      {/* ===== 入力UI ===== */}
      <div style={{ marginTop: 12 }}>
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="予想: 1234"
          maxLength={4}
          inputMode="numeric"
          disabled={!canInput}
          style={{ fontSize: 24, letterSpacing: 8, padding: 8 }}
        />
        <button onClick={submitGuess} disabled={!canInput} style={{ marginLeft: 8 }}>
          送信
        </button>
        <button onClick={onLeave} style={{ marginLeft: 8 }}>
          退出
        </button>
      </div>

      {/* ===== 履歴：自分/相手で分割表示 ===== */}
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <h3 style={{ margin: "0 0 10px" }}>あなたの予想</h3>
          {myHistory.length === 0 ? (
            <p style={{ opacity: 0.7 }}>まだありません</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {myHistory.map((h, i) => (
                <div key={`me-${i}`} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 700, letterSpacing: 6, fontSize: 18 }}>{h.guess}</div>
                  <div style={{ opacity: 0.8 }}>
                    HIT: <b>{h.hit}</b> / BLOW: <b>{h.blow}</b>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <h3 style={{ margin: "0 0 10px" }}>相手の予想</h3>
          {oppHistory.length === 0 ? (
            <p style={{ opacity: 0.7 }}>まだありません</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {oppHistory.map((h, i) => (
                <div key={`op-${i}`} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 700, letterSpacing: 6, fontSize: 18 }}>{h.guess}</div>
                  <div style={{ opacity: 0.8 }}>
                    HIT: <b>{h.hit}</b> / BLOW: <b>{h.blow}</b>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 参考：勝者が出た後の説明（任意） */}
      {hasWinner && finalTurn && Number(finalGuessIndex) === Number(you) && (
  <p style={{ marginTop: 12, opacity: 0.7 }}>
    ※ 先攻が当てたため、後攻は最後に1回だけ回答できます
  </p>
)}

    </div>
  );
}
