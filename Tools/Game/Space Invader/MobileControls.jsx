import React from 'react';

const MobileControls = ({ onInput }) => {
  const btnStyle = "w-16 h-16 bg-white bg-opacity-20 rounded-full flex justify-center items-center text-white text-2xl active:bg-opacity-40 select-none";

  return (
    <div className="flex justify-between w-full max-w-lg mx-auto">
      <div 
        className={btnStyle}
        onTouchStart={() => onInput('left', true)}
        onTouchEnd={() => onInput('left', false)}
        onMouseDown={() => onInput('left', true)}
        onMouseUp={() => onInput('left', false)}
      >←</div>
      
      <div 
        className={`${btnStyle} bg-red-500 bg-opacity-40`}
        onTouchStart={() => onInput('fire', true)}
        onTouchEnd={() => onInput('fire', false)}
        onMouseDown={() => onInput('fire', true)}
        onMouseUp={() => onInput('fire', false)}
      >◎</div>

      <div 
        className={btnStyle}
        onTouchStart={() => onInput('right', true)}
        onTouchEnd={() => onInput('right', false)}
        onMouseDown={() => onInput('right', true)}
        onMouseUp={() => onInput('right', false)}
      >→</div>
    </div>
  );
};

export default MobileControls;