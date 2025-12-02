import React from 'react';

const StartScreen = ({ onStart, onLeaderboard }) => {
  return (
    <div className="screen">
      <h1 className="text-5xl md:text-6xl text-center text-white game-font mb-8 animate-pulse" 
          style={{textShadow: '0 0 10px #0ff'}}>
        SPACE INVADERS
      </h1>
      <p className="mb-8 game-font text-gray-300">Modern Arcade Classic</p>
      
      <button onClick={onStart} className="btn btn-primary">START GAME</button>
      
      <div className="flex gap-4 mb-4">
        <button className="btn bg-purple-700 text-xs">CLASSIC</button>
        <button className="btn bg-green-600 text-xs">MODERN</button>
      </div>
      
      <div className="flex gap-4">
        <button className="btn btn-secondary" onClick={() => alert('Arrows to move, Space to fire!')}>HOW TO PLAY</button>
        <button className="btn btn-secondary" onClick={onLeaderboard}>LEADERBOARD</button>
      </div>
    </div>
  );
};

export default StartScreen;