import React from 'react';

const LevelCompleteScreen = ({ score, bonus, onNext }) => {
  return (
    <div className="screen">
      <h2 className="text-5xl text-green-500 game-font mb-8">LEVEL COMPLETE!</h2>
      <div className="text-2xl text-white game-font mb-4">SCORE: {score}</div>
      <div className="text-xl text-yellow-400 game-font mb-8">BONUS: {bonus}</div>
      <button onClick={onNext} className="btn btn-primary">NEXT LEVEL</button>
    </div>
  );
};

export default LevelCompleteScreen;