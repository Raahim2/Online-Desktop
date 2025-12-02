import React, { useState } from 'react';

const GameOverScreen = ({ score, onRestart, onMenu }) => {
  const [name, setName] = useState('');

  const submitScore = () => {
    const newScore = { name: name || 'Player', score: score, date: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('spaceInvadersHighScores') || '[]');
    existing.push(newScore);
    existing.sort((a, b) => b.score - a.score);
    localStorage.setItem('spaceInvadersHighScores', JSON.stringify(existing.slice(0, 10)));
    onMenu(); // Go to menu (which accesses leaderboard)
  };

  return (
    <div className="screen">
      <h2 className="text-6xl text-red-600 game-font mb-6 animate-bounce">GAME OVER</h2>
      <div className="text-2xl text-white game-font mb-6">SCORE: {score}</div>
      
      <input 
        type="text" 
        placeholder="Enter Name" 
        maxLength="10" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-3 mb-6 text-black rounded game-font text-center"
      />
      
      <button onClick={submitScore} className="btn btn-primary mb-4">SUBMIT SCORE</button>
      <button onClick={onRestart} className="btn bg-gray-600 mb-4">TRY AGAIN</button>
      <button onClick={onMenu} className="btn btn-secondary">MAIN MENU</button>
    </div>
  );
};

export default GameOverScreen;