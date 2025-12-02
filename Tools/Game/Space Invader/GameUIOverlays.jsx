import React from 'react';

const GameUIOverlays = ({ paused }) => {
  return (
    <>
      {/* Pause Indicator */}
      <div id="pauseIndicator" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl game-font hidden z-20">
        PAUSED
      </div>
      
      {/* Power Up Container - Logic injects here via DOM manipulation in main file */}
      <div id="powerUpIndicator" className="absolute top-2 right-2 flex flex-col items-end z-10 text-white game-font"></div>
      
      {/* Controls Helper */}
      <div className="absolute bottom-4 left-4 text-white text-xs game-font opacity-50 hidden md:block">
        MOVE: ←/→ <br/> FIRE: SPACE <br/> PAUSE: P
      </div>
    </>
  );
};

export default GameUIOverlays;