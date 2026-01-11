import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ModeSelect from './components/ModeSelect';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

function AppContent() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [keyword, setKeyword] = useState("");

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'single') {
      navigate('/playing'); // URLを /playing に変更
    } else {
      navigate('/lobby');   // URLを /lobby に変更
    }
  };

  const handleJoin = (key) => {
    setKeyword(key);
    navigate('/playing');
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ModeSelect onSelect={handleModeSelect} />} />
        <Route path="/lobby" element={<Lobby onJoin={handleJoin} />} />
        <Route path="/playing" element={<GameBoard mode={mode} keyword={keyword} />} />
      </Routes>
    </div>
  );
}

// Routerで全体を囲む必要があるため、親コンポーネントを分けるのが一般的です
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}