import { useState } from 'react';

export default function Lobby({ onJoin }) {
  const [key, setKey] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key.trim() === "") {
      alert("合言葉を入力してください");
      return;
    }
    onJoin(key); // App.js側のhandleJoinが実行され、navigate('/play')される
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          対戦ロビー
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              合言葉を設定または入力
            </label>
            <input 
              type="text"
              value={key} 
              onChange={(e) => setKey(e.target.value)} 
              placeholder="例: ひみつのあいことば" 
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all transform active:scale-95"
          >
            入室してゲーム開始
          </button>
        </form>

        <button 
          onClick={() => window.history.back()} 
          className="mt-6 w-full text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          ← モード選択に戻る
        </button>
      </div>
    </div>
  );
}