import { useNavigate } from 'react-router-dom';

export default function ModeSelect({ onSelect }) {
  const navigate = useNavigate();

  const handleSelect = (mode) => {
    // App.jsの状態を更新する（モードを記録）
    onSelect(mode);
    
    // App.js側でnavigateしても良いですが、
    // ここで直接 navigate('/lobby') などと書くことも可能です。
    // 今回は App.js の handleModeSelect を呼び出す今の形式でOKです。
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
      <h1 className="text-4xl font-extrabold text-slate-800 mb-10 tracking-wider">
        HIT & BLOW
      </h1>
      <div className="flex gap-6">
        <button 
          onClick={() => handleSelect('single')}
          className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-600 font-bold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-95"
        >
          1人で遊ぶ
        </button>
        <button 
          onClick={() => handleSelect('multi')}
          disabled={true}
          className="bg-slate-300 text-slate-500 cursor-not-allowed font-bold py-4 px-8 rounded-xl shadow-none transition-all"
        >
          2人で遊ぶ
        </button>
      </div>
      <p className="mt-8 text-slate-400 text-sm">数字を当てる論理パズルゲーム</p>
    </div>
  );
}