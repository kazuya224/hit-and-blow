import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GameBoard({ mode, keyword }) {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState([]);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    generateAnswer();
  }, []);

  const generateAnswer = () => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const newAnswer = [];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      newAnswer.push(digits.splice(randomIndex, 1)[0]);
    }
    setAnswer(newAnswer);
    setLogs([]);
    setIsFinished(false);
    setInput("");
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (input.length !== 4) return;

    // 重複チェックのバリデーションを追加
    if (new Set(input).size !== 4) {
      alert("数字は重複しないように入力してください");
      return;
    }

    const guessArray = input.split("").map(Number);
    let hit = 0;
    let blow = 0;

    guessArray.forEach((num, i) => {
      if (num === answer[i]) {
        hit++;
      } else if (answer.includes(num)) {
        blow++;
      }
      console.log("答え", answer.join(""));
    });

    const newLog = { 
      guess: input, 
      hit, 
      blow, 
      count: logs.length + 1 
    };
    setLogs([newLog, ...logs]);
    setInput("");

    if (hit === 4) {
      setIsFinished(true);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 md:p-8 min-h-screen bg-slate-50 text-slate-800">
      {/* ヘッダーエリア */}
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <span className="text-lg">←</span> タイトル
        </button>
        <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 shadow-sm">
          {mode === 'single' ? 'SINGLE MODE' : `KEY: ${keyword}`}
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-6">
        {/* メインカード */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-white">
          <h2 className="text-center text-slate-400 text-xs font-black tracking-[0.2em] mb-4 uppercase">
            Guess the 4 numbers
          </h2>

          {isFinished ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Excellent!</h3>
              <p className="text-slate-500 mb-6">正解は <span className="font-mono text-blue-600 font-bold tracking-widest">{answer.join("")}</span> でした</p>
              <button 
                onClick={generateAnswer} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                もう一度遊ぶ
              </button>
            </div>
          ) : (
            <form onSubmit={handleGuess} className="flex flex-col gap-6">
              <div className="relative">
                <input
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-5 text-4xl font-mono tracking-[0.5em] text-center focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
                  maxLength={4}
                  placeholder="0000"
                  autoFocus
                />
              </div>
              <button 
                disabled={input.length !== 4}
                className="w-full bg-slate-800 disabled:bg-slate-200 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:active:scale-100"
              >
                予想する
              </button>
            </form>
          )}
        </div>

        {/* 履歴エリア */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black text-slate-800 text-sm tracking-wider">過去の回答</h3>
            <span className="text-slate-400 text-xs font-bold">{logs.length} 回答回数</span>
          </div>
          
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {logs.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl text-slate-300 font-medium italic">
                まだ、回答がありません。
              </div>
            )}
            {logs.map((log, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-top-4 duration-300"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-300 w-4">#{log.count}</span>
                  <span className="text-2xl font-mono font-bold text-slate-700 tracking-widest">{log.guess}</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col items-center justify-center bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                    <span className="text-[10px] font-black text-red-400 leading-none">HIT</span>
                    <span className="text-lg font-bold text-red-600 leading-none">{log.hit}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                    <span className="text-[10px] font-black text-blue-400 leading-none">BLOW</span>
                    <span className="text-lg font-bold text-blue-600 leading-none">{log.blow}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}